import { useMemo, useState } from 'react';
import { Badge } from '@shared/display/Badge';
import { ConfirmationDialog } from '@shared/dialogs/ConfirmationDialog';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { AddMemberModal, STAFF_ROLES } from '@modules/retail/components/team/AddMemberModal';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useDemo } from '@services/demo';
import { DEMO_PASSWORD } from '@services/demo/seed.js';
import { ROLE_LABELS } from '@services/demo/permissions.js';
import { useToast } from '@shared/feedback/Toast.jsx';

function displayName(user) {
  if (!user) return 'Staff';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
}

export function TeamScreen() {
  const { state, dispatch } = useDemo();
  const { tenant, branches } = useTenant();
  const { can, role } = useAuth();
  const toast = useToast();
  const canManage = can('team.manage');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editor, setEditor] = useState(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const allowed = useMemo(() => new Set(branches.map((branch) => branch.id)), [branches]);

  const people = useMemo(() => {
    return state.memberships
      .filter((membership) => membership.tenantId === tenant?.id)
      .filter((membership) => {
        const ids = membership.branchIds || [];
        if (!ids.length) return canManage;
        return ids.some((id) => allowed.has(id));
      })
      .map((membership) => {
        const person = state.users.find((user) => user.id === membership.userId);
        const sales = state.sales.filter((sale) => sale.cashierId === membership.userId && sale.tenantId === tenant.id && allowed.has(sale.branchId));
        return {
          membership,
          person,
          name: displayName(person),
          email: person?.email || '',
          phone: person?.phone || '',
          sales: sales.length,
          branches: (membership.branchIds || []).map((id) => state.branches.find((branch) => branch.id === id)?.name).filter(Boolean),
        };
      });
  }, [allowed, canManage, state.branches, state.memberships, state.sales, state.users, tenant?.id]);

  const visible = people.filter((item) => {
    if (roleFilter !== 'all' && item.membership.role !== roleFilter) return false;
    const text = `${item.name} ${item.email} ${item.phone}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const activeCount = people.filter((item) => item.membership.status === 'ACTIVE').length;

  const saveNew = (form) => {
    if (busy) return { ok: false, error: 'Please wait.' };
    const email = form.email.trim().toLowerCase();
    const existing = state.users.find((user) => user.email === email);
    const already = existing && state.memberships.some((item) => item.userId === existing.id && item.tenantId === tenant.id && item.status === 'ACTIVE');
    if (already) return { ok: false, error: 'That email is already active on this business.' };
    setBusy(true);
    if (!existing) {
      const created = dispatch({
        type: 'user.signup',
        email,
        password: DEMO_PASSWORD,
        fullName: form.name,
        phone: form.phone,
      });
      if (!created.ok) {
        setBusy(false);
        return { ok: false, error: created.error };
      }
    }
    const result = dispatch({
      type: 'staff.invite',
      tenantId: tenant.id,
      email,
      role: form.role,
      branchIds: form.branchIds,
      assignNow: true,
      actorRole: role,
      actor: 'owner',
    });
    setBusy(false);
    if (!result.ok) return { ok: false, error: result.error };
    toast.push(`${form.name} was added to this demo business. No email was sent.`, 'success');
    return { ok: true };
  };

  const saveEdit = (form) => {
    if (!editor?.membership || busy) return { ok: false, error: 'Please wait.' };
    setBusy(true);
    const result = dispatch({
      type: 'staff.update',
      id: editor.membership.id,
      patch: { role: form.role, branchIds: form.branchIds },
    });
    setBusy(false);
    if (!result.ok) return { ok: false, error: result.error };
    toast.push('Staff access updated', 'success');
    return { ok: true };
  };

  const setStatus = (item, status) => {
    const result = dispatch({ type: 'staff.update', id: item.membership.id, patch: { status } });
    toast.push(result.ok ? (status === 'ACTIVE' ? 'Employee activated' : 'Employee deactivated') : result.error, result.ok ? 'success' : 'danger');
    setConfirm(null);
  };

  return (
    <div className="min-w-0 space-y-4 p-4 sm:p-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-content">Team</h2>
          <p className="mt-0.5 max-w-xl text-xs text-content-muted">
            People on {tenant?.name}. Branch heads see only staff assigned to their branches. Roles use the existing permissions.
          </p>
        </div>
        {canManage && <Button onClick={() => setEditor({ mode: 'add' })}>Add employee</Button>}
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ['People', people.length],
          ['Active', activeCount],
          ['Branches in view', branches.length],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs text-content-muted">{label}</p>
            <p className="mt-1 text-xl font-semibold text-content">{value}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="min-w-0 sm:max-w-xs sm:flex-1">
          <Input aria-label="Search employees" placeholder="Search name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <div className="sm:w-48">
          <Select aria-label="Filter by role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All roles</option>
            {STAFF_ROLES.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <h3 className="text-sm font-semibold text-content">No employees assigned to this branch.</h3>
          <p className="mt-1 text-xs text-content-muted">Staff from other businesses stay off this list.</p>
        </div>
      ) : (
        <>
          <div className="hidden min-w-0 overflow-x-auto rounded-xl border border-border bg-surface md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-content-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">Employee</th>
                  <th className="px-3 py-2 font-semibold">Role</th>
                  <th className="px-3 py-2 font-semibold">Branches</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="px-3 py-2 font-semibold">Billed sales</th>
                  <th className="px-3 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.membership.id} className="border-t border-border">
                    <td className="px-3 py-3">
                      <p className="font-medium text-content">{item.name}</p>
                      <p className="text-xs text-content-muted">{item.email}{item.phone ? ` · ${item.phone}` : ''}</p>
                    </td>
                    <td className="px-3 py-3">{ROLE_LABELS[item.membership.role] || item.membership.role}</td>
                    <td className="px-3 py-3">{item.branches.join(', ') || '—'}</td>
                    <td className="px-3 py-3">
                      <Badge variant={item.membership.status === 'ACTIVE' ? 'success' : 'default'}>{item.membership.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-3 py-3">{item.sales}</td>
                    <td className="px-3 py-3">
                      <RowActions item={item} canManage={canManage} onEdit={() => setEditor({ mode: 'edit', item })} onStatus={() => (item.membership.status === 'ACTIVE' ? setConfirm(item) : setStatus(item, 'ACTIVE'))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 md:hidden">
            {visible.map((item) => (
              <article key={item.membership.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{item.name}</h3>
                    <p className="truncate text-xs text-content-muted">{item.email}</p>
                  </div>
                  <Badge variant={item.membership.status === 'ACTIVE' ? 'success' : 'default'}>{item.membership.status === 'ACTIVE' ? 'Active' : 'Inactive'}</Badge>
                </div>
                <p className="mt-2 text-sm">{ROLE_LABELS[item.membership.role] || item.membership.role}</p>
                <p className="text-xs text-content-muted">{item.branches.join(', ') || 'No branch'} · {item.sales} billed sales</p>
                <div className="mt-3">
                  <RowActions item={item} canManage={canManage} onEdit={() => setEditor({ mode: 'edit', item })} onStatus={() => (item.membership.status === 'ACTIVE' ? setConfirm(item) : setStatus(item, 'ACTIVE'))} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <AddMemberModal
        open={Boolean(editor)}
        mode={editor?.mode || 'add'}
        branches={branches}
        busy={busy}
        initial={editor?.mode === 'edit' ? {
          name: editor.item.name,
          email: editor.item.email,
          phone: editor.item.phone,
          role: editor.item.membership.role,
          branchIds: editor.item.membership.branchIds || [],
        } : null}
        onClose={() => !busy && setEditor(null)}
        onSubmit={editor?.mode === 'edit' ? saveEdit : saveNew}
      />

      <ConfirmationDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={() => confirm && setStatus(confirm, 'INACTIVE')}
        title="Deactivate employee"
        message={confirm ? `Deactivate ${confirm.name} on ${tenant?.name}? They keep their record and lose access until activated again.` : ''}
        confirmLabel="Deactivate"
        variant="danger"
      />
    </div>
  );
}

function RowActions({ canManage, onEdit, onStatus, item }) {
  if (!canManage) return <span className="text-xs text-content-muted">View only</span>;
  const active = item.membership.status === 'ACTIVE';
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
      <Button size="sm" variant={active ? 'ghost' : 'secondary'} onClick={onStatus}>{active ? 'Deactivate' : 'Activate'}</Button>
    </div>
  );
}
