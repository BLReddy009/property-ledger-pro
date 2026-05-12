import { AppShell } from "@/components/app-shell";
import { TankerTrendChart } from "@/components/charts";
import { PageTitle } from "@/components/page-title";
import { WaterTankersClient } from "@/components/water-tankers-client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRecords } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function WaterTankersPage() {
  const user = await getSession();
  const logs = await prisma.waterTankerLog.findMany({ include: { property: true }, orderBy: { date: "desc" } }).catch(() => []);
  const properties = await prisma.property.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }).catch(() => []);
  const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).catch(() => []);

  return (
    <AppShell>
      <PageTitle title="Water Tankers" description="Vendor, liters, tanker count, cost trends, seasonal comparison, paid/unpaid status, and uploaded bills." />
      <section className="mb-6 rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <TankerTrendChart />
      </section>
      <WaterTankersClient initialLogs={logs} properties={properties} accounts={accounts} canManage={canManageRecords(user?.role)} />
    </AppShell>
  );
}
