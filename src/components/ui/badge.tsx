import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

/**
 * A badge states a fact, borrowing its colour from meaning or variant.
 * Neutral (default), primary, success, warning, danger.
 * Includes support for Ali Imam's outline badges and status dot indicators.
 */

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';
export type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface text-foreground-secondary border-border',
  primary: 'bg-primary-subtle text-primary border-primary/20',
  success: 'bg-success-subtle text-success border-success/20',
  warning: 'bg-warning-subtle text-warning border-warning/20',
  danger: 'bg-destructive-subtle text-destructive border-destructive/20',
};

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-primary text-primary-foreground border-transparent',
  secondary: 'bg-surface text-foreground-secondary border-border',
  outline: 'bg-transparent text-foreground border-border',
  destructive: 'bg-destructive text-destructive-foreground border-transparent',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  dot?: boolean;
  children?: ReactNode;
}

export function Badge({
  tone,
  variant,
  dot,
  children,
  className,
  ...props
}: BadgeProps) {
  const styleClass = variant ? VARIANTS[variant] : TONES[tone ?? 'neutral'];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2.5 py-0.5',
        'text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap',
        styleClass,
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="size-1.5 rounded-full bg-current opacity-80"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
