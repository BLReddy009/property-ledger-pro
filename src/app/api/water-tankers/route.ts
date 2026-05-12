import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { recordAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { waterTankerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const input = waterTankerSchema.parse(await request.json());
    const totalCost = input.tankers * input.costPerTanker;
    const log = await prisma.waterTankerLog.create({
      data: { ...input, accountId: input.accountId || undefined, totalCost },
      include: { property: true, account: true }
    });
    await recordAuditLog({ userId: user.id, action: "CREATE", entity: "WaterTankerLog", entityId: log.id, after: input });
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Check the building, vendor, tanker count, liters, cost, and method." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Could not save water tanker log. Please check database setup." }, { status: 500 });
  }
}
