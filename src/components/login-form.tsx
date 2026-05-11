"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const demos = [
  { label: "Owner/Admin", email: "admin@propertyledger.pro" },
  { label: "Accountant/Manager", email: "manager@propertyledger.pro" },
  { label: "Read-only Viewer", email: "viewer@propertyledger.pro" }
];

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [email, setEmail] = useState(demos[0].email);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password")
      })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => null);
      setError(result?.message || "Could not sign in with those details.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-5 grid gap-2">
        {demos.map((demo) => (
          <button
            key={demo.email}
            type="button"
            onClick={() => setEmail(demo.email)}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
              email === demo.email
                ? "border-pine bg-pine/10 text-pine"
                : "border-slate-200 bg-white text-slate-600 hover:border-pine/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            <span className="font-semibold">{demo.label}</span>
            <span className="text-xs">{demo.email}</span>
          </button>
        ))}
      </div>
      <label className="mb-4 block text-sm font-medium">
        Email
        <input name="email" type="email" className="mt-2 w-full" value={email} onChange={(event) => setEmail(event.target.value)} />
      </label>
      <label className="mb-6 block text-sm font-medium">
        Password
        <input name="password" type="password" className="mt-2 w-full" defaultValue="Demo@12345" />
      </label>
      {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">{error}</p>}
      <button className="w-full rounded-md bg-pine px-4 py-3 text-sm font-semibold text-white hover:bg-pine/90">
        Sign in
      </button>
    </form>
  );
}
