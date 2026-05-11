import { AppShell } from "@/components/app-shell";
import { TankerTrendChart } from "@/components/charts";
import { PageTitle } from "@/components/page-title";
import { currency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WaterTankersPage() {
  const logs = await prisma.waterTankerLog.findMany({ include: { property: true }, orderBy: { date: "desc" } }).catch(() => []);
  return (
    <AppShell>
      <PageTitle title="Water Tankers" description="Vendor, liters, tanker count, cost trends, seasonal comparison, paid/unpaid status, and uploaded bills." />
      <section className="mb-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <TankerTrendChart />
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {logs.map((log) => (
          <article key={log.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <h2 className="font-semibold">{log.vendorName}</h2>
            <p className="text-sm text-slate-500">{log.property.name} • {log.date.toLocaleDateString()}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{log.tankers} tankers</span>
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{log.litersSupplied.toLocaleString()} L</span>
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{currency(log.totalCost.toString())}</span>
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{log.paid ? "Paid" : "Unpaid"}</span>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
