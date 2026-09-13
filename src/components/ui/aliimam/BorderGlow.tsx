import { cn } from "@/lib/utils";
import React from "react";

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
}

export function BorderGlow({ children, className }: BorderGlowProps) {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute -inset-0.5 rounded-none bg-linear-to-r from-emerald-400 via-cyan-400 to-emerald-400 opacity-0 blur transition duration-500 group-hover:opacity-100 group-hover:duration-200" />
      <div className="relative h-full w-full rounded-none bg-white dark:bg-zinc-950">
        {children}
      </div>
    </div>
  );
}
