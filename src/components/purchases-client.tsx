"use client";

import { Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { currency } from "@/lib/format";

type PropertyOption = { id: string; name: string };
type FlatOption = { id: string; flatNumber: string; property: PropertyOption };
type AssetRow = {
  id: string;
  productName: string;
  category: string;
  brand: string | null;
  modelNumber: string | null;
  purchaseAmount: { toString(): string } | string | number;
  warrantyExpiry: string | Date | null;
  location: string | null;
  property: PropertyOption | null;
  flat: { flatNumber: string } | null;
};

export function PurchasesClient({
  initialAssets,
  properties,
  flats,
  canManage
}: {
  initialAssets: AssetRow[];
  properties: PropertyOption[];
  flats: FlatOption[];
  canManage: boolean;
}) {
  const [assets, setAssets] = useState(initialAssets);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError("");
    setSaving(true);
    const response = await fetch("/api/assets", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        propertyId: form.get("propertyId") || undefined,
        flatId: form.get("flatId") || undefined,
        productName: form.get("productName"),
        category: form.get("category"),
        brand: form.get("brand") || undefined,
        modelNumber: form.get("modelNumber") || undefined,
        serialNumber: form.get("serialNumber") || undefined,
        purchaseDate: form.get("purchaseDate"),
        purchaseAmount: Number(form.get("purchaseAmount") || 0),
        vendorStore: form.get("vendorStore") || undefined,
        warrantyStart: form.get("warrantyStart") || undefined,
        warrantyExpiry: form.get("warrantyExpiry") || undefined,
        amcDetails: form.get("amcDetails") || undefined,
        location: form.get("location") || undefined,
        depreciationPct: form.get("depreciationPct") ? Number(form.get("depreciationPct")) : undefined,
        notes: form.get("notes") || undefined
      })
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Could not save purchase.");
      return;
    }
    const created = await response.json();
    setAssets((items) => [created, ...items]);
    formElement.reset();
    setOpen(false);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        {canManage ? (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Add purchase</button>
        ) : (
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">Read-only access</span>
        )}
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
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
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-900"><dt className="text-slate-500">Warranty</dt><dd>{asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "-"}</dd></div>
              <div className="col-span-2 rounded-md bg-slate-50 p-3 dark:bg-slate-900"><dt className="text-slate-500">Location</dt><dd>{asset.location || asset.flat?.flatNumber || asset.property?.name}</dd></div>
            </dl>
          </article>
        ))}
        {!assets.length && <p className="rounded-md bg-white p-5 text-sm text-slate-500 shadow-sm dark:bg-[#151b1e] md:col-span-2 xl:col-span-3">No purchases yet.</p>}
      </div>

      {open && canManage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={createAsset} className="w-full max-w-3xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add purchase</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="productName" placeholder="Product name" required />
              <input name="category" placeholder="Category" required />
              <input name="brand" placeholder="Brand" />
              <input name="modelNumber" placeholder="Model number" />
              <input name="serialNumber" placeholder="Serial number" />
              <input name="purchaseAmount" type="number" min="0" step="0.01" placeholder="Purchase amount" required />
              <input name="purchaseDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
              <input name="vendorStore" placeholder="Vendor/store" />
              <input name="location" placeholder="Location" />
              <select name="propertyId"><option value="">Assign building</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select>
              <select name="flatId"><option value="">Assign flat</option>{flats.map((flat) => <option key={flat.id} value={flat.id}>{flat.property.name} / {flat.flatNumber}</option>)}</select>
              <input name="depreciationPct" type="number" min="0" max="100" step="0.01" placeholder="Depreciation %" />
              <input name="warrantyStart" type="date" aria-label="Warranty start" />
              <input name="warrantyExpiry" type="date" aria-label="Warranty expiry" />
              <input name="amcDetails" placeholder="AMC details" />
              <textarea name="notes" placeholder="Notes" className="sm:col-span-3" />
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Save size={16} /> Save purchase</button>
          </form>
        </div>
      )}
    </>
  );
}
