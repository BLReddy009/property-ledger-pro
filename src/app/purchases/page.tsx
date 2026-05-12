import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { PurchasesClient } from "@/components/purchases-client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRecords } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const user = await getSession();
  const assets = await prisma.asset.findMany({ include: { property: true, flat: true }, orderBy: { warrantyExpiry: "asc" } }).catch(() => []);
  const properties = await prisma.property.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }).catch(() => []);
  const flats = await prisma.flat.findMany({
    select: { id: true, flatNumber: true, property: { select: { id: true, name: true } } },
    orderBy: [{ property: { name: "asc" } }, { flatNumber: "asc" }]
  }).catch(() => []);

  return (
    <AppShell>
      <PageTitle title="Purchases & Warranties" description="Inventory, bills, warranty cards, AMC details, depreciation, assigned location, and service history." />
      <PurchasesClient initialAssets={assets} properties={properties} flats={flats} canManage={canManageRecords(user?.role)} />
    </AppShell>
  );
}
