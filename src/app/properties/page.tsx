import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { PropertiesClient } from "@/components/properties-client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({ include: { flats: true }, orderBy: { name: "asc" } }).catch(() => []);

  return (
    <AppShell>
      <PageTitle
        title="Properties"
        description="Create and manage multiple apartment buildings, facilities, accounts, and flat groups."
      />
      <PropertiesClient initialProperties={properties} />
    </AppShell>
  );
}
