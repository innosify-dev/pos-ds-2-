import { Input } from '@shared/ui/Input';

/**
 * Additional product features (key/value attributes).
 */
export function AdditionalFeatures({ enabled, onToggleEnabled, features, onChange, onAdd, onRemove }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-content">3. Additional Features</h3>
      <label className="mt-2 flex cursor-pointer items-center gap-2 text-[13px] text-content">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggleEnabled(e.target.checked)}
          className="h-4 w-4 accent-[#7c3aed]"
        />
        Add additional features
      </label>
      <p className="mt-0.5 text-[11px] text-content-muted">Add custom product attributes to highlight important details.</p>

      {enabled && (
        <div className="mt-3">
          <div className="grid grid-cols-[1fr_1fr_40px] gap-2 px-1 pb-1 text-[11px] font-medium text-content-muted">
            <span>Feature / Key</span>
            <span>Value</span>
            <span className="text-right">Action</span>
          </div>
          <div className="space-y-2">
            {features.map((f) => (
              <div key={f.id} className="grid grid-cols-[1fr_1fr_40px] items-center gap-2">
                <Input value={f.key} onChange={(e) => onChange(f.id, 'key', e.target.value)} placeholder="e.g. Saree Length" aria-label="Feature name" />
                <Input value={f.value} onChange={(e) => onChange(f.id, 'value', e.target.value)} placeholder="e.g. 6.3 Meter" aria-label="Feature value" />
                <button
                  type="button"
                  aria-label={`Remove ${f.key || 'feature'}`}
                  onClick={() => onRemove(f.id)}
                  className="mx-auto rounded-md p-1.5 text-danger hover:bg-danger-muted"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="mt-3 rounded-lg border border-accent/40 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent-muted"
          >
            + Add Feature
          </button>
        </div>
      )}
    </section>
  );
}
