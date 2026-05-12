"use client";

import { Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { currency } from "@/lib/format";

type FlatOption = { id: string; flatNumber: string; tenantName: string | null; property: { name: string } };
type AccountOption = { id: string; name: string };
type ExpenseRow = {
  id: string;
  category: string;
  title: string;
  vendor: string | null;
  amount: { toString(): string } | string | number;
  warranty: boolean;
  flat: FlatOption;
  account: AccountOption | null;
};

export function FlatExpensesClient({
  initialExpenses,
  flats,
  accounts,
  canManage
}: {
  initialExpenses: ExpenseRow[];
  flats: FlatOption[];
  accounts: AccountOption[];
  canManage: boolean;
}) {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError("");
    setSaving(true);
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flatId: form.get("flatId"),
        accountId: form.get("accountId") || undefined,
        category: form.get("category"),
        title: form.get("title"),
        description: form.get("description") || undefined,
        vendor: form.get("vendor") || undefined,
        amount: Number(form.get("amount") || 0),
        paymentDate: form.get("paymentDate"),
        method: form.get("method"),
        warranty: form.has("warranty"),
        warrantyExpiry: form.get("warrantyExpiry") || undefined,
        notes: form.get("notes") || undefined
      })
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Could not save flat expense.");
      return;
    }
    const created = await response.json();
    setExpenses((items) => [created, ...items]);
    formElement.reset();
    setOpen(false);
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        {canManage ? (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">
            <Plus size={16} /> Add expense
          </button>
        ) : (
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">Read-only access</span>
        )}
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr><th className="p-4">Flat</th><th>Category</th><th>Title</th><th>Vendor</th><th>Amount</th><th>Warranty</th><th>Paid from</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="p-4 font-medium">{expense.flat.property.name} / {expense.flat.flatNumber}</td>
                <td>{expense.category}</td>
                <td>{expense.title}</td>
                <td>{expense.vendor}</td>
                <td>{currency(expense.amount.toString())}</td>
                <td>{expense.warranty ? "Yes" : "No"}</td>
                <td>{expense.account?.name}</td>
              </tr>
            ))}
            {!expenses.length && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No flat expenses yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && canManage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={createExpense} className="w-full max-w-2xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add flat expense</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="flatId" required><option value="">Select flat</option>{flats.map((flat) => <option key={flat.id} value={flat.id}>{flat.property.name} / {flat.flatNumber}</option>)}</select>
              <select name="accountId"><option value="">Paid from account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>
              <input name="category" placeholder="Category" required />
              <input name="title" placeholder="Title" required />
              <input name="vendor" placeholder="Vendor" />
              <input name="amount" type="number" min="0" step="0.01" placeholder="Amount" required />
              <input name="paymentDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
              <select name="method" required><option value="UPI">UPI</option><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CHEQUE">Cheque</option></select>
              <label className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="checkbox" name="warranty" /> Warranty</label>
              <input name="warrantyExpiry" type="date" aria-label="Warranty expiry" />
              <textarea name="description" placeholder="Description" className="sm:col-span-2" />
              <textarea name="notes" placeholder="Notes" className="sm:col-span-2" />
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Save size={16} /> Save expense</button>
          </form>
        </div>
      )}
    </>
  );
}
