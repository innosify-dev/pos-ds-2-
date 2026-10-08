import { Link } from 'react-router-dom';
import { useCountUp } from '@hooks';
import { cn } from '@utils/cn';

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-4 w-4" aria-hidden>
      <path d="M7 17 17 7" strokeLinecap="round" />
      <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3 w-3" aria-hidden>
      <path d="M4 16.5 9 11l3 3 8-8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Filled KPI card: label and arrow on top, large value, hint in a bottom pill.
 */
export function StatCard({
  label,
  value,
  hint,
  to,
  index = 0,
  round = true,
  format = (v) => v.toLocaleString('en-IN'),
}) {
  const animated = useCountUp(value, { duration: 1300, delay: 120 + index * 110 });
  const display = format(round ? Math.round(animated) : animated);
  const arrowClass =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink shadow-sm';

  return (
    <article
      className="animate-pop-in flex min-h-[148px] flex-col rounded-2xl bg-accent p-4 text-content-inverse"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="pt-1 text-sm font-medium text-white/90">{label}</p>
        {to ? (
          <Link to={to} aria-label={`Open ${label}`} className={cn(arrowClass, 'transition-transform hover:scale-105')}>
            <ArrowUpRight />
          </Link>
        ) : (
          <span className={arrowClass} aria-hidden>
            <ArrowUpRight />
          </span>
        )}
      </div>

      <p className="mt-3 text-4xl font-semibold tracking-tight tabular-nums">{display}</p>

      {hint && (
        <p className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-2 py-1 text-[11px] text-white/90">
          <span className="flex h-4 w-4 items-center justify-center rounded-md bg-white/15">
            <ChipIcon />
          </span>
          {hint}
        </p>
      )}
    </article>
  );
}
