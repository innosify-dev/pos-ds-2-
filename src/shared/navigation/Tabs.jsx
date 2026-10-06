import { cn } from '@utils/cn';

export function Tabs({ tabs, activeTab, onChange, className, variant = 'underline' }) {
  if (variant === 'pills') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-accent text-content-inverse'
                : 'bg-surface-muted text-content-muted hover:text-content'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-1 border-b border-border', className)} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === tab.id
              ? 'border-b-2 border-accent text-accent'
              : 'text-content-muted hover:text-content'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
