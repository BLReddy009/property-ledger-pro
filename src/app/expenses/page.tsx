import { AppShell } from "@/components/app-shell";
import { FlatExpensesClient } from "@/components/flat-expenses-client";
import { PageTitle } from "@/components/page-title";
import { UploadBox } from "@/components/upload-box";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRecords } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const user = await getSession();
  const expenses = await prisma.expenseRecord.findMany({
    include: { flat: { include: { property: true } }, account: true },
    orderBy: { paymentDate: "desc" },
    take: 100
  }).catch(() => []);
  const flats = await prisma.flat.findMany({
    include: { property: true },
    orderBy: [{ property: { name: "asc" } }, { flatNumber: "asc" }]
  }).catch(() => []);
  const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).catch(() => []);
  const canManage = canManageRecords(user?.role);

  return (
    <AppShell>
      <PageTitle title="Flat Expenses" description="Track repair, service, maintenance, before/after photos, invoices, and warranties by flat." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <FlatExpensesClient initialExpenses={expenses} flats={flats} accounts={accounts} canManage={canManage} />
        <aside className="space-y-4">
          <UploadBox canUpload={canManage} />
          <div className="rounded-md border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <h2 className="font-semibold">Smart insight</h2>
            <p className="mt-2 text-slate-500">Electrical and plumbing are the highest recurring categories in the current demo ledger.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
