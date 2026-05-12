"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

const themeChangeEvent = "plp-theme-change";

function getPreferredDark() {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme");
  return stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribeToTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", callback);
  window.addEventListener(themeChangeEvent, callback);
  media.addEventListener("change", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeChangeEvent, callback);
    media.removeEventListener("change", callback);
  };
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeToTheme, getPreferredDark, () => false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  function toggle() {
    const next = !dark;
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
    window.dispatchEvent(new Event(themeChangeEvent));
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
