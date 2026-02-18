import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

const POS_COLORS: Record<string, string> = {
  C: "bg-purple-600 text-white border-purple-600",
  "1B": "bg-blue-600 text-white border-blue-600",
  "2B": "bg-blue-500 text-white border-blue-500",
  SS: "bg-blue-700 text-white border-blue-700",
  "3B": "bg-blue-400 text-white border-blue-400",
  OF: "bg-green-600 text-white border-green-600",
  DH: "bg-slate-500 text-white border-slate-500",
  UTIL: "bg-slate-400 text-white border-slate-400",
  SP: "bg-red-600 text-white border-red-600",
  RP: "bg-orange-500 text-white border-orange-500",
  BN: "bg-muted text-muted-foreground",
  IL: "bg-destructive text-destructive-foreground border-destructive",
  "IL+": "bg-destructive text-destructive-foreground border-destructive",
};

interface PositionBadgeProps {
  position: string;
  className?: string;
}

export function PositionBadge({ position, className }: PositionBadgeProps) {
  const colorClass = POS_COLORS[position] || "";
  return (
    <Badge variant="outline" className={cn("text-xs px-1.5", colorClass, className)}>
      {position}
    </Badge>
  );
}
