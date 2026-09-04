import { useState } from 'react';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { Button } from '@shared/ui/Button';

function TagEditor({ values, onAdd, onRemove }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const v = draft.trim().replace(/,+$/, '');
    if (v && !values.includes(v)) onAdd(v);
    setDraft('');
  };

  return (
    <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded border border-border bg-surface px-2 py-1.5 focus-within:border-accent">
      {values.map((v) => (
        <span key={v} className="flex items-center gap-1 rounded-md bg-surface-muted px-2 py-0.5 text-xs text-content">
          {v}
          <button type="button" aria-label={`Remove ${v}`} onClick={() => onRemove(v)} className="text-content-muted hover:text-danger">
            ×
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={values.length === 0 ? 'Type and press Enter' : ''}
        className="min-w-24 flex-1 bg-transparent text-xs text-content outline-none placeholder:text-content-muted"
      />
    </div>
  );
}

/**
 * Product variants — variant definitions with tag values, generated
 * combination table, and apply-to-all bulk editing.
 */
export function VariantsSection({
  enabled,
  onToggleEnabled,
  variants,
  onVariantName,
  onVariantAddValue,
  onVariantRemoveValue,
  onAddVariant,
  onRemoveVariant,
  combos,
  onComboChange,
  onRemoveCombo,
  applyAll,
  onApplyAllChange,
  onApplyAll,
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-content">4. Product Variants</h3>
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-[13px] text-content">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
          className="h-4 w-4 accent-[#7c3aed]"
        />
        This product has variants
      </label>
      <p className="mt-0.5 text-[11px] text-content-muted">Define variants like Color, Design, Border etc. and their values.</p>

      {enabled && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-[140px_1fr_40px] gap-2 px-1 text-[11px] font-medium text-content-muted">
            <span>Variant Name</span>
            <span>Variant Values</span>
            <span className="text-right">Action</span>
          </div>
          {variants.map((v) => (
            <div key={v.id} className="grid grid-cols-[140px_1fr_40px] items-start gap-2">
              <Input value={v.name} onChange={(e) => onVariantName(v.id, e.target.value)} aria-label="Variant name" />
              <TagEditor
                values={v.values}
                onAdd={(val) => onVariantAddValue(v.id, val)}
                onRemove={(val) => onVariantRemoveValue(v.id, val)}
              />
              <button
                type="button"
                aria-label={`Remove ${v.name || 'variant'}`}
                onClick={() => onRemoveVariant(v.id)}
                className="mx-auto rounded-md p-1.5 text-danger hover:bg-danger-muted"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                  <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddVariant}
            className="rounded-lg border border-accent/40 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-muted"
          >
            + Add Variant
          </button>

          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-content">Generated Variant Combinations ({combos.length})</p>
            </div>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-muted text-content-muted">
                    <th className="px-2 py-2 font-medium">#</th>
                    {variants.filter((v) => v.name.trim()).map((v) => (
                      <th key={v.id} className="px-2 py-2 font-medium">{v.name}</th>
                    ))}
                    <th className="px-2 py-2 font-medium">Variant Name</th>
                    <th className="px-2 py-2 font-medium">SKU</th>
                    <th className="px-2 py-2 font-medium">Price (₹)</th>
                    <th className="px-2 py-2 font-medium">Selling Price (₹)</th>
                    <th className="px-2 py-2 font-medium">MRP (₹)</th>
                    <th className="px-2 py-2 font-medium">Returnable</th>
                    <th className="px-2 py-2 font-medium">Discount (%)</th>
                    <th className="px-2 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {combos.map((c, i) => (
                    <tr key={c.key}>
                      <td className="px-2 py-1.5 text-content-muted">{i + 1}</td>
                      {c.values.map((val, vi) => (
                        <td key={vi} className="whitespace-nowrap px-2 py-1.5 text-content">{val}</td>
                      ))}
                      <td className="whitespace-nowrap px-2 py-1.5 text-content">{c.name}</td>
                      <td className="whitespace-nowrap px-2 py-1.5 text-content">{c.sku}</td>
                      <td className="px-2 py-1.5">
                        <input type="number" min="0" value={c.price} onChange={(e) => onComboChange(c.key, 'price', e.target.value)} className="h-8 w-20 rounded border border-border bg-surface px-1.5 text-xs text-content focus:border-accent focus:outline-none" aria-label={`Price for ${c.name}`} />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" min="0" value={c.selling} onChange={(e) => onComboChange(c.key, 'selling', e.target.value)} className="h-8 w-20 rounded border border-border bg-surface px-1.5 text-xs text-content focus:border-accent focus:outline-none" aria-label={`Selling price for ${c.name}`} />
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" min="0" value={c.mrp} onChange={(e) => onComboChange(c.key, 'mrp', e.target.value)} className="h-8 w-20 rounded border border-border bg-surface px-1.5 text-xs text-content focus:border-accent focus:outline-none" aria-label={`MRP for ${c.name}`} />
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={c.returnable}
                          aria-label={`Returnable for ${c.name}`}
                          onClick={() => onComboChange(c.key, 'returnable', !c.returnable)}
                          className={`relative h-5 w-9 rounded-full transition-colors ${c.returnable ? 'bg-success' : 'bg-border-strong/50'}`}
                        >
                          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${c.returnable ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </td>
                      <td className="px-2 py-1.5">
                        <input type="number" min="0" max="100" value={c.discount} onChange={(e) => onComboChange(c.key, 'discount', e.target.value)} className="h-8 w-14 rounded border border-border bg-surface px-1.5 text-xs text-content focus:border-accent focus:outline-none" aria-label={`Discount for ${c.name}`} />
                      </td>
                      <td className="px-2 py-1.5">
                        <button type="button" aria-label={`Remove ${c.name}`} onClick={() => onRemoveCombo(c.key)} className="rounded-md p-1 text-danger hover:bg-danger-muted">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                            <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {combos.length === 0 && (
                    <tr>
                      <td colSpan={20} className="px-2 py-6 text-center text-content-muted">
                        Add values to your variants to generate combinations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="mb-2 mt-4 text-xs font-medium text-content">Apply to All ⌄</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              <Input value={applyAll.price} onChange={(e) => onApplyAllChange('price', e.target.value)} placeholder="Price (₹)" type="number" min="0" aria-label="Apply price to all" />
              <Input value={applyAll.selling} onChange={(e) => onApplyAllChange('selling', e.target.value)} placeholder="Selling Price (₹)" type="number" min="0" aria-label="Apply selling price to all" />
              <Input value={applyAll.mrp} onChange={(e) => onApplyAllChange('mrp', e.target.value)} placeholder="MRP (₹)" type="number" min="0" aria-label="Apply MRP to all" />
              <Select value={applyAll.returnable} onChange={(e) => onApplyAllChange('returnable', e.target.value)} aria-label="Apply returnable to all">
                <option value="">Returnable</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
              <Input value={applyAll.discount} onChange={(e) => onApplyAllChange('discount', e.target.value)} placeholder="Discount (%)" type="number" min="0" aria-label="Apply discount to all" />
              <Button onClick={onApplyAll} disabled={combos.length === 0}>Apply</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
