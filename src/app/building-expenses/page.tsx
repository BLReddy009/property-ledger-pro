import { AppShell } from "@/components/app-shell";
import { BuildingExpensesClient } from "@/components/building-expenses-client";
import { PageTitle } from "@/components/page-title";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRecords } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function BuildingExpensesPage() {
  const user = await getSession();
  const expenses = await prisma.buildingExpense.findMany({ include: { property: true, account: true }, orderBy: { createdAt: "desc" } }).catch(() => []);
  const properties = await prisma.property.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }).catch(() => []);
  const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).catch(() => []);

  return (
    <AppShell>
      <PageTitle title="Building Expenses" description="Separate common-expense ledger for staff salary, electricity, water, generator, AMC, CCTV, fire safety, and renewals." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["Staff", "Electricity", "Generator", "Annual Maintenance"].map((type) => (
          <section key={type} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <h2 className="font-semibold">{type}</h2>
            <p className="mt-2 text-sm text-slate-500">Use the add form below to enter and track this expense type.</p>
          </section>
        ))}
      </div>
      <div className="mt-6">
        <BuildingExpensesClient initialExpenses={expenses} properties={properties} accounts={accounts} canManage={canManageRecords(user?.role)} />
      </div>
    </AppShell>
  );
}
