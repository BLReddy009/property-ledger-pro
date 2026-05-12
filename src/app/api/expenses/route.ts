import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { recordAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expenseRecordSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const input = expenseRecordSchema.parse(await request.json());
    const expense = await prisma.expenseRecord.create({
      data: { ...input, accountId: input.accountId || undefined },
      include: { flat: { include: { property: true } }, account: true }
    });
    await recordAuditLog({ userId: user.id, action: "CREATE", entity: "ExpenseRecord", entityId: expense.id, after: input });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Check the flat, title, amount, date, and payment method." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Could not save flat expense. Please check database setup." }, { status: 500 });
  }
}
