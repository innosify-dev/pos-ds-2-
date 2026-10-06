import { useEffect, useState } from 'react';
import { cn } from '@utils/cn';

/**
 * Radial progress gauge with animated sweep and a legend.
 * `value` is the active percentage; `legend` describes the segments.
 */
export function ProgressGauge({
  value = 0,
  size = 168,
  thickness = 14,
  legend = [],
  delay = 0,
  className,
}) {
  const [sweep, setSweep] = useState(0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  useEffect(() => {
    const id = setTimeout(() => setSweep(clamped), delay);
    return () => clearTimeout(id);
  }, [clamped, delay]);

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            className="stroke-accent/15"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            className="stroke-accent transition-[stroke-dashoffset] duration-1000 ease-out"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - sweep / 100)}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold tabular-nums text-content">{Math.round(sweep)}%</span>
          <span className="text-[11px] text-content-muted">of target</span>
        </div>
      </div>

      {legend.length > 0 && (
        <ul className="flex w-full flex-col gap-1.5">
          {legend.map((entry, index) => (
            <li
              key={entry.label}
              className="flex items-center justify-between gap-2 text-[11px]"
              style={{ animation: 'fade-in 400ms ease-out both', animationDelay: `${delay + index * 120}ms` }}
            >
              <span className="flex items-center gap-1.5 text-content-muted">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.label}
              </span>
              <span className="font-medium tabular-nums text-content">{entry.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}