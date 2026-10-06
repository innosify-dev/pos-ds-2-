import { Button } from '@shared/ui/Button';
import { PanelCard } from '@shared/display/PanelCard';
import { cn } from '@utils/cn';

const toneStyles = {
  warning: 'text-warning',
  danger: 'text-danger',
  success: 'text-success',
};

/**
 * Restock reminders — low stock items with a per-row restock action.
 */
export function RestockCard({ items = [], delay = 0, className, onRestock }) {
  const total = items.length;

  return (
    <PanelCard
      title="Reminders"
      subtitle={total > 0 ? `${total} items need restocking` : 'Stock levels are healthy'}
      delay={delay}
      className={className}
    >
      {items.length === 0 ? (
        <p className="py-6 text-center text-xs text-content-muted">Nothing to restock right now.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={item.id}
              className="animate-fade-up flex items-center justify-between gap-3 rounded bg-surface-muted/60 p-2.5"
              style={{ animationDelay: `${delay + 140 + index * 110}ms` }}
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-content">{item.name}</p>
                <p className={cn('text-[11px]', toneStyles[item.tone])}>
                  {item.left === 0 ? 'Out of stock' : `${item.left} left in stock`} · {item.sku}
                </p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => onRestock?.(item)}>
                {item.action}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}