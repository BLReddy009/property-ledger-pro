import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { currency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BuildingExpensesPage() {
  const expenses = await prisma.buildingExpense.findMany({ include: { property: true, account: true }, orderBy: { createdAt: "desc" } }).catch(() => []);
  return (
    <AppShell>
      <PageTitle title="Building Expenses" description="Separate common-expense ledger for staff salary, electricity, water, generator, AMC, CCTV, fire safety, and renewals." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {["Staff", "Electricity", "Generator", "Annual Maintenance"].map((type) => (
          <section key={type} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <h2 className="font-semibold">{type}</h2>
            <p className="mt-2 text-sm text-slate-500">Dynamic section ready for facility-based visibility.</p>
          </section>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr><th className="p-4">Building</th><th>Type</th><th>Title</th><th>Vendor/Employee</th><th>Due</th><th>Amount</th><th>Paid</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="p-4 font-medium">{expense.property.name}</td>
                <td>{expense.type}</td>
                <td>{expense.title}</td>
                <td>{expense.vendor || expense.employeeName}</td>
                <td>{expense.dueDate?.toLocaleDateString() ?? "-"}</td>
                <td>{currency(expense.amount.toString())}</td>
                <td>{expense.paid ? "Paid" : "Unpaid"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
