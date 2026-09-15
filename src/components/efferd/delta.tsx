import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  TrendingUp,
  ArrowUp,
  ChevronUp,
  TrendingDown,
  ArrowDown,
  ChevronDown,
} from "lucide-react";

type DeltaIconVariant = "default" | "trend" | "arrow";
type DeltaVariant = "default" | "badge";

type DeltaContextValue = {
  value: number;
};

const DeltaContext = React.createContext<DeltaContextValue | null>(null);

function useDeltaValue() {
  const context = React.useContext(DeltaContext);
  if (!context) {
    throw new Error(
      "DeltaIcon and DeltaValue must be used inside a `Delta` component."
    );
  }
  return context.value;
}

export function Delta({
  className,
  value,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  value: number;
  variant?: DeltaVariant;
  children?: React.ReactNode;
}) {
  return (
    <DeltaContext.Provider value={{ value }}>
      {variant === "badge" ? (
        <Badge
          className={cn(
            "inline-flex items-center gap-1 rounded-none border border-border/40 px-1.5 py-0.5 font-mono text-[11px] tabular-nums",
            value > 0
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              : value < 0
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              : "bg-muted/40 text-muted-foreground",
            className
          )}
          data-slot="delta"
          variant="secondary"
          {...(props as React.ComponentProps<typeof Badge>)}
        >
          {children}
        </Badge>
      ) : (
        <div
          className={cn(
            "inline-flex items-center gap-1 font-mono text-xs tabular-nums",
            value > 0 ? "text-emerald-600 dark:text-emerald-400" : "",
            value < 0 ? "text-rose-600 dark:text-rose-400" : "",
            value === 0 ? "text-muted-foreground" : "",
            className
          )}
          data-slot="delta"
          {...props}
        >
          {children}
        </div>
      )}
    </DeltaContext.Provider>
  );
}

export function DeltaIcon({
  variant = "default",
  className,
  ...props
}: Omit<React.ComponentProps<"svg">, "fill"> & {
  variant?: DeltaIconVariant;
}) {
  const resolvedValue = useDeltaValue();
  const mergedClassName = cn("size-3 shrink-0", className);

  if (!resolvedValue || resolvedValue === 0) {
    return <Minus className={mergedClassName} {...props} />;
  }

  if (resolvedValue > 0) {
    if (variant === "trend") {
      return <TrendingUp className={mergedClassName} {...props} />;
    }
    if (variant === "arrow") {
      return <ArrowUp className={mergedClassName} {...props} />;
    }
    return <ChevronUp className={mergedClassName} {...props} />;
  }

  if (variant === "trend") {
    return <TrendingDown className={mergedClassName} {...props} />;
  }
  if (variant === "arrow") {
    return <ArrowDown className={mergedClassName} {...props} />;
  }
  return <ChevronDown className={mergedClassName} {...props} />;
}

export function DeltaValue({
  className,
  precision = 1,
  suffix = "%",
  absolute = false,
  showPlus = false,
  ...props
}: React.ComponentProps<"span"> & {
  precision?: number;
  suffix?: string;
  absolute?: boolean;
  showPlus?: boolean;
}) {
  const resolvedValue = useDeltaValue();
  const val = absolute ? Math.abs(resolvedValue) : resolvedValue;
  const prefix = showPlus && resolvedValue > 0 ? "+" : "";
  const formattedValue = `${prefix}${val.toFixed(precision)}`;

  return (
    <span
      className={cn("tabular-nums font-mono", className)}
      data-slot="delta-value"
      {...props}
    >
      {formattedValue}
      {suffix}
    </span>
  );
}
