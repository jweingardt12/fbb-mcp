import { formatFixed } from "./number-format";

export function getTier(z: number | null): string {
  if (z == null) return "?";
  if (z >= 2.0) return "Elite";
  if (z >= 1.0) return "Strong";
  if (z >= 0) return "Solid";
  return "Below";
}

export function tierColor(z: number | null): string {
  if (z == null) return "bg-muted-foreground/30";
  if (z >= 2.0) return "bg-green-500";
  if (z >= 1.0) return "bg-blue-500";
  if (z >= 0) return "bg-yellow-500";
  return "bg-red-400";
}

export function tierTextColor(z: number | null): string {
  if (z == null) return "text-muted-foreground";
  if (z >= 2.0) return "text-green-600 dark:text-green-400";
  if (z >= 1.0) return "text-blue-600 dark:text-blue-400";
  if (z >= 0) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

export function ZScoreBar({ z }: { z: number | null }) {
  if (z == null) return <span className="text-xs text-muted-foreground">N/A</span>;
  const pct = Math.max(0, Math.min(100, ((z + 1) / 5) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex h-2 w-14 rounded-full overflow-hidden bg-muted">
        <div className={"rounded-full " + tierColor(z)} style={{ width: pct + "%" }} />
      </div>
      <span className="font-mono text-xs w-10 text-right">{formatFixed(z, 2, "0.00")}</span>
    </div>
  );
}

export function ZScoreBadge({ z, size }: { z: number | null; size?: "sm" | "md" }) {
  if (z == null) return <span className="text-xs text-muted-foreground">N/A</span>;
  const isSmall = size === "sm";
  return (
    <span className={"inline-flex items-center gap-1 rounded-md font-mono " + tierColor(z) + " text-white " + (isSmall ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs")}>
      <span className="font-medium">{getTier(z)}</span>
      <span>{formatFixed(z, 2, "0.00")}</span>
    </span>
  );
}

export function ZScoreExplainer() {
  return (
    <p className="text-[11px] text-muted-foreground">
      Z-Score: standard deviations above league average. Higher = better.
    </p>
  );
}
