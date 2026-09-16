/**
 * TextMatrixDecode - Sci-fi cryptographic telemetry text reveal adapted from
 * Pixel Perfect (text/text-matrix-rain.tsx and text/text-reveal2.tsx).
 *
 * Scrambles numbers, badges, and technical labels through psychometric
 * and mathematical glyphs (θ, λ, Δ, α, β, 0-9, etc.) before smoothly
 * locking into the resolved text.
 */

import { useState, useEffect, useRef, memo } from 'react';
import { cn } from '@/lib/utils';

interface TextMatrixDecodeProps {
  children: string;
  className?: string;
  accentClassName?: string;
  duration?: number;
  delay?: number;
  trigger?: 'in-view' | 'mount' | 'hover';
  scrambleChars?: string;
}

const DEFAULT_CHARS = '0123456789θλΔαβ∑ΨΩ#*<>:/+=§';

export const TextMatrixDecode = memo(function TextMatrixDecode({
  children,
  className,
  accentClassName = 'text-primary',
  duration = 1.0,
  delay = 0,
  trigger = 'in-view',
  scrambleChars = DEFAULT_CHARS,
}: TextMatrixDecodeProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isScrambling, setIsScrambling] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const hasAnimatedRef = useRef(false);
  const animFrameIdRef = useRef<number | null>(null);
  const timeoutIdRef = useRef<number | null>(null);
  const prevChildrenRef = useRef(children);

  const cancelScheduled = () => {
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (animFrameIdRef.current !== null) {
      window.cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
  };

  const startScramble = () => {
    cancelScheduled();
    // Respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayText(children);
      setIsScrambling(false);
      return;
    }

    setIsScrambling(true);
    const target = children;
    const length = target.length;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1.0);

      // Lock-in position progresses from left to right with a soft stagger
      const lockedCharsCount = Math.floor(progress * length);

      let scrambled = '';
      for (let i = 0; i < length; i++) {
        if (target[i] === ' ' || target[i] === '\n') {
          scrambled += target[i];
        } else if (i < lockedCharsCount) {
          scrambled += target[i];
        } else {
          const randomIndex = Math.floor(Math.random() * scrambleChars.length);
          scrambled += scrambleChars[randomIndex];
        }
      }

      setDisplayText(scrambled);

      if (progress < 1.0) {
        animFrameIdRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayText(target);
        setIsScrambling(false);
        animFrameIdRef.current = null;
      }
    };

    if (delay > 0) {
      timeoutIdRef.current = window.setTimeout(() => {
        animFrameIdRef.current = requestAnimationFrame(tick);
      }, delay * 1000);
    } else {
      animFrameIdRef.current = requestAnimationFrame(tick);
    }
  };

  useEffect(() => {
    if (prevChildrenRef.current !== children) {
      prevChildrenRef.current = children;
      hasAnimatedRef.current = false;
      setDisplayText(children);
    }

    if (trigger === 'mount') {
      startScramble();
      return () => cancelScheduled();
    }

    if (trigger === 'in-view') {
      const el = containerRef.current;
      if (!el) return () => cancelScheduled();

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !hasAnimatedRef.current) {
            hasAnimatedRef.current = true;
            startScramble();
          }
        },
        { threshold: 0.2 }
      );

      observer.observe(el);
      return () => {
        observer.disconnect();
        cancelScheduled();
      };
    }

    return () => cancelScheduled();
  }, [children, trigger, duration, delay]);

  const handleMouseEnter = () => {
    if (trigger === 'hover' && !isScrambling) {
      startScramble();
    }
  };

  return (
    <span
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={cn(
        'inline-block font-mono tracking-wide transition-colors duration-150',
        isScrambling && accentClassName,
        className
      )}
      aria-label={children}
    >
      {displayText}
    </span>
  );
});
