import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import type { AppIcon } from "@/shared/icons";

interface EmptyStateProps {
  icon?: AppIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {Icon && <div className="rounded-full bg-muted p-3 mb-3"><Icon className="h-10 w-10 text-muted-foreground/50" /></div>}
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && (
        <Button variant="outline" size="sm" onClick={action.onClick} className="mt-3">
          {action.label}
        </Button>
      )}
    </div>
  );
}
