import { cn } from '@utils/cn';

const TONE = {
  'In Stock': 'bg-success-muted text-success',
  'Low Stock': 'bg-warning-muted text-warning',
  'Out of Stock': 'bg-danger-muted text-danger',
  Received: 'bg-success-muted text-success',
};

export function StockBadge({ status }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold', TONE[status] || 'bg-surface-muted text-content-muted')}>
      {status}
    </span>
  );
}
