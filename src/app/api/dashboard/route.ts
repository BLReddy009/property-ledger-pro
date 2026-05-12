import { NextResponse } from "next/server";
import { getDashboardMetrics } from "@/lib/dashboard-data";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export async function GET() {
  await requireUser();
  const [metrics, notifications] =
    await Promise.all([
      getDashboardMetrics(),
      prisma.notification.findMany({
        where: { read: false },
        select: { id: true, title: true, message: true, type: true, dueDate: true, read: true, createdAt: true },
        orderBy: { dueDate: "asc" },
        take: 8
      })
    ]);

  return NextResponse.json({
    collected: metrics.collected,
    expected: metrics.expected,
    pending: metrics.pending,
    expenses: metrics.expenses,
    profit: metrics.profit,
    occupancyRate: metrics.occupancyRate,
    overdue: metrics.overdue,
    expiringWarranties: metrics.expiringWarranties,
    notifications
  });
}
