import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";

export async function GET() {
  await requireUser();
  const properties = await prisma.property.findMany({
    include: { flats: true, accounts: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(properties);
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const input = propertySchema.parse(await request.json());
    const property = await prisma.property.create({
      data: {
        ...input,
        accounts: {
          create: [
            { name: "Personal Account", type: "PERSONAL" },
            { name: "Building Account", type: "BUILDING" },
            { name: "Cash in Hand", type: "CASH" }
          ]
        }
      }
    });
    await prisma.auditLog.create({
      data: { userId: user.id, action: "CREATE", entity: "Property", entityId: property.id, after: input }
    });
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ message: "Could not save property. Please check database setup." }, { status: 500 });
  }
}
