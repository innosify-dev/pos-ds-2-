import { Select } from '@shared/ui/Select';
import { cn } from '@utils/cn';

/**
 * Table footer — entries-per-page, range label, and page controls.
 */
export function ProductsPagination({ perPage, onPerPageChange, page, pageCount, rangeLabel, onPageChange }) {
  const go = (p) => onPageChange(Math.min(Math.max(1, p), Math.max(1, pageCount)));

  const pageButton = (p, label, disabled) => (
    <button
      key={label}
      type="button"
      disabled={disabled ?? p === page}
      onClick={() => go(p)}
      className={cn(
        'min-w-8 rounded-lg border px-2.5 py-1.5 text-xs',
        p === page
          ? 'border-accent bg-accent-muted font-semibold text-accent'
          : 'border-border bg-surface text-content hover:bg-surface-muted disabled:opacity-50'
      )}
    >
      {label}
    </button>
  );

  const numbers = [];
  for (let i = 1; i <= pageCount; i += 1) numbers.push(i);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-36">
        <Select value={String(perPage)} onChange={(e) => onPerPageChange(Number(e.target.value))} aria-label="Entries per page">
          {[10, 25, 50].map((n) => (
            <option key={n} value={n}>{`${n} entries`}</option>
          ))}
        </Select>
      </div>
      <span className="text-xs text-content">{rangeLabel}</span>
      <div className="ml-auto flex items-center gap-1.5">
        {pageButton(1, 'First', page === 1)}
        {pageButton(page - 1, 'Previous', page === 1)}
        {numbers.map((n) => pageButton(n, String(n)))}
        {pageButton(page + 1, 'Next', page === pageCount)}
        {pageButton(pageCount, 'Last', page === pageCount)}
      </div>
    </div>
  );
}
