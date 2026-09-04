/**
 * Today's sales lollipop chart — pure SVG/divs (no chart dependency).
 */
export function SalesChart({ points }) {
  const max = Math.max(...points.map((p) => p.value));
  const axis = ['80K', '60K', '40K', '20K', '0'];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content">Today&apos;s Sales</h3>
        <span className="flex items-center gap-1.5 text-[11px] text-content-muted">
          <span className="h-0.5 w-5 rounded bg-accent" />
          Sales (₹)
        </span>
      </div>
      <div className="flex gap-2">
        <div className="flex h-44 flex-col justify-between py-1 text-[10px] text-content-muted">
          {axis.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
        <div className="flex h-44 flex-1 items-end justify-around border-b border-dashed border-border pb-0">
          {points.map((p) => {
            const h = Math.max(12, (p.value / max) * 150);
            return (
              <div key={p.label} className="flex h-full flex-col items-center justify-end gap-1.5">
                <div className="flex flex-col items-center" style={{ height: `${h}px` }}>
                  <span className="h-1.5 w-1.5 rounded-full border-2 border-accent bg-surface" />
                  <span className="w-0.5 flex-1 rounded bg-accent" />
                </div>
                <span className="text-[10px] text-content-muted">{p.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
