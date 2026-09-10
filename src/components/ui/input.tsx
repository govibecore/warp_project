import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

/**
 * Form controls share one geometry: 2.5rem tall (2rem for compact),
 * one radius, one border colour, one focus treatment.
 */

const FIELD =
  'w-full rounded-[var(--radius-control)] bg-background text-foreground ' +
  'border border-border placeholder:text-foreground-muted ' +
  'transition-colors duration-150 ' +
  'focus:outline-none focus:border-primary ' +
  'disabled:cursor-not-allowed disabled:opacity-40';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  compact?: boolean;
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, compact, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        FIELD,
        compact ? 'h-8 px-3 text-sm' : 'h-10 px-3.5 text-sm',
        invalid && 'border-destructive focus:border-destructive',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid, ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        FIELD,
        'min-h-24 py-2.5 px-3.5 text-sm leading-relaxed',
        invalid && 'border-destructive focus:border-destructive',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

/**
 * A native select. The previous Radix/base-ui composite existed because it was
 * copied, not because anything needed it — the app only ever renders 2–10
 * short options in a filter bar.
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  compact?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, compact, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        FIELD,
        'cursor-pointer appearance-none bg-[length:1rem] bg-[right_0.6rem_center] bg-no-repeat pr-9',
        compact ? 'h-8 pl-3 text-sm' : 'h-10 pl-3.5 text-sm',
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = 'Select';

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

/** Label + control + hint/error, stacked on one rhythm. */
export function Field({ label, hint, error, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-foreground-muted">{hint}</p>
      ) : null}
    </div>
  );
}
