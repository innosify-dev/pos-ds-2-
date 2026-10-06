import { useCountUp } from '@hooks';
import { cn } from '@utils/cn';
import { Sparkline } from '@shared/display/Sparkline';

const hintTones = {
  success: 'text-success',
  warning: 'text-warning',
  muted: 'text-content-muted',
};

function StatIcon({ name }) {
  const cls = 'h-5 w-5';
  const paths = {
    trend: (
      <>
        <path d="M3.5 17.5 9 12l3.5 3.5 8-8.5" />
        <path d="M15.5 7H20.5v5" />
      </>
    ),
    bag: (
      <>
        <path d="M6 8h15l-1.5 9h-12z" />
        <path d="M6 8 5 4H2M9.5 10V6.5a2.5 2.5 0 0 1 5 0V10" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 8v4.5M12 15.5h.01" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>
    ),
    tag: (
      <>
        <path d="M12.6 3.4 20 10.8 12 18.8 3.2 10H11l1.6-6.6z" />
        <path d="M7 8h.01" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cls}
    >
      {paths[name]}
    </svg>
  );
}

/**
 * KPI card with count-up value, optional sparkline and a featured (filled) variant.
 */
export function StatCard({
  label,
  value,
  hint,
  hintTone = 'muted',
  icon,
  featured = false,
  trend,
  index = 0,
  round = true,
  format = (v) => v.toLocaleString('en-IN'),
}) {
  const animated = useCountUp(value, { duration: 1300, delay: 120 + index * 110 });
  const display = format(round ? Math.round(animated) : animated);

  if (featured) {
    return (
      <div
        className="animate-pop-in flex flex-col justify-between gap-4 rounded-lg bg-accent p-4 text-content-inverse shadow-sm shadow-accent/25"
        style={{ animationDelay: `${index * 90}ms` }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs opacity-85">{label}</span>
          <Sparkline points={trend} className="w-16 text-ivory" />
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums">{display}</p>
          <p className="mt-1 text-[11px] opacity-80">{hint}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-up flex flex-col justify-between gap-4 rounded-lg border border-border bg-surface p-4"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-muted text-accent">
            <StatIcon name={icon} />
          </span>
          <span className="text-xs text-content-muted">{label}</span>
        </div>
        {trend && <Sparkline points={trend} className="w-14 text-accent" />}
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums text-content">{display}</p>
        <p className={cn('mt-1 text-[11px]', hintTones[hintTone])}>{hint}</p>
      </div>
    </div>
  );
}