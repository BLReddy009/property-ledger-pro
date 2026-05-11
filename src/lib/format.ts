export function currency(value: number | string | null | undefined, code = "INR") {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0
  }).format(numeric);
}

export function percent(value: number) {
  return `${Math.round(value)}%`;
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
