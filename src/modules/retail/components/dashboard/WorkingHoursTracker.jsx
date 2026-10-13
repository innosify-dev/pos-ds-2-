import { useMemo } from 'react';
import { cn } from '@utils/cn';
import { parseClock } from '@modules/retail/data';
import { useTenant } from '@core/tenant/TenantProvider.jsx';

function nowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function formatClock(minutes) {
  const hour24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

function salesBetween(hourly, start, end) {
  return hourly.reduce((total, amount, hour) => {
    const hourStart = hour * 60;
    const overlap = Math.max(0, Math.min(end, hourStart + 60) - Math.max(start, hourStart));
    return total + amount * (overlap / 60);
  }, 0);
}

/**
 * Compact store-hours strip. The bar is the clock moving through configured
 * opening hours. It is not an attendance record.
 */
export function WorkingHoursTracker({ hourly = [], className }) {
  const { tenant } = useTenant();
  const open = parseClock(tenant?.openingTime || '10:00');
  const close = parseClock(tenant?.closingTime || '21:00');
  const now = nowMinutes();
  const span = Math.max(close - open, 1);
  const status = now < open ? 'Before opening' : now > close ? 'Closed' : 'Open';
  const progress = now < open ? 0 : Math.max(0, Math.min(100, ((Math.min(now, close) - open) / span) * 100));
  const recorded = useMemo(
    () => salesBetween(hourly, open, Math.min(close, Math.max(open, now))),
    [hourly, open, close, now],
  );

  return (
    <section className={cn('premium-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-content-muted">Working hours</p>
        <p className="mt-1 text-sm font-semibold text-content">
          {formatClock(open)} – {formatClock(close)}
          <span className="ml-2 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-content-muted">{status}</span>
        </p>
        <p className="mt-1 text-xs text-content-muted">Store hours for today. This is not staff attendance.</p>
      </div>
      <div className="w-full sm:max-w-xs">
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted" aria-hidden>
          <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs text-content-muted">
          Now {formatClock(now)}. Sales recorded during open hours today: ₹{Math.round(recorded).toLocaleString('en-IN')}.
        </p>
      </div>
    </section>
  );
}
