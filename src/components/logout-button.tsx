"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      title="Logout"
      className={
        compact
          ? "grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-coral hover:text-coral disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          : "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-coral hover:text-coral disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      }
    >
      <LogOut size={16} />
      {!compact && <span>{loading ? "Signing out" : "Logout"}</span>}
    </button>
  );
}
