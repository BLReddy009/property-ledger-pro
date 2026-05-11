"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

export function UploadBox({ canUpload = true }: { canUpload?: boolean }) {
  const [name, setName] = useState("");

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
    form.append("category", "INVOICE");
    await fetch("/api/uploads", { method: "POST", body: form });
  }

  return (
    <label className={`flex flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900 ${canUpload ? "cursor-pointer hover:border-pine" : "cursor-not-allowed opacity-70"}`}>
      <Upload className="mb-3 text-pine" />
      <span className="font-semibold">{canUpload ? "Upload invoices, bills, agreements, photos" : "Uploads disabled for read-only access"}</span>
      <span className="mt-1 text-sm text-slate-500">{name || "PDF, JPG, PNG, or receipt images"}</span>
      <input type="file" className="hidden" onChange={onChange} disabled={!canUpload} />
    </label>
  );
}
