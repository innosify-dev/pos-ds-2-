import { Link } from 'react-router-dom';

function ActionIcon({ name }) {
  const cls = 'h-5 w-5 text-content-inverse';
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    cart: (
      <>
        <path d="M4 6h2l2.5 11h10L21 9H7" />
        <circle cx="10" cy="20" r="1.2" />
        <circle cx="17" cy="20" r="1.2" />
      </>
    ),
    'bag-add': (
      <>
        <path d="M6 8h12l-1 11H7z" />
        <path d="M9 10V6.5a3 3 0 0 1 6 0V10M12 12v4M10 14h4" />
      </>
    ),
    'user-add': (
      <>
        <circle cx="11" cy="8.5" r="3" />
        <path d="M5.5 19.5a5.5 5.5 0 0 1 11 0M18 8v6M15 11h6" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={cls}>
      {paths[name]}
    </svg>
  );
}

export function QuickActions({ actions }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-content">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((a) => (
          <Link
            key={a.id}
            to={a.to}
            className="flex flex-col items-center gap-2.5 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/40 hover:bg-accent-muted/30"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <ActionIcon name={a.icon} />
            </span>
            <span className="text-center text-xs font-medium text-content">{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
