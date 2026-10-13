import { forwardRef } from 'react';
import { cn } from '@utils/cn';

export const Input = forwardRef(function Input(
  { className, label, error, hint, id, trailing, ...props },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-content">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'flex h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-content shadow-sm transition',
            'placeholder:text-content-muted',
            'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            trailing && 'pr-11',
            className
          )}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-0 flex items-center">{trailing}</div>}
      </div>
      {error && <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">{error}</p>}
      {hint && !error && <p id={`${inputId}-hint`} className="mt-1 text-xs text-content-muted">{hint}</p>}
    </div>
  );
});
