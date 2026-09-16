import { cn } from '../../lib/utils';

/**
 * One spinner. The app previously had four hand-rolled variants, each with a
 * different border width and at least one with a garbled `border-primary4`
 * class that rendered no ring at all.
 *
 * Now angular: `.spinner-square` ticks a square edge around in 90° steps -
 * the system has no arcs, so neither does its loading state.
 */

const SIZES = {
  sm: 'size-4',
  md: 'size-6',
  lg: 'size-8',
} as const;

export function Spinner({
  size = 'md',
  className,
  label = 'Loading',
}: {
  size?: keyof typeof SIZES;
  className?: string;
  label?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('spinner-square inline-block', SIZES[size], className)}
    />
  );
}

export function SpinnerBlock({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-foreground-muted">
      <Spinner size="lg" label={label} />
    </div>
  );
}
