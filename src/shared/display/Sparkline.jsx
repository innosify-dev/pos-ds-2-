import { useId } from 'react';
import { cn } from '@utils/cn';

/**
 * Tiny inline trend line used inside stat cards.
 * `points` is an array of numbers; the path is stroked with the accent colour.
 */
export function Sparkline({ points = [], className, strokeWidth = 2, animate = true }) {
  const gradientId = useId();
  if (points.length < 2) return null;

  const width = 100;
  const height = 32;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / range) * (height - 6) - 3;
    return [x, y];
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`).join(' ');
  const area = `${line} L${width} ${height} L0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className={cn('h-8 w-full', className)} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      >
        {animate && (
          <animate
            attributeName="stroke-dasharray"
            from="0 200"
            to="200 0"
            dur="0.9s"
            fill="freeze"
          />
        )}
      </path>
    </svg>
  );
}