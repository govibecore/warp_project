import * as React from "react";
import { cn } from "@/lib/utils";

type ShareBarListItemContextValue = {
  value: number;
};

const ShareBarListItemContext = React.createContext<ShareBarListItemContextValue | null>(null);

function useShareBarListItemContext(component: string) {
  const ctx = React.useContext(ShareBarListItemContext);
  if (!ctx) {
    throw new Error(`\`${component}\` must be used within \`ShareBarListItem\`.`);
  }
  return ctx;
}

export function ShareBarList({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      className={cn("relative z-10 flex w-full flex-col gap-1.5", className)}
      data-slot="share-bar-list"
      {...props}
    />
  );
}

export function ShareBarListItem({
  className,
  value,
  children,
  ...props
}: React.ComponentProps<"li"> & { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const ctx = React.useMemo(() => ({ value: clamped }), [clamped]);

  return (
    <ShareBarListItemContext.Provider value={ctx}>
      <li
        className={cn(
          "group relative flex h-9 items-center justify-between overflow-hidden px-3 border border-border/40 bg-surface/50 transition-colors hover:border-border",
          className
        )}
        data-slot="share-bar-list-item"
        {...props}
      >
        {children}
      </li>
    </ShareBarListItemContext.Provider>
  );
}

export function ShareBarListContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("z-10 flex w-full items-center justify-between gap-2 text-xs", className)}
      data-slot="share-bar-list-content"
      {...props}
    />
  );
}

export function ShareBarListLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("text-foreground font-medium truncate flex items-center gap-1.5", className)}
      data-slot="share-bar-list-label"
      {...props}
    />
  );
}

export function ShareBarListValue({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn("font-mono font-bold tabular-nums text-foreground shrink-0", className)}
      data-slot="share-bar-list-value"
      {...props}
    />
  );
}

export function ShareBarListFill({
  className,
  style,
  isHighlight = false,
  ...props
}: React.ComponentProps<"div"> & { isHighlight?: boolean }) {
  const { value } = useShareBarListItemContext("ShareBarListFill");
  
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-0 left-0 h-full border-r-2 transition-all duration-300",
        isHighlight
          ? "bg-primary/15 border-primary"
          : "bg-foreground/5 border-foreground/20",
        className
      )}
      data-slot="share-bar-list-fill"
      style={{
        ...style,
        width: `${value}%`,
      }}
      {...props}
    />
  );
}
