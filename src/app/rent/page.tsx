import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { RentCollectionClient } from "@/components/rent-collection-client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRecords } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function RentPage() {
  const user = await getSession();
  const payments = await prisma.rentPayment.findMany({
    include: { flat: { include: { property: true } }, account: true },
    orderBy: { receivedDate: "desc" },
    take: 100
  }).catch(() => []);
  const flats = await prisma.flat.findMany({
    include: { property: true },
    orderBy: [{ property: { name: "asc" } }, { flatNumber: "asc" }]
  }).catch(() => []);
  const accounts = await prisma.account.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).catch(() => []);

  return (
    <AppShell>
      <PageTitle
        title="Rent Collection"
        description="Use quick buttons to mark rent as collected or pending, and keep a simple remark for each flat."
      />
      <RentCollectionClient initialPayments={payments} flats={flats} accounts={accounts} canManage={canManageRecords(user?.role)} />
    </AppShell>
  );
}
