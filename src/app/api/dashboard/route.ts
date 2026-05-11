import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  await requireUser();
  const [rent, buildingExpenses, flatExpenses, flats, overdue, assets, notifications] =
    await Promise.all([
      prisma.rentPayment.aggregate({ _sum: { receivedAmount: true, expectedAmount: true } }),
      prisma.buildingExpense.aggregate({ _sum: { amount: true } }),
      prisma.expenseRecord.aggregate({ _sum: { amount: true } }),
      prisma.flat.findMany({ select: { status: true } }),
      prisma.rentPayment.count({ where: { status: { in: ["PENDING", "OVERDUE", "PARTIALLY_PAID"] } } }),
      prisma.asset.count({
        where: {
          warrantyExpiry: {
            gte: new Date(),
            lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45)
          }
        }
      }),
      prisma.notification.findMany({ where: { read: false }, orderBy: { dueDate: "asc" }, take: 8 })
    ]);

  const expected = Number(rent._sum.expectedAmount ?? 0);
  const collected = Number(rent._sum.receivedAmount ?? 0);
  const expenses = Number(buildingExpenses._sum.amount ?? 0) + Number(flatExpenses._sum.amount ?? 0);
  const occupied = flats.filter((flat) => flat.status === "OCCUPIED").length;

  return NextResponse.json({
    collected,
    expected,
    pending: Math.max(expected - collected, 0),
    expenses,
    profit: collected - expenses,
    occupancyRate: flats.length ? (occupied / flats.length) * 100 : 0,
    overdue,
    expiringWarranties: assets,
    notifications
  });
}
