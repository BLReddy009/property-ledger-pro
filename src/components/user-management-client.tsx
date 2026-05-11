"use client";

import { Plus, Save } from "lucide-react";
import { useState } from "react";

type FlatOption = {
  id: string;
  flatNumber: string;
  tenantName: string | null;
  property: { name: string };
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  flatId: string | null;
  flat: null | {
    flatNumber: string;
    tenantName: string | null;
    property: { name: string };
  };
};

const roles = [
  { value: "OWNER_ADMIN", label: "Owner/Admin" },
  { value: "ACCOUNTANT_MANAGER", label: "Accountant/Manager" },
  { value: "READ_ONLY_VIEWER", label: "Read-only Viewer" },
  { value: "TENANT", label: "Tenant" }
];

function roleName(role: string) {
  return roles.find((item) => item.value === role)?.label ?? role;
}

export function UserManagementClient({
  initialUsers,
  flats,
  canCreate
}: {
  initialUsers: UserRow[];
  flats: FlatOption[];
  canCreate: boolean;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [role, setRole] = useState("TENANT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function createUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role,
        flatId: role === "TENANT" ? form.get("flatId") : undefined
      })
    });
    setSaving(false);

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.message || "Could not create user login.");
      return;
    }

    setUsers((items) => [result, ...items]);
    event.currentTarget.reset();
    setRole("TENANT");
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e] lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold">User logins</h2>
        <span className="text-sm text-slate-500">{users.length} active</span>
      </div>

      {canCreate && (
        <form onSubmit={createUser} className="mt-4 grid gap-3 lg:grid-cols-5">
          <input name="name" placeholder="Name" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="text" placeholder="Password" minLength={8} defaultValue="Demo@12345" required />
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {roles.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {role === "TENANT" ? (
            <select name="flatId" required>
              <option value="">Assign flat</option>
              {flats.map((flat) => (
                <option key={flat.id} value={flat.id}>
                  {flat.property.name} / {flat.flatNumber} - {flat.tenantName || "Tenant"}
                </option>
              ))}
            </select>
          ) : (
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white">
              <Save size={16} /> {saving ? "Saving" : "Create login"}
            </button>
          )}
          {role === "TENANT" && (
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2 text-sm font-semibold text-white lg:col-start-5">
              <Save size={16} /> {saving ? "Saving" : "Create login"}
            </button>
          )}
        </form>
      )}

      {!canCreate && <p className="mt-3 rounded-md bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-900">Only Owner/Admin users can add logins.</p>}

      {error && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-3">User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Assigned flat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-3 font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>{roleName(user.role)}</td>
                <td>
                  {user.flat
                    ? `${user.flat.property.name} / ${user.flat.flatNumber} - ${user.flat.tenantName || "Tenant"}`
                    : "-"}
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-500">
                  <Plus size={16} className="mr-2 inline" /> No user logins yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
