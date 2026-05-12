import { AppShell } from "@/components/app-shell";
import { FlatsClient } from "@/components/flats-client";
import { PageTitle } from "@/components/page-title";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRecords } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function FlatsPage() {
  const user = await getSession();
  const flats = await prisma.flat.findMany({ include: { property: true }, orderBy: [{ property: { name: "asc" } }, { flatNumber: "asc" }] }).catch(() => []);
  const properties = await prisma.property.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }).catch(() => []);

  return (
    <AppShell>
      <PageTitle title="Flats" description="Tenant ledger, occupancy, lease dates, deposits, notes, and rent configuration per unit." />
      <FlatsClient initialFlats={flats} properties={properties} canManage={canManageRecords(user?.role)} />
    </AppShell>
  );
}
