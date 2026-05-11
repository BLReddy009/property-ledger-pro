import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageTitle title="Settings" description="Role access, accounts, currency, languages, backup, restore, recurring reminders, and integrations." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <h2 className="font-semibold">Access control</h2>
          <div className="mt-4 space-y-3 text-sm">
            {["Owner/Admin", "Accountant/Manager", "Read-only Viewer"].map((role) => (
              <label key={role} className="flex items-center justify-between rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                {role}
                <input type="checkbox" defaultChecked />
              </label>
            ))}
          </div>
        </section>
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <h2 className="font-semibold">Operational defaults</h2>
          <div className="mt-4 grid gap-3">
            <select><option>INR - Indian Rupee</option><option>USD - US Dollar</option></select>
            <select><option>English</option><option>Hindi</option><option>Tamil</option></select>
            <button className="rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">Save settings</button>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
