import { NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { flatSchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  await requireUser();
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get("propertyId") ?? undefined;
  const flats = await prisma.flat.findMany({
    where: { propertyId },
    include: { property: true, rentPayments: { orderBy: { receivedDate: "desc" }, take: 3 } },
    orderBy: [{ property: { name: "asc" } }, { flatNumber: "asc" }]
  });
  return NextResponse.json(flats);
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const input = flatSchema.parse(await request.json());
    const flat = await prisma.flat.create({ data: input, include: { property: true } });
    await recordAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "Flat",
      entityId: flat.id,
      after: input
    });
    return NextResponse.json(flat, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Check the flat number, rent, deposit, and tenant email." }, { status: 400 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "This flat number already exists for the selected property." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ message: "Could not save flat. Please check database setup." }, { status: 500 });
  }
}
