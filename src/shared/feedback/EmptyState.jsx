import { cn } from '@utils/cn';
import { Button } from '@shared/ui/Button';

export function EmptyState({ icon, title, description, actionLabel, onAction, className }) {
  return (
    <div className={cn('premium-card flex flex-col items-center justify-center px-6 py-16 text-center', className)}>
      {icon && <div className="mb-4 text-content-muted">{icon}</div>}
      <h3 className="text-base font-semibold text-content">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-content-muted">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-6" onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
