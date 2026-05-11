"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const nextDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggle}
      className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-pine dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
