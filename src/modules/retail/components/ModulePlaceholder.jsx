/**
 * Routing scaffold placeholder — NOT a fake feature.
 * Each section screen reuses this until its real UI is shared image-by-image.
 */
export function ModulePlaceholder({ title, note }) {
  return (
    <div className="flex min-h-full flex-col bg-surface-elevated/50 p-5">
      <h2 className="text-base font-semibold text-content">{title}</h2>
      <p className="mt-0.5 text-xs text-content-muted">{note ?? 'Share the design image for this section to implement it next.'}</p>
      <div className="mt-4 rounded-xl border border-dashed border-border-strong bg-surface p-8 text-center text-sm text-content-muted">
        {title} — coming next
      </div>
    </div>
  );
}
