import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { UserManagementClient } from "@/components/user-management-client";
import { getFreshSessionUser } from "@/lib/auth";
import { canManageRecords, demoUsers, roleLabel } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function SettingsPage() {
  const user = await getFreshSessionUser();
  const currentRole = roleLabel(user?.role);
  const canCreateUsers = user?.role === Role.OWNER_ADMIN;
  const accessRoles = [
    ...demoUsers,
    { role: Role.TENANT, label: "Tenant", email: "tenant login assigned to one flat" }
  ];
  const [users, flats] = await Promise.all([
    canCreateUsers
      ? prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            flatId: true,
            flat: { select: { flatNumber: true, tenantName: true, property: { select: { name: true } } } }
          },
          orderBy: { createdAt: "desc" }
        }).catch(() => [])
      : Promise.resolve([]),
    canCreateUsers
      ? prisma.flat.findMany({
          select: { id: true, flatNumber: true, tenantName: true, property: { select: { name: true } } },
          orderBy: [{ property: { name: "asc" } }, { flatNumber: "asc" }]
        }).catch(() => [])
      : Promise.resolve([])
  ]);

  return (
    <AppShell>
      <PageTitle title="Settings" description="Role access, accounts, currency, languages, backup, restore, recurring reminders, and integrations." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <h2 className="font-semibold">Access control</h2>
          <div className="mt-4 space-y-3 text-sm">
            {accessRoles.map((demo) => (
              <div key={demo.role} className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{demo.label}</span>
                  <span className="rounded-md bg-white px-2 py-1 text-xs text-slate-500 dark:bg-slate-800">
                    {currentRole === demo.label ? "Current" : demo.email}
                  </span>
                </div>
                <p className="mt-2 text-slate-500">
                  {demo.role === "OWNER_ADMIN"
                    ? "Full access to users, settings, records, exports, reminders, and uploads."
                    : demo.role === "TENANT"
                      ? "Can only view the single flat assigned to their login."
                    : canManageRecords(demo.role)
                      ? "Can create and update operating records, reminders, and uploads."
                      : "Can view dashboards, ledgers, documents, and reports without editing data."}
                </p>
              </div>
            ))}
          </div>
        </section>
        <UserManagementClient initialUsers={users} flats={flats} canCreate={canCreateUsers} />
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
