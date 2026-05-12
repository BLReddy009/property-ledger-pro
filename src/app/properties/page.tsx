import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { PropertiesClient } from "@/components/properties-client";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canManageRecords } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const user = await getSession();
  const properties = await prisma.property.findMany({ include: { flats: true }, orderBy: { name: "asc" } }).catch(() => []);

  return (
    <AppShell>
      <PageTitle
        title="Properties"
        description="Create and manage multiple apartment buildings, facilities, accounts, and flat groups."
      />
      <PropertiesClient initialProperties={properties} canManage={canManageRecords(user?.role)} />
    </AppShell>
  );
}
