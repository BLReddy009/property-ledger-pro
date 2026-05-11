import { LucideIcon } from "lucide-react";

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "green"
}: {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "green" | "amber" | "red" | "blue";
}) {
  const tones = {
    green: "bg-pine/10 text-pine",
    amber: "bg-amber/15 text-amber",
    red: "bg-coral/15 text-coral",
    blue: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
  };
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151b1e]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-md ${tones[tone]}`}>
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </section>
  );
}
