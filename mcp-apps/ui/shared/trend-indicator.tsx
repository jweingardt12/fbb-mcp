import { TrendingUp, TrendingDown } from "lucide-react";

interface TrendIndicatorProps {
  trend?: { direction: string; delta: string; rank?: number } | null;
}

export function TrendIndicator({ trend }: TrendIndicatorProps) {
  if (!trend) return null;
  if (trend.direction === "added") {
    return (
      <span className="inline-flex items-center gap-0.5 text-green-600 text-[10px] font-mono">
        <TrendingUp className="h-3 w-3" />
        {trend.delta}
      </span>
    );
  }
  if (trend.direction === "dropped") {
    return (
      <span className="inline-flex items-center gap-0.5 text-red-500 text-[10px] font-mono">
        <TrendingDown className="h-3 w-3" />
        {trend.delta}
      </span>
    );
  }
  return null;
}
