import { Badge } from '@shared/display/Badge';
import { PanelCard } from '@shared/display/PanelCard';

const currency = (value) => `₹${value.toLocaleString('en-IN')}`;

/**
 * Top selling products with a staggered entrance and a "New" badge
 * on recently added items.
 */
export function TopProducts({ items = [], delay = 0, className, onSelect }) {
  return (
    <PanelCard title="Product" subtitle="Best performers this month" delay={delay} className={className}>
      <ul className="flex flex-col">
        {items.map((item, index) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect?.(item)}
              className="animate-fade-up group flex w-full items-center gap-3 border-b border-border/60 py-2 text-left last:border-b-0 hover:bg-surface-muted/50"
              style={{ animationDelay: `${delay + 120 + index * 90}ms` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-muted text-[11px] font-semibold text-accent">
                {item.category.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-xs font-medium text-content">{item.name}</span>
                  {item.isNew && <Badge variant="success">New</Badge>}
                </span>
                <span className="block text-[11px] text-content-muted">{item.sold} sold</span>
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-content">
                {currency(item.revenue)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}