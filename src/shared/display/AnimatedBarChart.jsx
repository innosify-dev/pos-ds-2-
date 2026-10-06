import { useEffect, useState } from 'react';
import { cn } from '@utils/cn';

/**
 * Animated bar chart with a skeleton → data transition.
 * `data` items: { label, value, highlight? }
 */
export function AnimatedBarChart({
  data = [],
  height = 180,
  delay = 0,
  formatValue = (v) => v,
  className,
  emptyLabel = 'No data yet',
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-end gap-3" style={{ height }}>
        {data.length === 0 && (
          <p className="w-full self-center text-center text-xs text-content-muted">{emptyLabel}</p>
        )}
        {data.map((item, index) => {
          const pct = (item.value / max) * 100;
          return (
            <div key={item.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[10px] font-medium text-content-muted opacity-0 transition-opacity group-hover:opacity-100">
                {formatValue(item.value)}
              </span>
              <div
                className={cn(
                  'w-full max-w-[38px] rounded-t-md transition-[height,background-color,opacity] duration-700 ease-out',
                  ready ? 'opacity-100' : 'opacity-0',
                  item.highlight ? 'bg-accent' : 'bg-accent/35 group-hover:bg-accent/60'
                )}
                style={{
                  height: ready ? `${Math.max(pct, 4)}%` : '4%',
                  transitionDelay: `${index * 70}ms`,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-3">
        {data.map((item) => (
          <span key={item.label} className="flex-1 truncate text-center text-[10px] text-content-muted">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}