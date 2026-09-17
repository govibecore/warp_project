import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children?: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
}: MarqueeProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      let tl: gsap.core.Tween;

      if (reverse) {
        tl = gsap.fromTo(
          ".marquee-block",
          {
            [vertical ? "y" : "x"]: "calc(-100% - 2rem)",
          },
          {
            [vertical ? "y" : "x"]: "0%",
            ease: "none",
            duration: 40,
            repeat: -1,
          }
        );
      } else {
        tl = gsap.fromTo(
          ".marquee-block",
          {
            [vertical ? "y" : "x"]: "0%",
          },
          {
            [vertical ? "y" : "x"]: "calc(-100% - 2rem)",
            ease: "none",
            duration: 40,
            repeat: -1,
          }
        );
      }

      if (pauseOnHover) {
        const handleMouseEnter = () => tl.pause();
        const handleMouseLeave = () => tl.play();
        
        container.current.addEventListener("mouseenter", handleMouseEnter);
        container.current.addEventListener("mouseleave", handleMouseLeave);
        
        return () => {
          container.current?.removeEventListener("mouseenter", handleMouseEnter);
          container.current?.removeEventListener("mouseleave", handleMouseLeave);
        };
      }
    },
    { scope: container, dependencies: [reverse, vertical, pauseOnHover] }
  );

  return (
    <div
      ref={container}
      className={cn(
        "group flex overflow-hidden p-2 gap-8",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("marquee-block flex shrink-0 justify-around gap-8", {
              "flex-row": !vertical,
              "flex-col": vertical,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}
