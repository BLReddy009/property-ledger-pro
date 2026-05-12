import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

type DashboardMetricsRow = {
  collected: unknown;
  expected: unknown;
  expenses: unknown;
  flatCount: unknown;
  occupiedCount: unknown;
  overdue: unknown;
  expiringWarranties: unknown;
};

function numeric(value: unknown) {
  return Number(value ?? 0);
}

export const getDashboardMetrics = unstable_cache(async () => {
  const rows = await prisma.$queryRaw<DashboardMetricsRow[]>`
    SELECT
      COALESCE((SELECT SUM("receivedAmount") FROM "RentPayment"), 0) AS "collected",
      COALESCE((SELECT SUM("expectedAmount") FROM "RentPayment"), 0) AS "expected",
      (
        COALESCE((SELECT SUM("amount") FROM "BuildingExpense"), 0) +
        COALESCE((SELECT SUM("amount") FROM "ExpenseRecord"), 0)
      ) AS "expenses",
      (SELECT COUNT(*) FROM "Flat") AS "flatCount",
      (SELECT COUNT(*) FROM "Flat" WHERE "status" = 'OCCUPIED') AS "occupiedCount",
      (SELECT COUNT(*) FROM "RentPayment" WHERE "status" IN ('PENDING', 'OVERDUE', 'PARTIALLY_PAID')) AS "overdue",
      (
        SELECT COUNT(*)
        FROM "Asset"
        WHERE "warrantyExpiry" >= NOW()
          AND "warrantyExpiry" <= NOW() + INTERVAL '45 days'
      ) AS "expiringWarranties"
  `;

  const row = rows[0];
  const collected = numeric(row?.collected);
  const expected = numeric(row?.expected);
  const expenses = numeric(row?.expenses);
  const flatCount = numeric(row?.flatCount);
  const occupiedCount = numeric(row?.occupiedCount);

  return {
    collected,
    expected,
    pending: Math.max(expected - collected, 0),
    expenses,
    profit: collected - expenses,
    occupancyRate: flatCount ? (occupiedCount / flatCount) * 100 : 0,
    overdue: numeric(row?.overdue),
    expiringWarranties: numeric(row?.expiringWarranties)
  };
}, ["dashboard-metrics"], { revalidate: 30 });
