import { cn } from "@/lib/utils";
import React from "react";

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
}

export function BorderGlow({ children, className }: BorderGlowProps) {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute -inset-px rounded-none bg-linear-to-r from-sky-500 via-cyan-400 to-sky-500 opacity-0 blur-xs transition duration-300 group-hover:opacity-75 group-hover:duration-150" />
      <div className="relative h-full w-full rounded-none bg-card border border-border shadow-xs">
        {children}
      </div>
    </div>
  );
}
