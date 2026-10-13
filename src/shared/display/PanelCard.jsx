import { cn } from '@utils/cn';

/**
 * Panel container used by dashboard and analytics cards.
 * Provides the header row (title, subtitle, actions) and a consistent surface.
 */
export function PanelCard({ title, subtitle, actions, children, className, bodyClassName, delay = 0, style, dense = false }) {
  return (
    <section
      className={cn(
        'premium-card animate-fade-up flex flex-col transition duration-200',
        dense ? 'gap-2 p-3' : 'gap-3 p-5 hover:shadow-[0_16px_36px_rgb(28_27_46/0.08)]',
        className,
      )}
      style={{ animationDelay: `${delay}ms`, ...style }}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h3 className="truncate text-sm font-semibold text-content">{title}</h3>}
            {subtitle && <p className="mt-0.5 truncate text-[11px] text-content-muted">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn('flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}