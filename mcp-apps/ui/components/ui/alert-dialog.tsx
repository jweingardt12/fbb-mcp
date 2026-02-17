import * as React from "react";
import { Loader2 } from "@/shared/icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AlertDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  loading?: boolean;
}

export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
}: AlertDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />
      <div
        className={cn(
          "animate-fade-in relative z-50 w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-lg",
          "text-card-foreground"
        )}
      >
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} size="sm" onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
