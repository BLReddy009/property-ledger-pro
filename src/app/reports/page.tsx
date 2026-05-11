import { AppShell } from "@/components/app-shell";
import { ExpensePieChart, RentCollectionChart, TankerTrendChart } from "@/components/charts";
import { ExportButtons } from "@/components/export-buttons";
import { PageTitle } from "@/components/page-title";

export default function ReportsPage() {
  return (
    <AppShell>
      <PageTitle
        title="Reports"
        description="Monthly reports, yearly reports, flat statements, tenant history, profitability, print mode, PDF, and Excel exports."
        action={<ExportButtons />}
      />
      <div className="mb-6 grid gap-3 md:grid-cols-5">
        <input type="date" />
        <input type="date" />
        <select><option>All buildings</option></select>
        <select><option>All accounts</option></select>
        <select><option>INR</option><option>USD</option></select>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <h2 className="mb-4 font-semibold">Rent collection</h2>
          <RentCollectionChart />
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <h2 className="mb-4 font-semibold">Expense analysis</h2>
          <ExpensePieChart />
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e] xl:col-span-2">
          <h2 className="mb-4 font-semibold">Water tanker usage</h2>
          <TankerTrendChart />
        </section>
      </div>
    </AppShell>
  );
}
