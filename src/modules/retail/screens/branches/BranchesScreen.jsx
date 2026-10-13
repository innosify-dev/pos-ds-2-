import { useMemo, useState } from 'react';
import { Badge } from '@shared/display/Badge';
import { Drawer } from '@shared/dialogs/Drawer';
import { Modal, ModalFooter } from '@shared/dialogs/Modal';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useDemo } from '@services/demo';
import { branchStock } from '@services/demo/engine.js';
import { formatPaise } from '@services/demo/money.js';
import { ROLE_LABELS } from '@services/demo/permissions.js';
import { useToast } from '@shared/feedback/Toast.jsx';

const emptyForm = { name: '', code: '', address: '', city: '', phone: '', isDefault: false };

function personName(user) {
  if (!user) return '';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
}

export function BranchesScreen() {
  const { state, dispatch } = useDemo();
  const { tenant, branches } = useTenant();
  const { can } = useAuth();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [onlyDefault, setOnlyDefault] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState(null);
  const canManage = can('branches.manage');

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return branches
      .filter((branch) => !onlyDefault || branch.isDefault)
      .filter((branch) => {
        const text = `${branch.name} ${branch.code || ''} ${branch.city || ''} ${branch.address || ''}`.toLowerCase();
        return !needle || text.includes(needle);
      })
      .map((branch) => {
        const staff = state.memberships.filter((item) => item.tenantId === tenant?.id && item.status === 'ACTIVE' && (item.branchIds || []).includes(branch.id));
        const managers = staff.filter((item) => item.role === 'BRANCH_MANAGER');
        const registers = state.registers.filter((item) => item.tenantId === tenant?.id && item.branchId === branch.id);
        return { branch, staff, managers, registers };
      });
  }, [branches, onlyDefault, query, state.memberships, state.registers, tenant?.id]);

  const summary = useMemo(() => {
    const ids = new Set(branches.map((branch) => branch.id));
    const staff = state.memberships.filter((item) => item.tenantId === tenant?.id && item.status === 'ACTIVE' && (item.branchIds || []).some((id) => ids.has(id)));
    const registers = state.registers.filter((item) => item.tenantId === tenant?.id && ids.has(item.branchId));
    return { branches: branches.length, staff: staff.length, registers: registers.length };
  }, [branches, state.memberships, state.registers, tenant?.id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, city: tenant?.city || '' });
    setError('');
    setFormOpen(true);
  };

  const openEdit = (branch) => {
    setEditing(branch);
    setForm({
      name: branch.name || '',
      code: branch.code || '',
      address: branch.address || '',
      city: branch.city || '',
      phone: branch.phone || '',
      isDefault: Boolean(branch.isDefault),
    });
    setError('');
    setFormOpen(true);
  };

  const save = () => {
    if (saving) return;
    const name = form.name.trim();
    if (name.length < 2) {
      setError('Branch name is required.');
      return;
    }
    const duplicate = branches.some((branch) => branch.id !== editing?.id && branch.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) {
      setError('This business already has a branch with that name.');
      return;
    }
    if (form.phone.trim() && !/^[0-9+\-\s()]{8,16}$/.test(form.phone.trim())) {
      setError('Enter a valid phone number, or leave it blank.');
      return;
    }
    setSaving(true);
    const result = dispatch({
      type: 'branch.save',
      tenantId: tenant.id,
      branch: {
        ...(editing || {}),
        name,
        code: form.code.trim() || name.slice(0, 4).toUpperCase(),
        address: form.address.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        isDefault: form.isDefault,
      },
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.code === 'PLAN_LIMIT' ? `${result.error} Open Subscription to raise the branch limit.` : result.error);
      return;
    }
    toast.push(editing ? 'Branch updated' : 'Branch created', 'success');
    setFormOpen(false);
  };

  return (
    <div className="min-w-0 space-y-4 p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-content">Branches</h2>
          <p className="mt-0.5 text-xs text-content-muted">{tenant?.name} locations you are allowed to see. Counts come from this business only.</p>
        </div>
        {canManage && <Button onClick={openCreate}>Add branch</Button>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ['Branches', summary.branches],
          ['Staff on these branches', summary.staff],
          ['Registers', summary.registers],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-xs text-content-muted">{label}</p>
            <p className="mt-1 text-xl font-semibold text-content">{value}</p>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 sm:max-w-xs sm:flex-1">
          <Input aria-label="Search branches" placeholder="Search name, code, or city" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
        <Button variant={onlyDefault ? 'secondary' : 'outline'} size="sm" aria-pressed={onlyDefault} onClick={() => setOnlyDefault((value) => !value)}>
          {onlyDefault ? 'Showing default only' : 'Default branches'}
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <h3 className="text-sm font-semibold text-content">No branches yet. Create your first branch to start managing locations.</h3>
          <p className="mt-1 text-xs text-content-muted">This list stays empty until a branch is saved for {tenant?.name || 'this business'}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {rows.map(({ branch, staff, managers, registers }) => (
            <article key={branch.id} className="flex min-w-0 flex-col rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-content">{branch.name}</h3>
                  <p className="mt-0.5 text-xs text-content-muted">{branch.code || 'No code'} · {branch.city || 'City not set'}</p>
                </div>
                {branch.isDefault && <Badge variant="accent">Default</Badge>}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-content-muted">Address</dt>
                  <dd className="truncate">{branch.address || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-content-muted">Phone</dt>
                  <dd>{branch.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-content-muted">Manager</dt>
                  <dd className="truncate">{managers.map((item) => personName(state.users.find((user) => user.id === item.userId))).filter(Boolean).join(', ') || 'Not assigned'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-content-muted">Registers / staff</dt>
                  <dd>{registers.length} / {staff.length}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => setDetail(branch)}>View details</Button>
                {canManage && <Button size="sm" variant="secondary" onClick={() => openEdit(branch)}>Edit</Button>}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => !saving && setFormOpen(false)}
        title={editing ? 'Edit branch' : 'Add branch'}
        footer={<ModalFooter onCancel={() => setFormOpen(false)} onConfirm={save} confirmLabel={saving ? 'Saving…' : 'Save branch'} loading={saving} />}
      >
        <div className="grid gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">Branch information</p>
          <Input label="Branch name *" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          <Input label="Branch code" hint="Filled from the name when left blank." value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} />
          <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-accent">Contact and location</p>
          <Input label="Address" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
          <Input label="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
          <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-accent">Operations</p>
          <label className="flex items-center gap-2 text-sm text-content">
            <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm({ ...form, isDefault: event.target.checked })} />
            Default branch for this business
          </label>
          <p className="text-xs text-content-muted">Manager assignment is taken from staff whose role is Branch Head on this branch. Working hours are not stored on a branch.</p>
          {error && <p className="text-xs text-danger" role="alert">{error}</p>}
        </div>
      </Modal>

      <Drawer open={Boolean(detail)} onClose={() => setDetail(null)} title={detail?.name || 'Branch'} width="w-full max-w-md">
        {detail && <BranchDetail branch={detail} tenant={tenant} state={state} />}
      </Drawer>
    </div>
  );
}

function BranchDetail({ branch, tenant, state }) {
  const staff = state.memberships.filter((item) => item.tenantId === tenant?.id && item.status === 'ACTIVE' && (item.branchIds || []).includes(branch.id));
  const registers = state.registers.filter((item) => item.tenantId === tenant?.id && item.branchId === branch.id);
  const products = state.products.filter((item) => item.tenantId === tenant?.id);
  const units = products.reduce((sum, product) => sum + branchStock(product, branch.id), 0);
  const low = products.filter((product) => {
    const qty = branchStock(product, branch.id);
    return qty > 0 && qty <= (product.lowStock ?? 0);
  }).length;
  const sales = state.sales.filter((sale) => sale.tenantId === tenant?.id && sale.branchId === branch.id);
  const salesTotal = sales.reduce((sum, sale) => sum + sale.totalPaise, 0);
  const managers = staff.filter((item) => item.role === 'BRANCH_MANAGER');

  return (
    <div className="space-y-5 px-5 py-4 text-sm">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">Profile</h3>
        <dl className="mt-2 grid grid-cols-2 gap-3">
          <div><dt className="text-xs text-content-muted">Business</dt><dd>{tenant?.name}</dd></div>
          <div><dt className="text-xs text-content-muted">Code</dt><dd>{branch.code || '—'}</dd></div>
          <div className="col-span-2"><dt className="text-xs text-content-muted">Address</dt><dd>{[branch.address, branch.city].filter(Boolean).join(', ') || '—'}</dd></div>
          <div><dt className="text-xs text-content-muted">Phone</dt><dd>{branch.phone || '—'}</dd></div>
          <div><dt className="text-xs text-content-muted">Default</dt><dd>{branch.isDefault ? 'Yes' : 'No'}</dd></div>
        </dl>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">Manager</h3>
        {managers.length === 0 ? <p className="mt-2 text-content-muted">No branch head is assigned.</p> : (
          <ul className="mt-2 space-y-1">
            {managers.map((item) => <li key={item.id}>{personName(state.users.find((user) => user.id === item.userId))}</li>)}
          </ul>
        )}
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">Employees</h3>
        {staff.length === 0 ? <p className="mt-2 text-content-muted">No employees assigned to this branch.</p> : (
          <ul className="mt-2 space-y-1">
            {staff.map((item) => {
              const person = state.users.find((user) => user.id === item.userId);
              return <li key={item.id}>{personName(person) || person?.email} · {ROLE_LABELS[item.role] || item.role}</li>;
            })}
          </ul>
        )}
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">Registers</h3>
        {registers.length === 0 ? <p className="mt-2 text-content-muted">No registers configured for this branch.</p> : (
          <ul className="mt-2 space-y-1">
            {registers.map((item) => <li key={item.id}>{item.name} · {item.code} · {item.status}</li>)}
          </ul>
        )}
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-accent">From recorded demo data</h3>
        <dl className="mt-2 grid grid-cols-2 gap-3">
          <div><dt className="text-xs text-content-muted">Stock units</dt><dd>{units}</dd></div>
          <div><dt className="text-xs text-content-muted">Low-stock products</dt><dd>{low}</dd></div>
          <div><dt className="text-xs text-content-muted">Sales</dt><dd>{sales.length}</dd></div>
          <div><dt className="text-xs text-content-muted">Sales total</dt><dd>{formatPaise(salesTotal, tenant?.currency)}</dd></div>
        </dl>
      </section>
    </div>
  );
}
