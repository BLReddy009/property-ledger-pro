import { FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageTitle } from "@/components/page-title";
import { UploadBox } from "@/components/upload-box";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const docs = await prisma.document.findMany({ orderBy: { createdAt: "desc" }, take: 20 }).catch(() => []);
  return (
    <AppShell>
      <PageTitle title="Documents" description="Secure storage for bills, invoices, warranty cards, contracts, agreements, photos, and receipts." />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <UploadBox />
        <div className="grid gap-3">
          {docs.map((doc) => (
            <article key={doc.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-100 text-pine dark:bg-slate-900"><FileText size={18} /></span>
                <div>
                  <h2 className="font-medium">{doc.name}</h2>
                  <p className="text-sm text-slate-500">{doc.category.replaceAll("_", " ")} • {(doc.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold dark:border-slate-700">Preview</button>
            </article>
          ))}
          {!docs.length && <p className="rounded-md bg-white p-5 text-sm text-slate-500 shadow-sm dark:bg-[#151b1e]">No documents uploaded yet.</p>}
        </div>
      </div>
    </AppShell>
  );
}
