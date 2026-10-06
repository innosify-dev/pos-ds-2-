import { useEffect, useId, useState } from 'react';
import { cn } from '@utils/cn';

/**
 * Smooth area chart with animated draw-in and optional range switching.
 * `series` is an array of { label, value } and `ranges` is an array of
 * { id, label, series } used for Days / Weeks / Months style toggles.
 */
export function AnimatedAreaChart({
  series = [],
  ranges = null,
  activeRange,
  onRangeChange,
  delay = 0,
  height = 200,
  className,
}) {
  const gradientId = useId();
  const [progress, setProgress] = useState(0);
  const [internalRange, setInternalRange] = useState(activeRange ?? ranges?.[0]?.id);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(1));
    return () => cancelAnimationFrame(frame);
  }, []);

  const currentRange = ranges ? ranges.find((r) => r.id === internalRange) : null;
  const points = currentRange ? currentRange.series : series;

  const width = 600;
  const chartHeight = 160;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const range = max - min || 1;

  const coords = points.map((point, index) => {
    const x = points.length > 1 ? (index / (points.length - 1)) * width : width / 2;
    const y = chartHeight - ((point.value - min) / range) * (chartHeight - 20) - 10;
    return [x, y];
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const area = `${line} L${width} ${chartHeight} L0 ${chartHeight} Z`;

  const handleRange = (id) => {
    if (onRangeChange) onRangeChange(id);
    setInternalRange(id);
  };

  return (
    <div className={cn('w-full text-accent', className)}>
      {ranges && (
        <div className="mb-3 inline-flex rounded-full bg-surface-muted p-1">
          {ranges.map((rangeItem) => (
            <button
              key={rangeItem.id}
              type="button"
              onClick={() => handleRange(rangeItem.id)}
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-medium capitalize transition-colors',
                rangeItem.id === internalRange
                  ? 'bg-surface text-content shadow-sm'
                  : 'text-content-muted hover:text-content'
              )}
            >
              {rangeItem.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full overflow-hidden" style={{ height }}>
        <svg viewBox={`0 0 ${width} ${chartHeight}`} preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              x2={width}
              y1={chartHeight * ratio}
              y2={chartHeight * ratio}
              stroke="currentColor"
              strokeOpacity="0.12"
              strokeDasharray="4 6"
            />
          ))}
          <path d={area} fill={`url(#${gradientId})`} opacity={progress} style={{ transition: 'opacity 700ms ease-out' }} />
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - progress}
            style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          />
        </svg>
        {points.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between text-[10px] text-content-muted">
            {points.map((point) => (
              <span key={point.label}>{point.label}</span>
            ))}
          </div>
        )}
      </div>

      <p className="mt-2 text-[11px] text-content-muted" style={{ animationDelay: `${delay}ms` }}>
        {currentRange?.caption ?? ''}
      </p>
    </div>
  );
}