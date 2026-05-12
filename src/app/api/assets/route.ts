import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { recordAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assetSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const input = assetSchema.parse(await request.json());
    const asset = await prisma.asset.create({
      data: {
        ...input,
        propertyId: input.propertyId || undefined,
        flatId: input.flatId || undefined
      },
      include: { property: true, flat: true }
    });
    await recordAuditLog({ userId: user.id, action: "CREATE", entity: "Asset", entityId: asset.id, after: input });
    return NextResponse.json(asset, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Check the product, category, purchase date, and amount." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Could not save purchase. Please check database setup." }, { status: 500 });
  }
}
