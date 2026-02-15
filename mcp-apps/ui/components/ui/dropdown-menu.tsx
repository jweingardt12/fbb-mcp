import * as React from "react";
import { cn } from "../../lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

var DropdownMenuContext = React.createContext<DropdownMenuContextValue>({
  open: false,
  setOpen: () => {},
});

function DropdownMenu({ children }: { children: React.ReactNode }) {
  var [open, setOpen] = React.useState(false);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <span className="relative inline-flex">{children}</span>
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  var { open, setOpen } = React.useContext(DropdownMenuContext);

  return (
    <span
      className={cn("cursor-pointer", className)}
      onClick={function (e) {
        e.stopPropagation();
        setOpen(!open);
      }}
    >
      {children}
    </span>
  );
}

function DropdownMenuContent({ children, className }: { children: React.ReactNode; className?: string }) {
  var { open, setOpen } = React.useContext(DropdownMenuContext);
  var contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(function () {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return function () {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, setOpen]);

  // Adjust position if overflowing viewport
  React.useLayoutEffect(function () {
    if (!open || !contentRef.current) return;
    var el = contentRef.current;
    var rect = el.getBoundingClientRect();
    // Flip horizontally if overflowing right edge
    if (rect.right > window.innerWidth - 8) {
      el.style.left = "auto";
      el.style.right = "0";
    }
    // Constrain max height on small screens
    var maxH = window.innerHeight - rect.top - 16;
    if (maxH < rect.height) {
      el.style.maxHeight = maxH + "px";
      el.style.overflowY = "auto";
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute left-0 top-full z-50 mt-1 min-w-[180px] max-w-[calc(100vw-16px)] rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
    >
      {children}
    </div>
  );
}

function DropdownMenuItem({
  children,
  onClick,
  icon,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  var { setOpen } = React.useContext(DropdownMenuContext);

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-sm px-2 py-1.5 text-xs cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors",
        className
      )}
      onClick={function (e) {
        e.stopPropagation();
        if (onClick) onClick();
        setOpen(false);
      }}
    >
      {icon && <span className="flex-shrink-0 w-3.5 h-3.5">{icon}</span>}
      {children}
    </div>
  );
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1 h-px bg-border", className)} />;
}

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator };
