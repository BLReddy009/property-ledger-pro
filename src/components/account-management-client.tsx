"use client";

import { Save } from "lucide-react";
import { useState } from "react";

type AccountRow = {
  id: string;
  name: string;
  type: string;
  property: { id: string; name: string } | null;
};

export function AccountManagementClient({
  initialAccounts,
  canManage
}: {
  initialAccounts: AccountRow[];
  canManage: boolean;
}) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const grouped = accounts.reduce<Record<string, { propertyName: string; accounts: AccountRow[] }>>((items, account) => {
    const key = account.property?.id ?? "global";
    items[key] ??= { propertyName: account.property?.name ?? "Unassigned accounts", accounts: [] };
    items[key].accounts.push(account);
    return items;
  }, {});

  async function updateAccount(event: React.FormEvent<HTMLFormElement>, accountId: string) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") || "").trim();

    setError("");
    setSuccess("");
    setSavingId(accountId);

    const response = await fetch(`/api/accounts/${accountId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name })
    });

    setSavingId("");
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setError(result?.message || "Could not update account name.");
      return;
    }

    setAccounts((items) => items.map((account) => (account.id === accountId ? result : account)));
    setSuccess("Account name updated.");
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e] lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">Account names</h2>
        <span className="text-sm text-slate-500">{accounts.length} accounts</span>
      </div>

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
      {success && <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">{success}</p>}

      <div className="mt-4 space-y-4">
        {Object.entries(grouped).map(([propertyId, group]) => (
          <div key={propertyId} className="rounded-md bg-slate-50 p-3 dark:bg-slate-900">
            <h3 className="text-sm font-semibold">{group.propertyName}</h3>
            <div className="mt-3 grid gap-3">
              {group.accounts.map((account) => (
                <form key={account.id} onSubmit={(event) => updateAccount(event, account.id)} className="grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                  <input name="name" defaultValue={account.name} disabled={!canManage || savingId === account.id} aria-label={`${account.type} account name`} />
                  <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-[#151b1e]">
                    {account.type.replaceAll("_", " ")}
                  </span>
                  <button
                    disabled={!canManage || savingId === account.id}
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={16} /> {savingId === account.id ? "Saving" : "Save"}
                  </button>
                </form>
              ))}
            </div>
          </div>
        ))}

        {!accounts.length && (
          <p className="rounded-md bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-900">
            Create a property first. Its default accounts will appear here.
          </p>
        )}
      </div>
    </section>
  );
}
