/**
 * ChromeGlowButton - Metallic cyan sci-fi CTA button adapted from
 * Pixel Perfect (buttons/blue-chrome-button.tsx & buttons/border-gradient-button.tsx).
 *
 * Implements Nordic Lagom principles:
 * - Quiet chrome styling with subtle metallic cyan hairline edge
 * - Interactive cursor-following specular highlight
 * - 1-2px translateY on hover, zero cartoonish scale pulsing
 * - Clear focus ring for accessibility
 */

import React, { useRef, useState, memo } from 'react';
import { cn } from '@/lib/utils';

interface ChromeGlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  glowColor?: string;
  size?: 'md' | 'lg';
}

export const ChromeGlowButton = memo(function ChromeGlowButton({
  children,
  className,
  variant = 'primary',
  glowColor = '#0284C7',
  size = 'lg',
  ...props
}: ChromeGlowButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <button
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'group relative inline-flex items-center justify-center gap-2.5 overflow-hidden transition-all duration-200 cursor-pointer select-none font-medium outline-none',
        // Focus state
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        // Sizing
        size === 'lg' ? 'h-11 px-7 text-sm' : 'h-9 px-4 text-xs',
        // Hover translateY
        'hover:-translate-y-0.5 active:translate-y-0',
        // Variant styling
        variant === 'primary'
          ? 'bg-primary text-primary-foreground font-semibold shadow-xs hover:shadow-[0_0_20px_rgba(2,132,199,0.3)]'
          : 'border border-border bg-white/90 text-foreground hover:border-primary/50 hover:bg-surface shadow-xs',
        className
      )}
      {...props}
    >
      {/* ── Metallic Specular Border Sheen (hairline overlay) ── */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border border-white/20 transition-opacity duration-300"
        style={{
          background: isHovered
            ? `radial-gradient(circle 80px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 255, 0.25), transparent 100%)`
            : undefined,
        }}
      />

      {/* ── Subtle Ambient Inner Sheen ── */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 100px at ${mousePos.x}% ${mousePos.y}%, rgba(2, 132, 199, 0.15), transparent 70%)`,
        }}
      />

      {/* Button content */}
      <span className="relative z-1 flex items-center gap-2">{children}</span>
    </button>
  );
});
