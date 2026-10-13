import { Button } from '@shared/ui/Button';
import { PanelCard } from '@shared/display/PanelCard';

/**
 * People assigned to the active business. Presence is not inferred.
 */
export function StaffOnDuty({ members = [], delay = 0, className, onMessage, onInvite, dense = false }) {
  return (
    <PanelCard
      title="Assigned staff"
      subtitle={members.length ? `${members.length} people on this business` : 'No staff assigned yet'}
      delay={delay}
      className={className}
      dense={dense}
      actions={onInvite ? (
        <Button size="sm" variant="secondary" onClick={() => onInvite()}>
          Add member
        </Button>
      ) : null}
    >
      {members.length === 0 ? (
        <p className={dense ? 'py-2 text-center text-xs text-content-muted' : 'py-6 text-center text-xs text-content-muted'}>Invite staff from Team when you are ready.</p>
      ) : (
        <ul className={dense ? 'flex flex-col' : 'flex max-h-64 flex-col overflow-auto'}>
          {members.map((member) => (
            <li key={member.id} className={dense ? 'flex items-center gap-2.5 border-b border-border/60 py-1.5 last:border-b-0' : 'flex items-center gap-3 border-b border-border/60 py-2 last:border-b-0'}>
              <span className={dense ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-muted text-[10px] font-semibold text-accent' : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-muted text-xs font-semibold text-accent'}>
                {member.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-content">{member.name}</span>
                <span className="block truncate text-[11px] text-content-muted">
                  {member.role} · {member.status || 'Assigned'}
                </span>
              </span>
              {onMessage ? (
                <Button size="sm" variant="ghost" onClick={() => onMessage(member)}>Message</Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </PanelCard>
  );
}