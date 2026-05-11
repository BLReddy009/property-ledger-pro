import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { currency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const assets = await prisma.asset.findMany({ include: { property: true, flat: true }, orderBy: { warrantyExpiry: "asc" } }).catch(() => []);
  return (
    <AppShell>
      <PageTitle title="Purchases & Warranties" description="Inventory, bills, warranty cards, AMC details, depreciation, assigned location, and service history." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => (
          <article key={asset.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{asset.productName}</h2>
                <p className="text-sm text-slate-500">{asset.brand} {asset.modelNumber}</p>
              </div>
              <span className="rounded-md bg-pine/10 px-2 py-1 text-xs font-semibold text-pine">{asset.category}</span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900"><dt className="text-slate-500">Amount</dt><dd>{currency(asset.purchaseAmount.toString())}</dd></div>
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900"><dt className="text-slate-500">Warranty</dt><dd>{asset.warrantyExpiry?.toLocaleDateString() ?? "-"}</dd></div>
              <div className="col-span-2 rounded-md bg-slate-50 p-3 dark:bg-slate-900"><dt className="text-slate-500">Location</dt><dd>{asset.location || asset.flat?.flatNumber || asset.property?.name}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
