import { PanelCard } from '@shared/display/PanelCard';
import { cn } from '@utils/cn';

const toneStyles = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  muted: 'bg-border-strong',
};

/**
 * Activity feed — recent store events with staggered entrance.
 */
export function ActivityFeed({ items = [], delay = 0, className }) {
  return (
    <PanelCard title="Activity" subtitle="Latest actions across the store" delay={delay} className={className}>
      <ul className="flex flex-col">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="animate-fade-up flex items-start gap-3 border-b border-border/60 py-2.5 last:border-b-0"
            style={{ animationDelay: `${delay + 120 + index * 90}ms` }}
          >
            <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', toneStyles[item.tone])} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-content">
                <span className="font-semibold">{item.actor}</span>{' '}
                <span className="text-content-muted">{item.action}</span>{' '}
                <span className="font-medium">{item.target}</span>
              </p>
              <p className="text-[11px] text-content-muted">{item.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}