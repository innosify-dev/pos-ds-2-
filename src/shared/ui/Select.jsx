import { cn } from '@utils/cn';

export function Select({ label, error, className, children, id, ...props }) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-content">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-content shadow-sm transition',
          'focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20',
          error && 'border-danger',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
