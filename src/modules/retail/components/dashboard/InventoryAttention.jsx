import { Link } from 'react-router-dom';
import { cn } from '@utils/cn';

const statusPill = {
  warning: 'bg-warning-muted text-warning',
  danger: 'bg-danger-muted text-danger',
};

export function InventoryAttention({ items }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-content">Inventory Attention</h3>
        <Link
          to="/retail/products"
          className="rounded-lg border border-accent/30 px-2.5 py-1 text-[11px] font-medium text-accent hover:bg-accent-muted"
        >
          View Inventory
        </Link>
      </div>
      <ul className="divide-y divide-border/60">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2.5">
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white',
                item.gradient
              )}
            >
              {item.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-content">{item.name}</span>
            <span className="text-xs text-content">
              {item.left} <span className="text-content-muted">left</span>
            </span>
            <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-medium', statusPill[item.tone])}>
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
