"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

type PropertyOption = { id: string; name: string };
type FlatOption = { id: string; flatNumber: string; property: { name: string } };

const categories = [
  "BILL",
  "INVOICE",
  "WARRANTY_CARD",
  "AMC_CONTRACT",
  "TENANT_AGREEMENT",
  "REPAIR_PHOTO",
  "RECEIPT",
  "OTHER"
];

export function UploadBox({
  canUpload = true,
  properties = [],
  flats = []
}: {
  canUpload?: boolean;
  properties?: PropertyOption[];
  flats?: FlatOption[];
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("INVOICE");
  const [propertyId, setPropertyId] = useState("");
  const [flatId, setFlatId] = useState("");

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!canUpload) {
      setName("Read-only viewers cannot upload files");
      return;
    }
    setName(file.name);
    const form = new FormData();
    form.append("file", file);
    form.append("category", category);
    if (propertyId) form.append("propertyId", propertyId);
    if (flatId) form.append("flatId", flatId);
    const response = await fetch("/api/uploads", { method: "POST", body: form });
    setName(response.ok ? `${file.name} uploaded` : "Upload failed");
  }

  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <Upload className="text-pine" />
        <div>
          <h2 className="font-semibold">{canUpload ? "Upload document" : "Uploads disabled for read-only access"}</h2>
          <p className="text-sm text-slate-500">{name || "PDF, JPG, PNG, or receipt images"}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={!canUpload}>
          {categories.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
        </select>
        {!!properties.length && (
          <select value={propertyId} onChange={(event) => setPropertyId(event.target.value)} disabled={!canUpload}>
            <option value="">Attach building</option>
            {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
          </select>
        )}
        {!!flats.length && (
          <select value={flatId} onChange={(event) => setFlatId(event.target.value)} disabled={!canUpload}>
            <option value="">Attach flat</option>
            {flats.map((flat) => <option key={flat.id} value={flat.id}>{flat.property.name} / {flat.flatNumber}</option>)}
          </select>
        )}
        <label className={`flex min-h-24 flex-col items-center justify-center rounded-md border border-slate-200 text-center text-sm dark:border-slate-700 ${canUpload ? "cursor-pointer hover:border-pine" : "cursor-not-allowed opacity-70"}`}>
          <span className="font-semibold">Choose file</span>
          <span className="mt-1 text-slate-500">Bill, agreement, photo, warranty card</span>
          <input type="file" className="hidden" onChange={onChange} disabled={!canUpload} />
        </label>
      </div>
    </div>
  );
}
