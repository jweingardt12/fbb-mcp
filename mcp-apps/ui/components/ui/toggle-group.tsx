import * as React from "react";
import { cn } from "../../lib/utils";

interface ToggleGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function ToggleGroup({ value, onValueChange, children, className }: ToggleGroupProps) {
  return (
    <div className={cn("inline-flex items-center rounded-md border bg-muted p-0.5 gap-0.5", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue: value, onValueChange });
        }
        return child;
      })}
    </div>
  );
}

interface ToggleGroupItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
}

function ToggleGroupItem({ value, children, className, activeValue, onValueChange }: ToggleGroupItemProps) {
  const isActive = activeValue === value;
  return (
    <button
      type="button"
      onClick={() => onValueChange && onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
        isActive ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
