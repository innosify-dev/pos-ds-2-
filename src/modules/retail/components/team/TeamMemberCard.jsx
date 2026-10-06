import { useCountUp } from '@hooks';
import { Badge } from '@shared/display/Badge';
import { Button } from '@shared/ui/Button';
import { cn } from '@utils/cn';

const statusTones = {
  success: 'success',
  warning: 'warning',
  muted: 'default',
};

/**
 * Team member card — avatar, role, shift progress bar and actions.
 */
export function TeamMemberCard({ member, index = 0 }) {
  const orders = useCountUp(member.orders, { duration: 1100, delay: 200 + index * 80 });
  const sales = useCountUp(member.sales, { duration: 1300, delay: 260 + index * 80 });

  return (
    <article
      className="animate-fade-up flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md hover:shadow-plum/5"
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-muted text-sm font-semibold text-accent">
          {member.initials}
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface',
              member.tone === 'success' && 'bg-success',
              member.tone === 'warning' && 'bg-warning',
              member.tone === 'muted' && 'bg-border-strong'
            )}
          />
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-content">{member.name}</h3>
          <p className="truncate text-[11px] text-content-muted">{member.role}</p>
          <div className="mt-1">
            <Badge variant={statusTones[member.tone]}>{member.status}</Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-content-muted">
          <span>Shift progress</span>
          <span className="font-medium tabular-nums text-content">{member.shiftProgress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent/15">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out"
            style={{ width: `${member.shiftProgress}%`, transitionDelay: `${index * 80}ms` }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-2 rounded bg-surface-muted/50 p-2 text-center">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-content-muted">Orders</dt>
          <dd className="text-sm font-semibold tabular-nums text-content">{Math.round(orders)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-content-muted">Sales</dt>
          <dd className="text-sm font-semibold tabular-nums text-content">₹{Math.round(sales / 1000)}k</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-content-muted">Rating</dt>
          <dd className="text-sm font-semibold tabular-nums text-content">{member.rating}</dd>
        </div>
      </dl>

      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="flex-1">
          Message
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Invite
        </Button>
      </div>
    </article>
  );
}