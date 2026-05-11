import { cn } from "@/lib/format";

const styles: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  PARTIALLY_PAID: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  PENDING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  OCCUPIED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  VACANT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  NOTICE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  MAINTENANCE: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span className={cn("inline-flex rounded-md px-2 py-1 text-xs font-semibold", styles[value] ?? styles.PENDING)}>
      {value.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
