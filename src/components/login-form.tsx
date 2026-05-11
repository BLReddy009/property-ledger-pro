"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");

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
      setError("Could not sign in with those details.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="mb-4 block text-sm font-medium">
        Email
        <input name="email" type="email" className="mt-2 w-full" defaultValue="admin@propertyledger.pro" />
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
