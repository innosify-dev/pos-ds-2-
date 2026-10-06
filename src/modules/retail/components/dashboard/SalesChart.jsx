import { useEffect, useState } from 'react';
import { AnimatedBarChart } from '@shared/display/AnimatedBarChart';
import { PanelCard } from '@shared/display/PanelCard';

const currency = (value) => `₹${(value / 1000).toFixed(0)}k`;

/**
 * Sales analytics bar chart. Shows a shimmer skeleton first, then animates
 * the bars in — matching the reference dashboard behaviour.
 */
export function SalesChart({ points = [], delay = 0, className }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(id);
  }, []);

  return (
    <PanelCard title="Sales Analytics" subtitle="Revenue collected across the period" delay={delay} className={className}>
      {loading ? (
        <div className="flex h-[196px] items-end gap-2">
          {[45, 70, 55, 85, 65].map((height, index) => (
            <div
              key={index}
              className="animate-shimmer flex-1 rounded-t-md"
              style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }}
            />
          ))}
        </div>
      ) : (
        <AnimatedBarChart data={points} height={196} formatValue={currency} />
      )}
    </PanelCard>
  );
}