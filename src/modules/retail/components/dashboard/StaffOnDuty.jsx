import { Button } from '@shared/ui/Button';
import { PanelCard } from '@shared/display/PanelCard';
import { cn } from '@utils/cn';

const statusTones = {
  success: 'bg-success',
  warning: 'bg-warning',
  muted: 'bg-border-strong',
};

/**
 * Staff on duty — team collaboration panel with per-person status
 * and message / invite actions.
 */
export function StaffOnDuty({ members = [], delay = 0, className, onMessage, onInvite }) {
  return (
    <PanelCard
      title="Staff On Duty"
      subtitle={`${members.length} members on shift`}
      delay={delay}
      className={className}
      actions={
        <Button size="sm" variant="secondary" onClick={() => onInvite?.()}>
          + Add Member
        </Button>
      }
    >
      <ul className="flex flex-col">
        {members.map((member, index) => (
          <li
            key={member.id}
            className="animate-fade-up flex items-center gap-3 border-b border-border/60 py-2 last:border-b-0"
            style={{ animationDelay: `${delay + 120 + index * 90}ms` }}
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-semibold text-accent">
              {member.initials}
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface',
                  statusTones[member.tone]
                )}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium text-content">{member.name}</span>
              <span className="block truncate text-[11px] text-content-muted">
                {member.role} · {member.status}
              </span>
            </span>
            <Button size="sm" variant="ghost" onClick={() => onMessage?.(member)}>
              Message
            </Button>
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}