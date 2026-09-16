import { cn } from '../../lib/utils';

/**
 * Progress. One height, one radius, one fill colour - the caller may swap the
 * fill to a semantic colour when the number itself is the message.
 */

export function Progress({
  value,
  max = 100,
  className,
  fillClassName = 'bg-primary',
  label,
}: {
  value: number;
  max?: number;
  className?: string;
  fillClassName?: string;
  label?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden bg-input', className)}
    >
      <div
        className={cn('h-full transition-[width] duration-300 ease-out', fillClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
