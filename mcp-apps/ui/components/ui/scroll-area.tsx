import * as React from "react";
import { cn } from "../../lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  maxHeight?: string;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, maxHeight = "400px", ...props }, ref) => (
    <div
      ref={ref}
      className={cn("overflow-auto", className)}
      style={{ maxHeight }}
      {...props}
    >
      {children}
    </div>
  )
);
ScrollArea.displayName = "ScrollArea";
export { ScrollArea };
