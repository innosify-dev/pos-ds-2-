import { formatCash } from '@modules/retail/data/registers.data.js';
import { cn } from '@utils/cn';

/**
 * iOS-style toggle switch.
 */
export function PaymentToggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-border-strong/50'
      )}
    >
      <span
        className={cn(
          'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all',
          checked ? 'left-6' : 'left-1'
        )}
      />
    </button>
  );
}

/**
 * Active / Inactive segmented radio.
 */
export function StatusSegmented({ value, onChange }) {
  const options = [
    { value: true, label: 'Active' },
    { value: false, label: 'Inactive' },
  ];
  return (
    <div className="grid grid-cols-2 rounded-lg border border-border" role="radiogroup" aria-label="Status">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm transition-colors',
              selected ? 'bg-accent-muted font-medium text-accent' : 'text-content-muted hover:text-content'
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 items-center justify-center rounded-full border-2',
                selected ? 'border-accent' : 'border-border-strong'
              )}
            >
              {selected && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
            </span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function CashRegisterIllustration() {
  return (
    <svg viewBox="0 0 64 48" fill="none" stroke="currentColor" strokeWidth="2" className="h-14 w-16 text-accent" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="30" width="48" height="12" rx="2" />
      <path d="M14 30v-8h10v8M36 30V18h12v12" />
      <rect x="38" y="10" width="10" height="8" rx="1" />
      <path d="M14 36h8M14 39.5h12M40 36h4M46 36h4M40 39.5h8" />
      <circle cx="52" cy="26" r="1.5" fill="currentColor" />
    </svg>
  );
}

/**
 * Live register preview card.
 */
export function RegisterPreview({ name, store, code, cashier, openingCash, isActive }) {
  const cash = openingCash === '' || openingCash === null ? null : Number(openingCash);
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-accent">Register Preview</h3>
      <div className="flex flex-col items-center rounded-xl border border-border px-6 py-8 text-center">
        <CashRegisterIllustration />
        <p className="mt-4 text-xl font-bold text-content">{name || 'New Register'}</p>
        <p className="mt-2 text-sm text-content-muted">{store || '—'}</p>
        <p className="mt-1.5 text-sm text-content-muted">{code || '—'}</p>
        <p className="mt-3 text-sm text-content-muted">
          Assigned to: <span className="font-semibold text-content">{cashier || 'Unassigned'}</span>
        </p>
        <div className="my-5 w-full border-t border-border" />
        <p className="text-sm text-content-muted">Opening Cash</p>
        <p className="mt-1 text-xl font-bold text-content">
          {cash === null || Number.isNaN(cash) ? '—' : formatCash(cash)}
        </p>
        <div className="my-5 w-full border-t border-border" />
        <p className={cn('flex items-center gap-2 text-sm font-medium', isActive ? 'text-success' : 'text-content-muted')}>
          <span className={cn('h-2.5 w-2.5 rounded-full', isActive ? 'bg-success' : 'bg-border-strong')} />
          {isActive ? 'Active' : 'Inactive'}
        </p>
      </div>
    </div>
  );
}
