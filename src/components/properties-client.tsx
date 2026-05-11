"use client";

import { Building2, Plus, Save, X } from "lucide-react";
import { useState } from "react";

type PropertyCard = {
  id: string;
  name: string;
  address: string;
  floors: number;
  hasGenerator: boolean;
  hasWaterTanker: boolean;
  hasLift: boolean;
  hasSecurityStaff: boolean;
  flats: Array<{ id: string }>;
};

export function PropertiesClient({ initialProperties, canManage }: { initialProperties: PropertyCard[]; canManage: boolean }) {
  const [properties, setProperties] = useState(initialProperties);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createProperty(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        address: form.get("address"),
        floors: Number(form.get("floors")),
        hasGenerator: form.has("hasGenerator"),
        hasWaterTanker: form.has("hasWaterTanker"),
        hasLift: form.has("hasLift"),
        hasSecurityStaff: form.has("hasSecurityStaff"),
        hasMaintenanceStaff: form.has("hasMaintenanceStaff"),
        notes: form.get("notes") || undefined
      })
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Property was not saved. Please login again and check database setup.");
      return;
    }
    const created = await response.json();
    setProperties((items) => [{ ...created, flats: [] }, ...items]);
    setOpen(false);
    event.currentTarget.reset();
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        {canManage ? (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> New property
          </button>
        ) : (
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">
            Read-only access
          </span>
        )}
      </div>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.map((property) => (
          <article key={property.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-pine/10 text-pine"><Building2 size={18} /></span>
              <div>
                <h2 className="text-lg font-semibold">{property.name}</h2>
                <p className="mt-1 text-sm text-slate-500">{property.address}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{property.floors} floors</span>
              <span className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">{property.flats.length} flats</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {property.hasGenerator && <span className="rounded-md bg-pine/10 px-2 py-1 text-pine">Generator</span>}
              {property.hasWaterTanker && <span className="rounded-md bg-sky-100 px-2 py-1 text-sky-700">Water tanker</span>}
              {property.hasLift && <span className="rounded-md bg-amber/15 px-2 py-1 text-amber">Lift</span>}
              {property.hasSecurityStaff && <span className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">Security</span>}
            </div>
          </article>
        ))}
        {!properties.length && (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-[#151b1e] md:col-span-2 xl:col-span-3">
            <h2 className="text-lg font-semibold">Create your first property</h2>
            <p className="mt-2 text-sm text-slate-500">Add a building, enable facilities, then start adding flats, rent collections, expenses, and documents.</p>
            {canManage && (
              <button onClick={() => setOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">
                <Plus size={16} /> New property
              </button>
            )}
          </div>
        )}
      </div>

      {open && canManage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={createProperty} className="w-full max-w-2xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New property</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" placeholder="Building name" required />
              <input name="floors" type="number" min="1" placeholder="Floors" required />
              <input name="address" placeholder="Address" className="sm:col-span-2" required />
              {["hasGenerator", "hasWaterTanker", "hasLift", "hasSecurityStaff", "hasMaintenanceStaff"].map((name) => (
                <label key={name} className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700">
                  <input type="checkbox" name={name} className="h-4 w-4" />
                  {name.replace("has", "").replace(/([A-Z])/g, " $1").trim()}
                </label>
              ))}
              <textarea name="notes" placeholder="Notes" className="sm:col-span-2" />
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} /> Save property
            </button>
          </form>
        </div>
      )}
    </>
  );
}
