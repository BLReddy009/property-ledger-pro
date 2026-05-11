import { Activity, AlertCircle, Banknote, CircleDollarSign, Home, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { ExpensePieChart, RentCollectionChart, TankerTrendChart } from "@/components/charts";
import { MetricCard } from "@/components/metric-card";
import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { currency, percent } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getDashboard() {
  try {
    const [rent, buildingExpenses, flatExpenses, flats, payments, notifications] = await Promise.all([
      prisma.rentPayment.aggregate({ _sum: { receivedAmount: true, expectedAmount: true } }),
      prisma.buildingExpense.aggregate({ _sum: { amount: true } }),
      prisma.expenseRecord.aggregate({ _sum: { amount: true } }),
      prisma.flat.findMany({ select: { status: true } }),
      prisma.rentPayment.findMany({
        include: { flat: { include: { property: true } }, account: true },
        orderBy: { receivedDate: "desc" },
        take: 6
      }),
      prisma.notification.findMany({ orderBy: { dueDate: "asc" }, take: 5 })
    ]);
    const expected = Number(rent._sum.expectedAmount ?? 0);
    const collected = Number(rent._sum.receivedAmount ?? 0);
    const expenses = Number(buildingExpenses._sum.amount ?? 0) + Number(flatExpenses._sum.amount ?? 0);
    const occupied = flats.filter((flat) => flat.status === "OCCUPIED").length;
    return {
      collected,
      pending: Math.max(expected - collected, 0),
      expenses,
      profit: collected - expenses,
      occupancy: flats.length ? (occupied / flats.length) * 100 : 0,
      payments,
      notifications
    };
  } catch {
    return { collected: 0, pending: 0, expenses: 0, profit: 0, occupancy: 0, payments: [], notifications: [] };
  }
}

export default async function DashboardPage() {
  const data = await getDashboard();

  return (
    <AppShell>
      <PageTitle
        title="Dashboard"
        description="Track rent, dues, building spend, asset risk, and property health from one calm command center."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Rent collected" value={currency(data.collected)} hint="Current dataset collection total" icon={Banknote} />
        <MetricCard label="Pending dues" value={currency(data.pending)} hint="Includes partial and overdue gaps" icon={AlertCircle} tone="red" />
        <MetricCard label="Building + flat expenses" value={currency(data.expenses)} hint="Repairs, staff, bills, tanker, AMC" icon={CircleDollarSign} tone="amber" />
        <MetricCard label="Occupancy rate" value={percent(data.occupancy)} hint="Occupied flats across all buildings" icon={Home} tone="blue" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Monthly rent collection</h2>
            <TrendingUp size={18} className="text-pine" />
          </div>
          <RentCollectionChart />
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <h2 className="mb-4 font-semibold">Expense breakdown</h2>
          <ExpensePieChart />
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <h2 className="mb-4 font-semibold">Recent rent activity</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-3">Flat</th>
                  <th>Tenant</th>
                  <th>Month</th>
                  <th>Received</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-3 font-medium">{payment.flat.property.name} / {payment.flat.flatNumber}</td>
                    <td>{payment.flat.tenantName}</td>
                    <td>{payment.month}/{payment.year}</td>
                    <td>{currency(payment.receivedAmount.toString())}</td>
                    <td>{payment.method.replaceAll("_", " ")}</td>
                    <td><StatusBadge value={payment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={18} className="text-pine" />
            <h2 className="font-semibold">Smart reminders</h2>
          </div>
          <div className="space-y-3">
            {data.notifications.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-slate-500">{item.message}</p>
              </div>
            ))}
            {!data.notifications.length && (
              <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900">No notifications yet. Seed the database to see reminders.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <h2 className="mb-4 font-semibold">Water tanker trends</h2>
        <TankerTrendChart />
      </section>
    </AppShell>
  );
}
