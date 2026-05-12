"use client";

import { Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { currency } from "@/lib/format";

type PropertyOption = { id: string; name: string };
type AccountOption = { id: string; name: string };
type BuildingExpenseRow = {
  id: string;
  type: string;
  title: string;
  vendor: string | null;
  employeeName: string | null;
  dueDate: string | Date | null;
  amount: { toString(): string } | string | number;
  paid: boolean;
  property: PropertyOption;
  account: AccountOption | null;
};

export function BuildingExpensesClient({
  initialExpenses,
  properties,
  accounts,
  canManage
}: {
  initialExpenses: BuildingExpenseRow[];
  properties: PropertyOption[];
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
    const response = await fetch("/api/building-expenses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        propertyId: form.get("propertyId"),
        accountId: form.get("accountId") || undefined,
        type: form.get("type"),
        title: form.get("title"),
        vendor: form.get("vendor") || undefined,
        employeeName: form.get("employeeName") || undefined,
        role: form.get("role") || undefined,
        amount: Number(form.get("amount") || 0),
        salaryAmount: form.get("salaryAmount") ? Number(form.get("salaryAmount")) : undefined,
        advancePaid: form.get("advancePaid") ? Number(form.get("advancePaid")) : undefined,
        bonus: form.get("bonus") ? Number(form.get("bonus")) : undefined,
        billMonth: form.get("billMonth") || undefined,
        dueDate: form.get("dueDate") || undefined,
        paidDate: form.get("paidDate") || undefined,
        method: form.get("method"),
        runningHours: form.get("runningHours") ? Number(form.get("runningHours")) : undefined,
        renewalDate: form.get("renewalDate") || undefined,
        paid: form.has("paid"),
        notes: form.get("notes") || undefined
      })
    });
    setSaving(false);
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Could not save building expense.");
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
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Plus size={16} /> Add building expense</button>
        ) : (
          <span className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-900">Read-only access</span>
        )}
      </div>
      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr><th className="p-4">Building</th><th>Type</th><th>Title</th><th>Vendor/Employee</th><th>Due</th><th>Amount</th><th>Paid</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="p-4 font-medium">{expense.property.name}</td>
                <td>{expense.type}</td>
                <td>{expense.title}</td>
                <td>{expense.vendor || expense.employeeName}</td>
                <td>{expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : "-"}</td>
                <td>{currency(expense.amount.toString())}</td>
                <td>{expense.paid ? "Paid" : "Unpaid"}</td>
              </tr>
            ))}
            {!expenses.length && <tr><td colSpan={7} className="p-6 text-center text-slate-500">No building expenses yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && canManage && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={createExpense} className="w-full max-w-3xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add building expense</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <select name="propertyId" required><option value="">Select building</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select>
              <select name="accountId"><option value="">Paid from account</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</select>
              <select name="type" required><option>Staff</option><option>Electricity</option><option>Water</option><option>Generator</option><option>AMC</option><option>CCTV</option><option>Fire Safety</option><option>Other</option></select>
              <input name="title" placeholder="Title" required />
              <input name="vendor" placeholder="Vendor" />
              <input name="employeeName" placeholder="Employee name" />
              <input name="role" placeholder="Role" />
              <input name="amount" type="number" min="0" step="0.01" placeholder="Amount" required />
              <input name="billMonth" placeholder="Bill month" />
              <input name="dueDate" type="date" aria-label="Due date" />
              <input name="paidDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} aria-label="Paid date" />
              <select name="method" required><option value="UPI">UPI</option><option value="CASH">Cash</option><option value="BANK_TRANSFER">Bank transfer</option><option value="CHEQUE">Cheque</option></select>
              <input name="salaryAmount" type="number" min="0" step="0.01" placeholder="Salary amount" />
              <input name="advancePaid" type="number" min="0" step="0.01" placeholder="Advance paid" />
              <input name="bonus" type="number" min="0" step="0.01" placeholder="Bonus" />
              <input name="runningHours" type="number" min="0" step="0.01" placeholder="Running hours" />
              <input name="renewalDate" type="date" aria-label="Renewal date" />
              <label className="flex items-center gap-2 rounded-md border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="checkbox" name="paid" defaultChecked /> Paid</label>
              <textarea name="notes" placeholder="Notes" className="sm:col-span-3" />
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white"><Save size={16} /> Save expense</button>
          </form>
        </div>
      )}
    </>
  );
}
