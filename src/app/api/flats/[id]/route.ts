import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { ZodError } from "zod";
import { recordAuditLog } from "@/lib/audit";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rentRevisionSchema, vacateFlatSchema } from "@/lib/validations";

type RouteContext = { params: Promise<{ id: string }> };

function money(value: unknown) {
  return Number(value ?? 0);
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await requireUser([Role.OWNER_ADMIN, Role.ACCOUNTANT_MANAGER]);
    const { id } = await context.params;
    const body = await request.json();
    const action = String(body.action || "");

    const flat = await prisma.flat.findUnique({ where: { id } });
    if (!flat) {
      return NextResponse.json({ message: "Flat not found." }, { status: 404 });
    }

    if (action === "REVISE_RENT") {
      const input = rentRevisionSchema.parse(body);
      const currentRent = money(flat.monthlyRent);
      const nextRent = input.mode === "PERCENT"
        ? Math.round(currentRent * (1 + money(input.percent) / 100))
        : money(input.newRent);

      const updated = await prisma.flat.update({
        where: { id },
        data: {
          monthlyRent: nextRent,
          rentIncreasePct: input.mode === "PERCENT" ? input.percent : flat.rentIncreasePct,
          lastRentRevisionAt: input.effectiveDate
        },
        include: { property: true }
      });
      await recordAuditLog({
        userId: user.id,
        action: "REVISE_RENT",
        entity: "Flat",
        entityId: id,
        before: { monthlyRent: flat.monthlyRent },
        after: { monthlyRent: nextRent, effectiveDate: input.effectiveDate }
      });
      return NextResponse.json(updated);
    }

    if (action === "VACATE") {
      const input = vacateFlatSchema.parse(body);
      const monthlyRent = money(flat.monthlyRent);
      const standardDeductions = [
        input.includePaintingCleaning ? { title: "Painting and cleaning charges", amount: monthlyRent, notes: "Agreement clause 8(c): one month rent." } : null,
        input.includeEarlyVacatePenalty ? { title: "Early vacating penalty", amount: monthlyRent, notes: "Agreement clause 9: one month rent before agreement completion." } : null,
        input.pendingRent > 0 ? { title: "Pending rent", amount: input.pendingRent, notes: "Pending rent till vacating date." } : null
      ].filter((item): item is { title: string; amount: number; notes: string } => Boolean(item));
      const deductions = [...standardDeductions, ...input.deductions];
      const totalDeductions = deductions.reduce((sum, item) => sum + money(item.amount), 0);
      const depositRefundAmount = Math.max(money(flat.securityDeposit) - totalDeductions, 0);
      const excessRecoverable = Math.max(totalDeductions - money(flat.securityDeposit), 0);

      const updated = await prisma.flat.update({
        where: { id },
        data: {
          status: "VACANT",
          leaseEnd: input.vacatedAt,
          vacatedAt: input.vacatedAt,
          depositDeductions: {
            deductions,
            totalDeductions,
            depositAmount: money(flat.securityDeposit),
            refundAmount: depositRefundAmount,
            excessRecoverable,
            calculatedAt: new Date().toISOString(),
            notes: input.notes || undefined
          },
          depositRefundAmount,
          tenantName: null,
          tenantPhone: null,
          tenantEmail: null,
          notes: [flat.notes, input.notes ? `Vacated: ${input.notes}` : "Vacated"].filter(Boolean).join("\n")
        },
        include: { property: true }
      });
      await recordAuditLog({
        userId: user.id,
        action: "VACATE",
        entity: "Flat",
        entityId: id,
        before: { status: flat.status, securityDeposit: flat.securityDeposit },
        after: { deductions, depositRefundAmount, excessRecoverable }
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ message: "Unsupported flat action." }, { status: 400 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Check the rent revision or vacating calculation details." }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Could not update flat." }, { status: 500 });
  }
}
