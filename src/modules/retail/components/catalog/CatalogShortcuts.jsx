import { Link } from 'react-router-dom';

const linkClass = 'inline-flex h-8 items-center rounded-xl border border-border bg-surface px-3 text-xs font-medium text-content shadow-sm transition hover:border-accent/30 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30';

/** Real catalog routes only. Callers omit links the current role cannot use. */
export function CatalogShortcuts({ items }) {
  if (!items?.length) return null;
  return (
    <nav aria-label="Catalog shortcuts" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link key={item.to + item.label} to={item.to} className={linkClass}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
