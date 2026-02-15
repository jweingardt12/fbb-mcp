import * as React from "react";
import { cn } from "../../lib/utils";

interface TabsContextValue { value: string; onValueChange: (v: string) => void; }
const TabsContext = React.createContext<TabsContextValue>({ value: "", onValueChange: () => {} });

function Tabs({ value, onValueChange, children, className }: {
  value: string; onValueChange: (v: string) => void; children: React.ReactNode; className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}>
      {children}
    </div>
  );
}

function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all",
        ctx.value === value ? "bg-background text-foreground shadow-sm" : "hover:text-foreground/80",
        className
      )}
      onClick={() => ctx.onValueChange(value)}
    >
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className={cn("mt-2", className)}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
