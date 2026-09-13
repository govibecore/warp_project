import { cn } from "@/lib/utils";
import { motion, useScroll } from "motion/react";
import React from "react";

interface ScrollProgressProps {
  className?: string;
}

export const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(
  ({ className }, ref) => {
    const { scrollYProgress } = useScroll();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-1 origin-left bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600",
          className
        )}
        style={{ scaleX: scrollYProgress }}
      />
    );
  }
);
ScrollProgress.displayName = "ScrollProgress";
