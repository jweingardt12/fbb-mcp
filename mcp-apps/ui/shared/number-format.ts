export function toFiniteNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function formatFixed(value: unknown, digits = 1, fallback = "0.0"): string {
  const num = toFiniteNumber(value, Number.NaN);
  if (!Number.isFinite(num)) return fallback;
  return num.toFixed(digits);
}

export function formatPercent(value: unknown, digits = 1, fallback = "-"): string {
  const num = toFiniteNumber(value, Number.NaN);
  if (!Number.isFinite(num)) return fallback;
  return num.toFixed(digits) + "%";
}
