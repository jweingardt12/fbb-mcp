import * as React from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

function Tooltip({ content, children, className, side = "top" }: TooltipProps) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span className={cn(
        "pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 hidden group-hover:block",
        "whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md border",
        side === "top" ? "bottom-full mb-1" : "top-full mt-1"
      )}>
        {content}
      </span>
    </span>
  );
}

export { Tooltip };
