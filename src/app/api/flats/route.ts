import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { flatSchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";

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
  const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
  const input = flatSchema.parse(await request.json());
  const flat = await prisma.flat.create({ data: input });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "CREATE", entity: "Flat", entityId: flat.id, after: input }
  });
  return NextResponse.json(flat, { status: 201 });
}
