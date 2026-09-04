import { cn } from '@utils/cn';

const hintTones = {
  success: 'text-success',
  warning: 'text-warning',
  muted: 'text-content-muted',
};

function StatIcon({ name }) {
  const cls = 'h-5 w-5 text-accent';
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
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      {paths[name]}
    </svg>
  );
}

export function StatCard({ label, value, hint, hintTone = 'muted', icon }) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl border border-border bg-surface p-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-muted">
        <StatIcon name={icon} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-content-muted">{label}</p>
        <p className="truncate text-xl font-bold text-content">{value}</p>
        <p className={cn('mt-0.5 text-[11px]', hintTones[hintTone])}>{hint}</p>
      </div>
    </div>
  );
}
