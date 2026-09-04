import { formatCash } from '@modules/retail/data/registers.data.js';

function StatIcon({ name }) {
  const paths = {
    register: (
      <>
        <rect x="4" y="3.5" width="16" height="6" rx="1.5" />
        <path d="M6 9.5V15l2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5V9.5M5 20.5h14" />
      </>
    ),
    lockOpen: (
      <>
        <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
        <path d="M8.5 10.5V8a3.5 3.5 0 0 1 6.8-1.2" />
        <circle cx="12" cy="15" r="1.3" />
      </>
    ),
    lockClosed: (
      <>
        <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" />
        <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
        <circle cx="12" cy="15" r="1.3" />
      </>
    ),
    rupee: <path d="M7 4.5h10M7 4.5v3.5M7 8h9.5M7 8c4 0 5.5 2 5 4.5L8.5 20M17 8l-2.5 5" />,
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 text-accent"
    >
      {paths[name]}
    </svg>
  );
}

/**
 * Register stat cards — computed from the register list.
 */
export function RegisterStats({ total, open, closed, sales }) {
  const cards = [
    { label: 'Total Registers', value: String(total), icon: 'register' },
    { label: 'Open Registers', value: String(open), icon: 'lockOpen' },
    { label: 'Closed Registers', value: String(closed), icon: 'lockClosed' },
    { label: "Today's Register Sales", value: formatCash(sales), icon: 'rupee' },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="flex items-center gap-3.5 rounded-xl border border-border bg-surface p-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-muted">
            <StatIcon name={c.icon} />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-content-muted">{c.label}</p>
            <p className="truncate text-xl font-bold text-content">{c.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
