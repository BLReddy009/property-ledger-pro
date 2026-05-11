import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { UploadBox } from "@/components/upload-box";
import { currency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await prisma.expenseRecord.findMany({ include: { flat: { include: { property: true } }, account: true }, orderBy: { paymentDate: "desc" } }).catch(() => []);
  return (
    <AppShell>
      <PageTitle title="Flat Expenses" description="Track repair, service, maintenance, before/after photos, invoices, and warranties by flat." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
              <tr><th className="p-4">Flat</th><th>Category</th><th>Title</th><th>Vendor</th><th>Amount</th><th>Warranty</th><th>Paid from</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="p-4 font-medium">{expense.flat.property.name} / {expense.flat.flatNumber}</td>
                  <td>{expense.category}</td>
                  <td>{expense.title}</td>
                  <td>{expense.vendor}</td>
                  <td>{currency(expense.amount.toString())}</td>
                  <td>{expense.warranty ? "Yes" : "No"}</td>
                  <td>{expense.account?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <aside className="space-y-4">
          <UploadBox />
          <div className="rounded-md border border-slate-200 bg-white p-5 text-sm shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <h2 className="font-semibold">Smart insight</h2>
            <p className="mt-2 text-slate-500">Electrical and plumbing are the highest recurring categories in the current demo ledger.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
