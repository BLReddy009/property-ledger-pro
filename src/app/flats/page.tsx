import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { currency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FlatsPage() {
  const flats = await prisma.flat.findMany({ include: { property: true }, orderBy: [{ property: { name: "asc" } }, { flatNumber: "asc" }] }).catch(() => []);
  return (
    <AppShell>
      <PageTitle title="Flats" description="Tenant ledger, occupancy, lease dates, deposits, notes, and rent configuration per unit." />
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr><th className="p-4">Building</th><th>Flat</th><th>Tenant</th><th>Contact</th><th>Rent</th><th>Deposit</th><th>Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {flats.map((flat) => (
              <tr key={flat.id}>
                <td className="p-4 font-medium">{flat.property.name}</td>
                <td>{flat.flatNumber}</td>
                <td>{flat.tenantName}</td>
                <td>{flat.tenantPhone}<br /><span className="text-slate-500">{flat.tenantEmail}</span></td>
                <td>{currency(flat.monthlyRent.toString())}</td>
                <td>{currency(flat.securityDeposit.toString())}</td>
                <td><StatusBadge value={flat.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
