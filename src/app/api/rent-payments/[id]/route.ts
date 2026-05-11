import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  status: z.enum(["PAID", "PARTIALLY_PAID", "PENDING", "OVERDUE"]).optional(),
  receivedAmount: z.coerce.number().min(0).optional(),
  notes: z.string().optional()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const { id } = await params;
    const input = updateSchema.parse(await request.json());
    const before = await prisma.rentPayment.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ message: "Rent payment not found" }, { status: 404 });
    }

    const payment = await prisma.rentPayment.update({
      where: { id },
      data: input,
      include: { flat: { include: { property: true } }, account: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "UPDATE",
        entity: "RentPayment",
        entityId: payment.id,
        before: JSON.parse(JSON.stringify(before)),
        after: input
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return NextResponse.json({ message: "Could not update rent collection." }, { status: 500 });
  }
}
