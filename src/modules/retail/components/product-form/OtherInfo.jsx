import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { PaymentToggle } from '@modules/retail/components/registers/RegisterForm.jsx';
import { productStatuses } from '@modules/retail/data/products.data.js';

/**
 * Other information — status, inventory, store, notes.
 */
export function OtherInfo({ other, onChange, warehouses }) {
  const set = (key, value) => onChange(key, value);

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-content">6. Other Information</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Select label="Product Status" value={other.status} onChange={(e) => set('status', e.target.value)}>
          {productStatuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <Input label="Opening Stock" type="number" min="0" step="1" value={other.openingStock} onChange={(e) => set('openingStock', e.target.value)} />
        <Select label="Warehouse / Store" value={other.warehouse} onChange={(e) => set('warehouse', e.target.value)}>
          {warehouses.map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </Select>
        <div>
          <span className="mb-1.5 block text-sm font-medium text-content">Product Notes</span>
          <textarea
            value={other.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={2}
            placeholder="Premium Kanjivaram silk saree. Handle with care."
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <span className="block text-sm font-medium text-content">Track Inventory</span>
          </div>
          <PaymentToggle checked={other.trackInventory} onChange={(v) => set('trackInventory', v)} label="Track Inventory" />
        </div>
        <Input label="Low Stock Threshold" type="number" min="0" step="1" value={other.lowThreshold} onChange={(e) => set('lowThreshold', e.target.value)} />
        <Input label="Supplier Reference" value={other.supplierRef} onChange={(e) => set('supplierRef', e.target.value)} placeholder="NALLI-SUP-2024" />
        <div>
          <span className="mb-1.5 block text-sm font-medium text-content">Internal Remarks</span>
          <textarea
            value={other.remarks}
            onChange={(e) => set('remarks', e.target.value)}
            rows={2}
            placeholder="Top selling saree in wedding season."
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>
    </section>
  );
}
