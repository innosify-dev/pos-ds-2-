import { Link } from 'react-router-dom';
import { useCountUp } from '@hooks';
import { cn } from '@utils/cn';

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
      <path d="M7 17 17 7" strokeLinecap="round" />
      <path d="M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricIcon({ name }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, className: 'h-4 w-4', 'aria-hidden': true };
  if (name === 'tag') {
    return (
      <svg {...props}>
        <path d="M20 13 11 22 2 13V4h9l9 9Z" strokeLinejoin="round" />
        <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === 'alert') {
    return (
      <svg {...props}>
        <path d="M12 3 2.5 20h19L12 3Z" strokeLinejoin="round" />
        <path d="M12 9v5" strokeLinecap="round" />
        <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === 'bag') {
    return (
      <svg {...props}>
        <path d="M6 8h12l-1 12H7L6 8Z" strokeLinejoin="round" />
        <path d="M9 8V7a3 3 0 0 1 6 0v1" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === 'trend') {
    return (
      <svg {...props}>
        <path d="M4 16 10 10l4 4 6-7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 7h6v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" strokeLinejoin="round" />
      <path d="M12 12 3 7.5M12 12l9-4.5M12 12v9" />
    </svg>
  );
}

const TONE_CLASS = {
  accent: 'bg-accent-muted text-accent',
  success: 'bg-success-muted text-success',
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
};

const TONE_BY_ID = {
  'total-products': 'accent',
  'active-categories': 'success',
  'low-stock': 'warning',
  'todays-orders': 'accent',
  'on-duty': 'success',
  orders: 'accent',
  sales: 'success',
  'avg-rating': 'warning',
};

/**
 * White KPI card. Color is limited to a small icon well so tenant branding
 * stays visible without filling the card.
 */
export function StatCard({
  id,
  label,
  value,
  hint,
  to,
  icon,
  index = 0,
  tone,
  round = true,
  format = (v) => v.toLocaleString('en-IN'),
  compact = false,
}) {
  const animated = useCountUp(value, { duration: 1300, delay: 120 + index * 110 });
  const display = format(round ? Math.round(animated) : animated);
  const toneClass = TONE_CLASS[tone || TONE_BY_ID[id] || 'accent'];

  return (
    <article
      className={cn(
        'premium-card flex flex-col transition duration-200 hover:border-border-strong',
        compact ? 'p-3' : 'min-h-[148px] animate-pop-in p-4 hover:-translate-y-0.5',
      )}
      style={compact ? undefined : { animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className={cn('flex items-center justify-center rounded-lg', compact ? 'h-8 w-8' : 'h-9 w-9', toneClass)} aria-hidden>
          <MetricIcon name={icon} />
        </span>
        {to ? (
          <Link
            to={to}
            aria-label={`Open ${label}`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-content-muted transition hover:bg-surface-muted hover:text-content"
          >
            <ArrowUpRight />
          </Link>
        ) : null}
      </div>

      <p className={cn('text-xs font-medium text-content-muted', compact ? 'mt-2' : 'mt-4')}>{label}</p>
      <p className={cn('font-semibold tracking-tight text-content tabular-nums', compact ? 'mt-0.5 text-xl sm:text-2xl' : 'mt-1 text-3xl')}>{display}</p>

      {hint && <p className={cn('text-xs text-content-muted', compact ? 'mt-1' : 'mt-auto pt-3')}>{hint}</p>}
    </article>
  );
}
