"use client";

import { Calculator, IndianRupee, Plus, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { currency } from "@/lib/format";

type PropertyOption = { id: string; name: string };
type FlatRow = {
  id: string;
  flatNumber: string;
  tenantName: string | null;
  tenantPhone: string | null;
  tenantEmail: string | null;
  monthlyRent: { toString(): string } | string | number;
  securityDeposit: { toString(): string } | string | number;
  leaseStart: string | Date | null;
  leaseEnd: string | Date | null;
  agreementMonths: number;
  rentIncreasePct: { toString(): string } | string | number;
  depositRefundAmount: { toString(): string } | string | number | null;
  status: string;
  property: PropertyOption;
};

const deductionLabels = [
  "Damage or repairs",
  "Lost keys or lock set",
  "Electricity or maintenance balance",
  "Other agreed deduction"
];

export function FlatsClient({
  initialFlats,
  properties,
  canManage
}: {
  initialFlats: FlatRow[];
  properties: PropertyOption[];
  canManage: boolean;
}) {
  const [flats, setFlats] = useState(initialFlats);
  const [open, setOpen] = useState(false);
  const [rentFor, setRentFor] = useState<FlatRow | null>(null);
  const [vacateFor, setVacateFor] = useState<FlatRow | null>(null);
  const [rentMode, setRentMode] = useState<"PERCENT" | "CUSTOM">("PERCENT");
  const [customRent, setCustomRent] = useState("");
  const [includePainting, setIncludePainting] = useState(true);
  const [includeEarlyPenalty, setIncludeEarlyPenalty] = useState(false);
  const [pendingRent, setPendingRent] = useState("0");
  const [deductions, setDeductions] = useState(deductionLabels.map((title) => ({ title, amount: "", notes: "" })));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const rentPreview = rentFor ? Math.round(Number(rentFor.monthlyRent) * (1 + Number(rentFor.rentIncreasePct || 5) / 100)) : 0;
  const vacateTotalDeductions = useMemo(() => {
    const monthlyRent = Number(vacateFor?.monthlyRent || 0);
    const manual = deductions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    return manual + Number(pendingRent || 0) + (includePainting ? monthlyRent : 0) + (includeEarlyPenalty ? monthlyRent : 0);
  }, [deductions, includeEarlyPenalty, includePainting, pendingRent, vacateFor]);
  const vacateRefund = Math.max(Number(vacateFor?.securityDeposit || 0) - vacateTotalDeductions, 0);
  const vacateRecoverable = Math.max(vacateTotalDeductions - Number(vacateFor?.securityDeposit || 0), 0);

  async function createFlat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError("");
    setSaving(true);
    const response = await fetch("/api/flats", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        propertyId: form.get("propertyId"),
        flatNumber: form.get("flatNumber"),
        tenantName: form.get("tenantName") || undefined,
        tenantPhone: form.get("tenantPhone") || undefined,
        tenantEmail: form.get("tenantEmail") || undefined,
        monthlyRent: Number(form.get("monthlyRent") || 0),
        securityDeposit: Number(form.get("securityDeposit") || 0),
        leaseStart: form.get("leaseStart") || undefined,
        leaseEnd: form.get("leaseEnd") || undefined,
        agreementMonths: Number(form.get("agreementMonths") || 11),
        rentIncreasePct: Number(form.get("rentIncreasePct") || 5),
        status: form.get("status"),
        notes: form.get("notes") || undefined
      })
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Could not save flat.");
      return;
    }
    const created = await response.json();
    setFlats((items) => [created, ...items]);
    formElement.reset();
    setOpen(false);
  }

  async function reviseRent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rentFor) return;
    const form = new FormData(event.currentTarget);
    setError("");
    setSaving(true);
    const response = await fetch(`/api/flats/${rentFor.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "REVISE_RENT",
        mode: rentMode,
        percent: rentMode === "PERCENT" ? Number(form.get("percent") || 5) : undefined,
        newRent: rentMode === "CUSTOM" ? Number(form.get("newRent") || 0) : undefined,
        effectiveDate: form.get("effectiveDate")
      })
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Could not revise rent.");
      return;
    }
    const updated = await response.json();
    setFlats((items) => items.map((flat) => (flat.id === updated.id ? updated : flat)));
    setRentFor(null);
    setCustomRent("");
    setRentMode("PERCENT");
  }

  async function vacateFlat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vacateFor) return;
    const form = new FormData(event.currentTarget);
    setError("");
    setSaving(true);
    const response = await fetch(`/api/flats/${vacateFor.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "VACATE",
        vacatedAt: form.get("vacatedAt"),
        includePaintingCleaning: includePainting,
        includeEarlyVacatePenalty: includeEarlyPenalty,
        pendingRent: Number(pendingRent || 0),
        deductions: deductions
          .filter((item) => Number(item.amount || 0) > 0)
          .map((item) => ({ ...item, amount: Number(item.amount || 0) })),
        notes: form.get("notes") || undefined
      })
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Could not vacate flat.");
      return;
    }
    const updated = await response.json();
    setFlats((items) => items.map((flat) => (flat.id === updated.id ? updated : flat)));
    setVacateFor(null);
    setPendingRent("0");
    setIncludePainting(true);
    setIncludeEarlyPenalty(false);
    setDeductions(deductionLabels.map((title) => ({ title, amount: "", notes: "" })));
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        {canManage ? (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Add flat</button>
        ) : (
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">Read-only access</span>
        )}
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr><th className="p-4">Building</th><th>Flat</th><th>Tenant</th><th>Contact</th><th>Rent</th><th>Deposit</th><th>Agreement</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {flats.map((flat) => (
              <tr key={flat.id}>
                <td className="p-4 font-medium">{flat.property.name}</td>
                <td>{flat.flatNumber}</td>
                <td>{flat.tenantName}</td>
                <td>{flat.tenantPhone}<br /><span className="text-slate-500">{flat.tenantEmail}</span></td>
                <td>{currency(flat.monthlyRent.toString())}</td>
                <td>{currency(flat.securityDeposit.toString())}</td>
                <td>{flat.leaseStart ? new Date(flat.leaseStart).toLocaleDateString() : "-"}<br /><span className="text-slate-500">{flat.leaseEnd ? new Date(flat.leaseEnd).toLocaleDateString() : `${flat.agreementMonths || 11} months`}</span></td>
                <td><StatusBadge value={flat.status} /></td>
                <td>
                  {canManage && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setRentFor(flat)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs font-semibold dark:border-slate-700"><IndianRupee size={14} /> Rent</button>
                      <button onClick={() => setVacateFor(flat)} className="inline-flex items-center gap-1 rounded-md border border-coral/30 px-2 py-1.5 text-xs font-semibold text-coral"><Calculator size={14} /> Vacate</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {!flats.length && <tr><td colSpan={9} className="p-6 text-center text-slate-500">No flats yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && canManage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={createFlat} className="w-full max-w-2xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add flat</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Building
                <select name="propertyId" className="mt-2 w-full" required>
                  <option value="">Select building</option>
                  {properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Flat number
                <input name="flatNumber" placeholder="Flat number" className="mt-2 w-full" required />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Status
                <select name="status" defaultValue="VACANT" className="mt-2 w-full" required>
                  <option value="VACANT">Vacant</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="NOTICE">Notice</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tenant name
                <input name="tenantName" placeholder="Tenant name" className="mt-2 w-full" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tenant phone
                <input name="tenantPhone" placeholder="Tenant phone" className="mt-2 w-full" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Tenant email
                <input name="tenantEmail" type="email" placeholder="Tenant email" className="mt-2 w-full" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Monthly rent
                <input name="monthlyRent" type="number" min="0" step="0.01" placeholder="Monthly rent" className="mt-2 w-full" required />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Security deposit
                <input name="securityDeposit" type="number" min="0" step="0.01" placeholder="Security deposit" className="mt-2 w-full" required />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Lease start
                <input name="leaseStart" type="date" className="mt-2 w-full" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Lease end
                <input name="leaseEnd" type="date" className="mt-2 w-full" />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Agreement period
                <input name="agreementMonths" type="number" min="1" defaultValue="11" className="mt-2 w-full" required />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Rent increase %
                <input name="rentIncreasePct" type="number" min="0" max="100" step="0.01" defaultValue="5" className="mt-2 w-full" required />
              </label>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
                Notes
                <textarea name="notes" placeholder="Notes" className="mt-2 w-full" />
              </label>
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Save size={16} /> Save flat</button>
          </form>
        </div>
      )}

      {rentFor && canManage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={reviseRent} className="w-full max-w-xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Update rent</h2>
                <p className="mt-1 text-sm text-slate-500">{rentFor.property.name} / {rentFor.flatNumber}</p>
              </div>
              <button type="button" onClick={() => setRentFor(null)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-3">
              <div className="rounded-md bg-slate-50 p-3 text-sm dark:bg-slate-900">
                Current rent: <span className="font-semibold">{currency(rentFor.monthlyRent.toString())}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <button type="button" onClick={() => setRentMode("PERCENT")} className={`rounded-md border px-3 py-2 text-sm font-semibold ${rentMode === "PERCENT" ? "border-pine bg-pine text-white" : "border-slate-200 dark:border-slate-700"}`}>Use 5% renewal</button>
                <button type="button" onClick={() => setRentMode("CUSTOM")} className={`rounded-md border px-3 py-2 text-sm font-semibold ${rentMode === "CUSTOM" ? "border-pine bg-pine text-white" : "border-slate-200 dark:border-slate-700"}`}>Custom amount</button>
              </div>
              {rentMode === "PERCENT" ? (
                <label className="block text-sm font-medium">
                  Increase percentage
                  <input name="percent" type="number" min="0" max="100" step="0.01" defaultValue={rentFor.rentIncreasePct?.toString() || "5"} className="mt-2 w-full" required />
                  <span className="mt-2 block text-slate-500">Preview at 5%: {currency(rentPreview)}</span>
                </label>
              ) : (
                <label className="block text-sm font-medium">
                  New monthly rent
                  <input name="newRent" type="number" min="0" step="0.01" value={customRent} onChange={(event) => setCustomRent(event.target.value)} className="mt-2 w-full" required />
                </label>
              )}
              <label className="block text-sm font-medium">
                Effective date
                <input name="effectiveDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-2 w-full" required />
              </label>
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Save size={16} /> Update rent</button>
          </form>
        </div>
      )}

      {vacateFor && canManage && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4">
          <form onSubmit={vacateFlat} className="w-full max-w-3xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Vacate and calculate deposit</h2>
                <p className="mt-1 text-sm text-slate-500">{vacateFor.property.name} / {vacateFor.flatNumber}</p>
              </div>
              <button type="button" onClick={() => setVacateFor(null)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Vacating date
                  <input name="vacatedAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-2 w-full" required />
                </label>
                <label className="block text-sm font-medium">
                  Pending rent
                  <input type="number" min="0" step="0.01" value={pendingRent} onChange={(event) => setPendingRent(event.target.value)} className="mt-2 w-full" />
                </label>
                <label className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700 sm:col-span-2">
                  <input type="checkbox" checked={includePainting} onChange={(event) => setIncludePainting(event.target.checked)} />
                  Deduct painting and cleaning charges: one month rent
                </label>
                <label className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700 sm:col-span-2">
                  <input type="checkbox" checked={includeEarlyPenalty} onChange={(event) => setIncludeEarlyPenalty(event.target.checked)} />
                  Deduct early vacating penalty: one month rent
                </label>
                {deductions.map((deduction, index) => (
                  <div key={deduction.title} className="rounded-md border border-slate-200 p-3 dark:border-slate-700 sm:col-span-2">
                    <p className="text-sm font-semibold">{deduction.title}</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-[160px_1fr]">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                        value={deduction.amount}
                        onChange={(event) => setDeductions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value } : item))}
                      />
                      <input
                        placeholder="Reason or bill reference"
                        value={deduction.notes}
                        onChange={(event) => setDeductions((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, notes: event.target.value } : item))}
                      />
                    </div>
                  </div>
                ))}
                <label className="block text-sm font-medium sm:col-span-2">
                  Settlement notes
                  <textarea name="notes" placeholder="Handover notes, meter reading, final agreement remarks" className="mt-2 w-full" />
                </label>
              </div>
              <aside className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900">
                <h3 className="font-semibold">Deposit settlement</h3>
                <dl className="mt-3 space-y-2">
                  <div className="flex justify-between gap-3"><dt>Deposit</dt><dd className="font-semibold">{currency(vacateFor.securityDeposit.toString())}</dd></div>
                  <div className="flex justify-between gap-3"><dt>Total deductions</dt><dd className="font-semibold text-coral">{currency(vacateTotalDeductions)}</dd></div>
                  <div className="flex justify-between gap-3 border-t border-slate-200 pt-2 dark:border-slate-700"><dt>Return to tenant</dt><dd className="font-semibold text-pine">{currency(vacateRefund)}</dd></div>
                  {vacateRecoverable > 0 && <div className="flex justify-between gap-3"><dt>Extra recoverable</dt><dd className="font-semibold text-coral">{currency(vacateRecoverable)}</dd></div>}
                </dl>
                <p className="mt-4 text-slate-500">Defaults are based on the agreement: one month rent for painting/cleaning, repair damages, lost keys or lock set, and early vacating penalty when selected.</p>
              </aside>
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white"><Save size={16} /> Vacate flat</button>
          </form>
        </div>
      )}
    </>
  );
}
