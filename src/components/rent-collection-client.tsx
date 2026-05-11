"use client";

import { MessageCircle, Plus, ReceiptText, Save, X } from "lucide-react";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { currency } from "@/lib/format";

type FlatOption = {
  id: string;
  flatNumber: string;
  tenantName: string | null;
  monthlyRent: { toString(): string } | string | number;
  property: { name: string };
};

type AccountOption = {
  id: string;
  name: string;
};

type RentPaymentRow = {
  id: string;
  month: number;
  year: number;
  expectedAmount: { toString(): string } | string | number;
  receivedAmount: { toString(): string } | string | number;
  status: string;
  method: string;
  notes: string | null;
  flat: FlatOption;
  account: AccountOption | null;
};

export function RentCollectionClient({
  initialPayments,
  flats,
  accounts
}: {
  initialPayments: RentPaymentRow[];
  flats: FlatOption[];
  accounts: AccountOption[];
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [open, setOpen] = useState(false);
  const [remarkFor, setRemarkFor] = useState<RentPaymentRow | null>(null);
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => {
    const expected = payments.reduce((sum, item) => sum + Number(item.expectedAmount), 0);
    const received = payments.reduce((sum, item) => sum + Number(item.receivedAmount), 0);
    return { expected, received, pending: Math.max(expected - received, 0) };
  }, [payments]);

  async function updatePayment(id: string, data: Partial<RentPaymentRow> & { receivedAmount?: number; notes?: string }) {
    setSaving(true);
    const response = await fetch(`/api/rent-payments/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    });
    setSaving(false);
    if (!response.ok) return;
    const updated = await response.json();
    setPayments((items) => items.map((item) => (item.id === id ? updated : item)));
  }

  async function createPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const flat = flats.find((item) => item.id === form.get("flatId"));
    const receivedAmount = Number(form.get("receivedAmount") || 0);
    const expectedAmount = Number(form.get("expectedAmount") || flat?.monthlyRent || 0);
    const response = await fetch("/api/rent-payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        flatId: form.get("flatId"),
        accountId: form.get("accountId") || undefined,
        month: Number(form.get("month")),
        year: Number(form.get("year")),
        expectedAmount,
        receivedAmount,
        lateFee: Number(form.get("lateFee") || 0),
        discount: Number(form.get("discount") || 0),
        method: form.get("method"),
        transactionRef: form.get("transactionRef") || undefined,
        receivedDate: form.get("receivedDate"),
        status: receivedAmount >= expectedAmount ? "PAID" : receivedAmount > 0 ? "PARTIALLY_PAID" : "PENDING",
        notes: form.get("notes") || undefined
      })
    });
    setSaving(false);
    if (!response.ok) return;
    const created = await response.json();
    const decorated = {
      ...created,
      flat,
      account: accounts.find((item) => item.id === created.accountId) ?? null
    };
    setPayments((items) => [decorated, ...items]);
    setOpen(false);
    event.currentTarget.reset();
  }

  return (
    <>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <p className="text-sm text-slate-500">Expected</p>
          <p className="mt-1 text-xl font-semibold">{currency(totals.expected)}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <p className="text-sm text-slate-500">Collected</p>
          <p className="mt-1 text-xl font-semibold text-pine">{currency(totals.received)}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-1 text-xl font-semibold text-coral">{currency(totals.pending)}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white hover:bg-pine/90">
          <Plus size={16} /> Add rent
        </button>
        <button className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900">
          <MessageCircle size={16} /> WhatsApp reminder
        </button>
        {saving && <span className="self-center text-sm text-slate-500">Saving...</span>}
      </div>

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
        <table className="w-full min-w-[1080px] text-sm">
          <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-900">
            <tr>
              <th className="p-4">Flat</th>
              <th>Tenant</th>
              <th>Month</th>
              <th>Expected</th>
              <th>Collected</th>
              <th>Status</th>
              <th>Remark</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="p-4 font-medium">{payment.flat?.property?.name} / {payment.flat?.flatNumber}</td>
                <td>{payment.flat?.tenantName}</td>
                <td>{payment.month}/{payment.year}</td>
                <td>{currency(payment.expectedAmount.toString())}</td>
                <td>{currency(payment.receivedAmount.toString())}</td>
                <td><StatusBadge value={payment.status} /></td>
                <td className="max-w-[220px] truncate text-slate-500">{payment.notes || "-"}</td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updatePayment(payment.id, { status: "PAID", receivedAmount: Number(payment.expectedAmount) })}
                      className="rounded-md bg-pine px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Collected
                    </button>
                    <button
                      onClick={() => updatePayment(payment.id, { status: "PENDING", receivedAmount: 0 })}
                      className="rounded-md bg-coral px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => setRemarkFor(payment)}
                      className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
                    >
                      Remark
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!payments.length && (
              <tr>
                <td colSpan={8} className="p-6 text-center text-slate-500">No rent records yet. Click Add rent to create the first collection entry.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form onSubmit={createPayment} className="w-full max-w-2xl rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><ReceiptText size={18} /> Add rent collection</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select name="flatId" required>
                <option value="">Select flat</option>
                {flats.map((flat) => <option key={flat.id} value={flat.id}>{flat.property.name} / {flat.flatNumber} - {flat.tenantName}</option>)}
              </select>
              <select name="accountId">
                <option value="">Select account</option>
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
              </select>
              <input name="month" type="number" min="1" max="12" placeholder="Month" defaultValue={new Date().getMonth() + 1} required />
              <input name="year" type="number" placeholder="Year" defaultValue={new Date().getFullYear()} required />
              <input name="expectedAmount" type="number" placeholder="Expected amount" required />
              <input name="receivedAmount" type="number" placeholder="Collected amount" required />
              <input name="lateFee" type="number" placeholder="Late fee" defaultValue="0" />
              <input name="discount" type="number" placeholder="Discount" defaultValue="0" />
              <select name="method" required>
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
              <input name="receivedDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
              <input name="transactionRef" placeholder="Transaction ID / cheque no." />
              <textarea name="notes" placeholder="Remark" className="sm:col-span-2" />
            </div>
            <button disabled={saving} className="mt-5 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} /> Save rent
            </button>
          </form>
        </div>
      )}

      {remarkFor && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              updatePayment(remarkFor.id, { notes: String(form.get("notes") || "") });
              setRemarkFor(null);
            }}
            className="w-full max-w-lg rounded-md bg-white p-5 shadow-soft dark:bg-[#151b1e]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add remark</h2>
              <button type="button" onClick={() => setRemarkFor(null)} className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 dark:border-slate-700"><X size={16} /></button>
            </div>
            <textarea name="notes" defaultValue={remarkFor.notes ?? ""} className="min-h-28 w-full" placeholder="Example: Tenant promised to pay balance on Friday." />
            <button className="mt-4 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">Save remark</button>
          </form>
        </div>
      )}
    </>
  );
}
