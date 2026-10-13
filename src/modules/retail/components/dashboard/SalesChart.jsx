import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatedBarChart } from '@shared/display/AnimatedBarChart';
import { PanelCard } from '@shared/display/PanelCard';

const currency = (value) => (
  value >= 1000
    ? `₹${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
    : `₹${Math.round(value).toLocaleString('en-IN')}`
);

/**
 * Six-month sales from the active business. The period is fixed by the
 * existing dashboard model; there is no extra period control.
 */
export function SalesChart({ points = [], delay = 0, className, compact = false, showSaleLink = true }) {
  const [loading, setLoading] = useState(true);
  const hasSales = points.some((point) => point.value > 0);
  const chartHeight = compact ? 132 : 196;

  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 280);
    return () => clearTimeout(id);
  }, [points]);

  return (
    <PanelCard title={compact ? 'Sales overview' : 'Sales analytics'} subtitle="Last 6 months · collected revenue" delay={delay} className={className} dense={compact}>
      {loading ? (
        <div className="flex items-end gap-2" style={{ height: chartHeight }} aria-hidden>
          {[40, 62, 48, 74, 55, 68].map((height, index) => (
            <div key={index} className="flex-1 animate-shimmer rounded-t-md motion-reduce:animate-none" style={{ height: `${height}%` }} />
          ))}
        </div>
      ) : hasSales ? (
        <AnimatedBarChart data={points} height={chartHeight} formatValue={currency} />
      ) : (
        <div className={cnEmpty(compact)}>
          <p className="text-sm font-medium text-content">Sales insights appear after the first recorded sale.</p>
          {showSaleLink && (
            <Link to="/retail/pos" className="mt-2 inline-flex text-sm font-medium text-accent">Start your first sale</Link>
          )}
        </div>
      )}
    </PanelCard>
  );
}

function cnEmpty(compact) {
  return compact
    ? 'flex flex-col items-center justify-center px-3 py-6 text-center'
    : 'flex h-[196px] flex-col items-center justify-center text-center';
}