import { useMemo, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Tabs } from '@shared/navigation/Tabs';
import { StatCard } from '@modules/retail/components/dashboard/StatCard';
import { TeamMemberCard } from '@modules/retail/components/team/TeamMemberCard';
import { AddMemberModal } from '@modules/retail/components/team/AddMemberModal';
import { teamFilters, teamMembers, teamSummary } from '@modules/retail/data';

/**
 * Staff screen — filterable team grid.
 * Each member card shows shift progress, orders handled and sales.
 */
export function TeamScreen() {
  const [filter, setFilter] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [members, setMembers] = useState(teamMembers);

  const visible = useMemo(
    () => (filter === 'all' ? members : members.filter((member) => member.shift === filter)),
    [filter, members],
  );

  const stats = useMemo(
    () => [
      { id: 'on-duty', label: 'On Duty', value: teamSummary.onDuty, hint: `of ${teamSummary.totalMembers} members`, icon: 'box', trend: [3, 4, 4, 5, 5, 5, 5] },
      { id: 'orders', label: 'Orders Today', value: teamSummary.ordersToday, hint: 'across all registers', icon: 'bag', trend: [90, 96, 104, 112, 118, 124, 131] },
      { id: 'sales', label: 'Sales Today', value: teamSummary.salesToday, hint: 'billed by the team', icon: 'trend', featured: true, trend: [820, 900, 960, 1040, 1120, 1200, 1284] },
      { id: 'avg-rating', label: 'Avg Rating', value: 4.6, hint: 'out of 5', icon: 'tag', trend: [4.1, 4.2, 4.3, 4.4, 4.5, 4.5, 4.6] },
    ],
    [],
  );

  const handleAdd = (member) => setMembers((prev) => [member, ...prev]);

  return (
    <div className="flex flex-col gap-4 bg-surface-elevated/40 p-5">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-content">Team</h2>
          <p className="mt-0.5 text-xs text-content-muted">
            Manage shifts, review performance and message your store staff.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setAddOpen(true)}>
          + Add member
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.id}
            {...stat}
            index={index}
            round={stat.id !== 'avg-rating'}
            format={
              stat.id === 'sales'
                ? (v) => `₹${Math.round(v).toLocaleString('en-IN')}`
                : stat.id === 'avg-rating'
                  ? (v) => v.toFixed(1)
                  : (v) => Math.round(v).toLocaleString('en-IN')
            }
          />
        ))}
      </div>

      <div className="animate-fade-up flex flex-wrap items-center justify-between gap-3" style={{ animationDelay: '200ms' }}>
        <Tabs tabs={teamFilters} activeTab={filter} onChange={setFilter} variant="pills" />
        <span className="text-xs text-content-muted">
          Showing {visible.length} of {members.length} members
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((member, index) => (
          <TeamMemberCard key={member.id} member={member} index={index} />
        ))}
      </div>

      <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAdd} />
    </div>
  );
}