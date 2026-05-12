"use client";

import { Plus, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { currency } from "@/lib/format";

type PropertyOption = { id: string; name: string };
type AccountOption = { id: string; name: string };
type TankerRow = {
  id: string;
  vendorName: string;
  date: string | Date;
  tankers: number;
  litersSupplied: number;
  costPerTanker: { toString(): string } | string | number;
  totalCost: { toString(): string } | string | number;
  paid: boolean;
  property: PropertyOption;
};

export function WaterTankersClient({
  initialLogs,
  properties,
  accounts,
  canManage
}: {
  initialLogs: TankerRow[];
  properties: PropertyOption[];
  accounts: AccountOption[];
  canManage: boolean;
}) {
  const [logs, setLogs] = useState(initialLogs);
  const [open, setOpen] = useState(false);
  const [tankers, setTankers] = useState("1");
  const [costPerTanker, setCostPerTanker] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const total = useMemo(() => Number(tankers || 0) * Number(costPerTanker || 0), [tankers, costPerTanker]);

  async function createLog(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError("");
    setSaving(true);
    const response = await fetch("/api/water-tankers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        propertyId: form.get("propertyId"),
        accountId: form.get("accountId") || undefined,
        vendorName: form.get("vendorName"),
        date: form.get("date"),
        tankers: Number(form.get("tankers") || 0),
        litersSupplied: Number(form.get("litersSupplied") || 0),
        costPerTanker: Number(form.get("costPerTanker") || 0),
        method: form.get("method"),
        paid: form.has("paid")
      })
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Could not save water tanker log.");
      return;
    }
    const created = await response.json();
    setLogs((items) => [created, ...items]);
    formElement.reset();
    setTankers("1");
    setCostPerTanker("");
    setOpen(false);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        {canManage ? (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Add tanker log</button>
        ) : (
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">Read-only access</span>
        )}
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {logs.map((log) => (
          <article key={log.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <h2 className="font-semibold">{log.vendorName}</h2>
            <p className="text-sm text-slate-500">{log.property.name} / {new Date(log.date).toLocaleDateString()}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{log.tankers} tankers</span>
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{log.litersSupplied.toLocaleString()} L</span>
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{currency(log.totalCost.toString())}</span>
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{log.paid ? "Paid" : "Unpaid"}</span>
            </div>
          </article>
        ))}
        {!logs.length && <p className="rounded-md bg-white p-5 text-sm text-slate-500 shadow-sm dark:bg-[#151b1e] md:col-span-2 xl:col-span-3">No tanker logs yet.</p>}
      </div>

      {open && canManage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={createLog} className="w-full max-w-2xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add tanker log</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="propertyId" required><option value="">Select building</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select>
              <select name="accountId"><option value="">Paid from account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>
              <input name="vendorName" placeholder="Vendor name" required />
              <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
              <input name="tankers" type="number" min="1" value={tankers} onChange={(event) => setTankers(event.target.value)} required />
              <input name="litersSupplied" type="number" min="1" placeholder="Liters supplied" required />
              <input name="costPerTanker" type="number" min="0" step="0.01" placeholder="Cost per tanker" value={costPerTanker} onChange={(event) => setCostPerTanker(event.target.value)} required />
              <select name="method" required><option value="UPI">UPI</option><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CHEQUE">Cheque</option></select>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900">Total: {currency(total)}</div>
              <label className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="checkbox" name="paid" /> Paid</label>
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Save size={16} /> Save tanker log</button>
          </form>
        </div>
      )}
    </>
  );
}
