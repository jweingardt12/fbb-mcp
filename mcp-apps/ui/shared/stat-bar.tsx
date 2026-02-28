import { cn } from "../lib/utils";

interface StatBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
  variant?: "default" | "success" | "danger" | "warning";
}

const VARIANT_COLORS: Record<string, string> = {
  default: "bg-primary",
  success: "bg-green-500",
  danger: "bg-red-500",
  warning: "bg-yellow-500",
};

export function StatBar({ value, max = 100, className, barClassName, showLabel, label, variant = "default" }: StatBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && <span className="text-xs text-muted-foreground w-8 text-right">{label || Math.round(pct) + "%"}</span>}
      <div className="flex-1 h-2 rounded-sm overflow-hidden bg-muted" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, color-mix(in oklab, var(--color-foreground) 4%, transparent) 3px, color-mix(in oklab, var(--color-foreground) 4%, transparent) 4px)" }}>
        <div
          className={cn("h-full rounded-sm transition-all animate-bar-fill", VARIANT_COLORS[variant] || VARIANT_COLORS.default, barClassName)}
          style={{ width: pct + "%" }}
        />
      </div>
    </div>
  );
}
