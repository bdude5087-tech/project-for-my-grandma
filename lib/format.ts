// Pure formatting helpers. No I/O — safe for both server and client components.

export function formatMoney(value: number, currency = "USD"): string {
  const symbol = currency === "USD" ? "$" : currency + " ";
  return `${symbol}${value.toFixed(2)}`;
}

export function formatPricePerGb(value: number | null): string | null {
  if (value === null) return null;
  return `${formatMoney(value)}/GB`;
}

export function formatDataGb(
  dataGb: number | null,
  unlimited: boolean,
): string {
  if (unlimited) return "Unlimited";
  if (dataGb === null) return "—";
  const rounded = Math.round(dataGb * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded.toFixed(0) : rounded.toFixed(1)} GB`;
}

export function formatValidity(days: number | null): string {
  if (days === null) return "—";
  if (days < 1) return "—";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  if (days % 30 === 0) return `${Math.round(days / 30)} months`;
  if (days % 365 === 0) return `${Math.round(days / 365)} year`;
  return `${days} days`;
}

/** "2026-09-06T20:26:20Z" -> "September 6, 2026" */
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "recently";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "recently";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** "2026-09-06T20:26:20Z" -> "September 2026" */
export function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function slugifyProvider(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function comparePairParam(a: string, b: string): string {
  return `${slugifyProvider(a)}-vs-${slugifyProvider(b)}`;
}