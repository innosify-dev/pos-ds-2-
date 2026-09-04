import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';

const gstOptions = ['GST 0%', 'GST 5%', 'GST 12%', 'GST 18%', 'GST 28%'];

/**
 * Pricing (single-price mode) + tax auto-calculation.
 */
export function PricingTax({
  hasVariants,
  pricing,
  onPricingChange,
  tax,
  onTaxChange,
}) {
  const base = Number(tax.base);
  const rate = Number(tax.rate);
  const valid = tax.base !== '' && !Number.isNaN(base) && !Number.isNaN(rate);
  const gstAmount = valid ? (base * rate) / 100 : null;
  const selling = valid ? base + gstAmount : null;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-content">
          5A. Pricing Details <span className="font-normal normal-case text-danger">(Shown only when no variants)</span>
        </h3>
        {hasVariants ? (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-surface-elevated p-3 text-xs text-content-muted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0 text-accent">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
            </svg>
            Pricing is managed in the variants table above.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input label="Price (₹)" type="number" min="0" value={pricing.price} onChange={(e) => onPricingChange('price', e.target.value)} />
            <Input label="Selling Price (₹)" type="number" min="0" value={pricing.selling} onChange={(e) => onPricingChange('selling', e.target.value)} />
            <Input label="MRP (₹)" type="number" min="0" value={pricing.mrp} onChange={(e) => onPricingChange('mrp', e.target.value)} />
          </div>
        )}
      </section>

      <section className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-content">5B. Tax Information</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Select label="GST Category / Rate *" value={tax.category} onChange={(e) => onTaxChange('category', e.target.value)}>
            {gstOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </Select>
          <Input label="Rate (%)" type="number" min="0" max="100" value={tax.rate} onChange={(e) => onTaxChange('rate', e.target.value)} />
        </div>
        <p className="mt-2 flex items-start gap-2 rounded-lg bg-surface-elevated p-2.5 text-[11px] text-content-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 shrink-0 text-accent">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 11v5M12 8h.01" strokeLinecap="round" />
          </svg>
          Price will be auto calculated as per the GST.
        </p>
        <div className="mt-3 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-2">
          <Input label="Base Price (₹)" type="number" min="0" value={tax.base} onChange={(e) => onTaxChange('base', e.target.value)} />
          <span className="pb-2.5 text-content-muted">+</span>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-content">GST ({rate || 0}%) (₹)</span>
            <div className="flex h-10 items-center rounded border border-border bg-surface-elevated px-3 text-sm text-content">
              {gstAmount === null ? '—' : gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <span className="pb-2.5 text-content-muted">=</span>
          <div>
            <span className="mb-1.5 block text-sm font-medium text-content">Selling Price (₹)</span>
            <div className="flex h-10 items-center rounded border border-border bg-surface-elevated px-3 text-sm font-medium text-content">
              {selling === null ? '—' : selling.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
