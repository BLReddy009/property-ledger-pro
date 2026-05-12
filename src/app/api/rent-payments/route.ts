import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rentPaymentSchema } from "@/lib/validations";
import { requireUser } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  await requireUser();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const payments = await prisma.rentPayment.findMany({
    where: status ? { status: status as never } : undefined,
    include: { flat: { include: { property: true } }, account: true },
    orderBy: { receivedDate: "desc" },
    take: 100
  });
  return NextResponse.json(payments);
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const input = rentPaymentSchema.parse(await request.json());
    const payment = await prisma.rentPayment.create({
      data: input,
      include: { flat: { include: { property: true } }, account: true }
    });
    await recordAuditLog({
      userId: user.id,
      action: "CREATE",
      entity: "RentPayment",
      entityId: payment.id,
      after: input
    });
    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ message: "Could not save rent collection. Please check database setup." }, { status: 500 });
  }
}
