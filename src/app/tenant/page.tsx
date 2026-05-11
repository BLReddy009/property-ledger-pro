import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { StatusBadge } from "@/components/status-badge";
import { getSession } from "@/lib/auth";
import { currency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TenantPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== Role.TENANT) redirect("/");

  const flat = session.flatId
    ? await prisma.flat
        .findUnique({
          where: { id: session.flatId },
          include: {
            property: true,
            rentPayments: { orderBy: { receivedDate: "desc" }, take: 12 },
            expenses: { orderBy: { paymentDate: "desc" }, take: 12 },
            documents: { orderBy: { createdAt: "desc" }, take: 12 },
            assets: { orderBy: { warrantyExpiry: "asc" }, take: 12 }
          }
        })
        .catch(() => null)
    : null;

  return (
    <AppShell>
      <PageTitle
        title="My Flat"
        description="Tenant view for assigned flat details, rent history, repairs, documents, and assets."
      />

      {!flat ? (
        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <h2 className="font-semibold">No flat assigned</h2>
          <p className="mt-2 text-sm text-slate-500">Ask the owner or manager to assign your login to a flat in Settings.</p>
        </section>
      ) : (
        <div className="space-y-6">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  {flat.property.name} / Flat {flat.flatNumber}
                </h2>
                <p className="mt-1 text-sm text-slate-500">{flat.property.address}</p>
              </div>
              <StatusBadge value={flat.status} />
            </div>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                <dt className="text-sm text-slate-500">Tenant</dt>
                <dd className="font-semibold">{flat.tenantName || session.name}</dd>
              </div>
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                <dt className="text-sm text-slate-500">Contact</dt>
                <dd className="font-semibold">{flat.tenantPhone || "-"}</dd>
              </div>
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                <dt className="text-sm text-slate-500">Monthly rent</dt>
                <dd className="font-semibold">{currency(flat.monthlyRent.toString())}</dd>
              </div>
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
                <dt className="text-sm text-slate-500">Security deposit</dt>
                <dd className="font-semibold">{currency(flat.securityDeposit.toString())}</dd>
              </div>
            </dl>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
              <h2 className="mb-4 font-semibold">Rent history</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="text-left text-slate-500">
                    <tr>
                      <th className="py-3">Month</th>
                      <th>Expected</th>
                      <th>Paid</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {flat.rentPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="py-3">{payment.month}/{payment.year}</td>
                        <td>{currency(payment.expectedAmount.toString())}</td>
                        <td>{currency(payment.receivedAmount.toString())}</td>
                        <td><StatusBadge value={payment.status} /></td>
                      </tr>
                    ))}
                    {!flat.rentPayments.length && <tr><td colSpan={4} className="py-6 text-center text-slate-500">No rent records yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
              <h2 className="mb-4 font-semibold">Repairs and expenses</h2>
              <div className="space-y-3">
                {flat.expenses.map((expense) => (
                  <div key={expense.id} className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
                    <div className="flex justify-between gap-3">
                      <span className="font-medium">{expense.title}</span>
                      <span>{currency(expense.amount.toString())}</span>
                    </div>
                    <p className="mt-1 text-slate-500">{expense.category} {expense.vendor ? `- ${expense.vendor}` : ""}</p>
                  </div>
                ))}
                {!flat.expenses.length && <p className="text-sm text-slate-500">No repair records yet.</p>}
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
              <h2 className="mb-4 font-semibold">Documents</h2>
              <div className="space-y-3">
                {flat.documents.map((doc) => (
                  <div key={doc.id} className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-slate-500">{doc.category.replaceAll("_", " ")}</p>
                  </div>
                ))}
                {!flat.documents.length && <p className="text-sm text-slate-500">No documents shared for this flat yet.</p>}
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
              <h2 className="mb-4 font-semibold">Assets and warranties</h2>
              <div className="space-y-3">
                {flat.assets.map((asset) => (
                  <div key={asset.id} className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
                    <p className="font-medium">{asset.productName}</p>
                    <p className="text-slate-500">Warranty: {asset.warrantyExpiry?.toLocaleDateString() ?? "-"}</p>
                  </div>
                ))}
                {!flat.assets.length && <p className="text-sm text-slate-500">No assigned assets yet.</p>}
              </div>
            </section>
          </div>
        </div>
      )}
    </AppShell>
  );
}
