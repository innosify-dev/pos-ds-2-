import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { AccountMenu } from '@core/auth/AccountMenu.jsx';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { demoMode, useDemo } from '@services/demo';
import { formatPaise } from '@services/demo/money.js';
import { useToast } from '@shared/feedback/Toast.jsx';
import { platformMetrics } from '@services/demo/metrics.js';
import { DEMO_PASSWORD } from '@services/demo/seed.js';

const NAV = [
  ['/platform/dashboard', 'Dashboard'],
  ['/platform/tenants', 'Businesses'],
  ['/platform/plans', 'Plans'],
  ['/platform/subscriptions', 'Subscriptions'],
  ['/platform/customers', 'Customers'],
  ['/platform/payments', 'Payments'],
  ['/platform/audit-logs', 'Audit logs'],
  ['/platform/support', 'Support'],
  ['/platform/settings', 'Settings'],
];

function PlatformNav({ onNavigate }) {
  return (
    <>
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">Innosify</p>
        <p className="mt-1 text-sm font-semibold">Platform</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 text-sm">
        {NAV.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) => `rounded-lg px-3 py-2 transition ${isActive ? 'bg-white/15 font-medium text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export function PlatformLayout() {
  const { platformUser, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <div className="flex min-h-screen bg-canvas text-content">
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar text-white md:flex">
        <PlatformNav />
        <button type="button" className="m-2 rounded-lg border border-white/15 px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10" onClick={() => logout('platform')}>Logout</button>
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/50" aria-label="Close navigation" onClick={close} />
          <aside className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col bg-sidebar text-white shadow-2xl">
            <PlatformNav onNavigate={close} />
            <button type="button" className="m-2 rounded-lg border border-white/15 px-3 py-2 text-left text-sm text-white/80" onClick={() => logout('platform')}>Logout</button>
          </aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-border/80 bg-surface px-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border md:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </button>
            <p className="truncate text-sm text-content-muted">Platform session · separate from shop accounts</p>
          </div>
          <AccountMenu
            user={platformUser}
            roleLabel="Super Admin"
            showAccountLinks={false}
            onLogout={() => logout('platform')}
          />
        </header>
        <main className="p-3 sm:p-4"><Outlet /></main>
      </div>
    </div>
  );
}

export function PlatformLoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('superadmin@demo.innosify.test');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const signIn = (identity, secret) => {
    const result = login({ email: identity, password: secret, scope: 'platform' });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    navigate('/platform/dashboard');
  };
  const submit = (event) => {
    event.preventDefault();
    signIn(email, password);
  };
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="auth-panel hidden flex-col justify-between p-12 text-white lg:flex">
        <p className="text-sm font-semibold">Innosify POS</p>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Private portal</p>
          <h2 className="mt-3 max-w-sm text-4xl font-semibold">Operate every demo business from one console.</h2>
        </div>
        <p className="text-xs text-white/60">Super Admin only. Customer shops never see this screen.</p>
      </section>
      <section className="flex items-center justify-center bg-canvas px-6">
        <form onSubmit={submit} className="premium-card w-full max-w-md p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Private demo</p>
          <h1 className="mt-2 text-3xl font-semibold">Platform login</h1>
          <p className="mt-2 text-sm text-content-muted">Super Admin uses a separate platform session. Shop staff sign in on the customer login page.</p>
          <div className="mt-5 space-y-3">
            <Input label="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          <Button className="mt-5 w-full" type="submit" size="lg">Enter platform</Button>
          {demoMode && (
            <Button className="mt-3 w-full" type="button" variant="outline" onClick={() => signIn('superadmin@demo.innosify.test', DEMO_PASSWORD)}>
              Explore Demo
            </Button>
          )}
        </form>
      </section>
    </main>
  );
}

function Card({ label, value }) {
  return (
    <article className="premium-card p-4">
      <p className="text-xs font-medium text-content-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </article>
  );
}

export function PlatformDashboardScreen() {
  const { state } = useDemo();
  const metrics = platformMetrics(state);
  const activeBusinesses = state.tenants.filter((tenant) => tenant.status === 'ACTIVE').length;
  const businesses = state.tenants.map((tenant) => {
    const subscription = state.subscriptions.find((item) => item.tenantId === tenant.id);
    const plan = state.plans.find((item) => item.code === subscription?.planCode);
    const assignedAt = subscription?.history?.[0]?.at || null;
    return { tenant, subscription, plan, assignedAt };
  }).sort((a, b) => new Date(b.assignedAt || 0) - new Date(a.assignedAt || 0));
  const activity = [...(state.audit || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const openTickets = (state.tickets || []).filter((ticket) => ticket.status !== 'CLOSED');

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3">
      <header className="rounded-xl border border-border bg-surface px-4 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Platform</h1>
        <p className="text-xs text-content-muted">Counts come from demo businesses, plans, and audit entries. Payments are not collected here.</p>
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        <Card label="Businesses" value={metrics.businesses} />
        <Card label="Active businesses" value={activeBusinesses} />
        <Card label="Branches" value={state.branches.length} />
        <Card label="Customer accounts" value={metrics.users} />
        <Card label="Active trials" value={metrics.trialing} />
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="premium-card p-3 lg:col-span-1">
          <h2 className="text-sm font-semibold">Subscription distribution</h2>
          <ul className="mt-2">
            {metrics.distribution.map((row) => (
              <li key={row.code} className="flex items-center justify-between border-b border-border/60 py-1.5 text-sm last:border-b-0">
                <span>{row.name}</span>
                <span className="font-semibold tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] text-content-muted">{metrics.active} active plans · {metrics.expired} expired, canceled, or suspended</p>
        </section>
        <section className="premium-card p-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Businesses</h2>
            <Link to="/platform/tenants" className="text-xs font-medium text-accent">Open list</Link>
          </div>
          <p className="text-[11px] text-content-muted">Sorted by plan assignment. A separate registration date is not stored.</p>
          {businesses.length === 0 ? (
            <p className="py-3 text-xs text-content-muted">No businesses yet.</p>
          ) : (
            <ul className="mt-1">
              {businesses.map(({ tenant, subscription, plan, assignedAt }) => (
                <li key={tenant.id} className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 text-xs last:border-b-0">
                  <span className="min-w-0">
                    <Link className="block truncate font-medium text-accent" to={`/platform/tenants/${tenant.id}`}>{tenant.name}</Link>
                    <span className="text-content-muted">{tenant.city || 'City not recorded'} · {tenant.status}</span>
                  </span>
                  <span className="shrink-0 text-right text-content-muted">
                    <span className="block text-content">{plan?.name || subscription?.planCode || 'No plan'}</span>
                    {assignedAt ? new Date(assignedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not recorded'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="premium-card p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Platform activity</h2>
            <Link to="/platform/audit-logs" className="text-xs font-medium text-accent">Audit log</Link>
          </div>
          {activity.length === 0 ? (
            <p className="py-3 text-xs text-content-muted">No platform activity is recorded.</p>
          ) : (
            <ul className="mt-1">
              {activity.map((entry) => (
                <li key={entry.id} className="border-b border-border/60 py-1.5 text-xs last:border-b-0">
                  <span className="font-medium text-content">{entry.summary || entry.action}</span>
                  <span className="block text-content-muted">{entry.actor || 'Not recorded'} · {entry.createdAt ? new Date(entry.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : 'Time not recorded'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="premium-card p-3">
          <h2 className="text-sm font-semibold">Open support tickets</h2>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{openTickets.length}</p>
          <p className="text-xs text-content-muted">From recorded tickets. Closing a ticket does not bill anyone.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/platform/tenants" className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium">Businesses</Link>
            <Link to="/platform/plans" className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium">Plans</Link>
            <Link to="/platform/subscriptions" className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium">Subscriptions</Link>
            <Link to="/platform/support" className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium">Support</Link>
            <Link to="/platform/settings" className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium">Settings</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export function TenantsScreen() {
  const { state, dispatch } = useDemo();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [form, setForm] = useState({ name: '', email: 'owner@demo.newshop.test' });
  const rows = state.tenants.filter((tenant) => {
    const text = `${tenant.name} ${tenant.city}`.toLowerCase().includes(query.toLowerCase());
    return text && (status === 'ALL' || tenant.status === status);
  });
  const create = () => {
    let owner = state.users.find((user) => user.email === form.email.trim().toLowerCase());
    if (!owner) {
      const signed = dispatch({ type: 'user.signup', email: form.email, password: DEMO_PASSWORD, firstName: 'New', lastName: 'Owner' });
      if (!signed.ok) return;
      owner = signed.state.users.find((user) => user.email === form.email.trim().toLowerCase());
    }
    dispatch({
      type: 'business.create',
      userId: owner.id,
      name: form.name,
      businessType: 'retail',
      email: form.email,
      phone: '9800000000',
      address: 'Demo address',
      city: 'Chennai',
      planCode: 'STARTER',
      branchName: 'Main Branch',
      primaryColor: '#6B238F',
      secondaryColor: '#EEE4F5',
    });
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold">Tenants</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search businesses" />
        <select className="rounded border border-border px-2" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>
      <div className="mt-4 overflow-x-auto premium-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-xs uppercase text-content-muted"><tr><th className="p-3">Business</th><th>Plan</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map((tenant) => {
              const sub = state.subscriptions.find((item) => item.tenantId === tenant.id);
              return (
                <tr key={tenant.id} className="border-b border-[#EEF2F6]">
                  <td className="p-3"><Link className="font-medium text-accent" to={`/platform/tenants/${tenant.id}`}>{tenant.name}</Link><div className="text-xs text-content-muted">{tenant.city}</div></td>
                  <td>{sub?.planCode}</td>
                  <td>{tenant.status}</td>
                  <td className="p-3 text-right">
                    {tenant.status === 'ACTIVE'
                      ? <Button size="sm" variant="outline" onClick={() => dispatch({ type: 'tenant.suspend', tenantId: tenant.id, actor: 'superadmin' })}>Suspend</Button>
                      : <Button size="sm" onClick={() => dispatch({ type: 'tenant.reactivate', tenantId: tenant.id, actor: 'superadmin' })}>Reactivate</Button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <form className="mt-4 grid max-w-xl gap-2 premium-card p-4" onSubmit={(event) => { event.preventDefault(); create(); }}>
        <h2 className="font-semibold">Create tenant</h2>
        <Input label="Business name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <Input label="Owner email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}

export function TenantDetailScreen() {
  const { tenantId } = useParams();
  const { state, dispatch } = useDemo();
  const tenant = state.tenants.find((item) => item.id === tenantId);
  if (!tenant) return <p>Tenant not found.</p>;
  const owners = state.memberships.filter((item) => item.tenantId === tenant.id).map((membership) => ({ membership, user: state.users.find((item) => item.id === membership.userId) }));
  const sub = state.subscriptions.find((item) => item.tenantId === tenant.id);
  const resend = () => dispatch({ type: 'staff.invite', tenantId: tenant.id, email: `owner.resend.${Date.now().toString(36)}@demo.innosify.test`, role: 'OWNER', actor: 'superadmin' });
  return (
    <div className="space-y-4">
      <Link to="/platform/tenants" className="text-sm text-accent">Back to tenants</Link>
      <h1 className="text-2xl font-semibold">{tenant.name}</h1>
      <p className="text-sm text-content-muted">{tenant.type} · {tenant.status} · {sub?.planCode} · {sub?.status}</p>
      <section className="premium-card p-4">
        <h2 className="font-semibold">People</h2>
        <ul className="mt-2 text-sm">{owners.map(({ membership, user }) => <li key={membership.id}>{user?.email} · {membership.role}</li>)}</ul>
        <Button className="mt-3" size="sm" variant="outline" onClick={resend}>Resend invitation simulation</Button>
      </section>
      <section className="premium-card p-4">
        <h2 className="font-semibold">Branches</h2>
        <ul className="mt-2 text-sm">{state.branches.filter((branch) => branch.tenantId === tenant.id).map((branch) => <li key={branch.id}>{branch.name} · {branch.city}</li>)}</ul>
      </section>
    </div>
  );
}

export function PlansScreen() {
  const { state, dispatch } = useDemo();
  const toast = useToast();
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const save = (event) => {
    event.preventDefault();
    if (saving || !draft) return;
    if (!draft.name?.trim()) {
      toast.push('Plan name is required.', 'danger');
      return;
    }
    if (draft.pricePaise < 0) {
      toast.push('Price cannot be negative.', 'danger');
      return;
    }
    setSaving(true);
    const result = dispatch({ type: 'plan.save', actor: 'superadmin', plan: { ...draft, name: draft.name.trim() } });
    setSaving(false);
    if (result?.ok === false) {
      toast.push(result.error, 'danger');
      return;
    }
    toast.push('Plan saved in this browser’s demo catalog. No customer was billed.', 'success');
    setDraft(null);
  };
  return (
    <div>
      <h1 className="text-2xl font-semibold">Plans</h1>
      <p className="mt-1 max-w-2xl text-sm text-content-muted">Platform catalog for this demo. Editing a plan changes the stored demo record. It does not charge a card or publish a new price list.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {state.plans.map((plan) => (
          <article key={plan.code} className="premium-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{plan.name}</h2>
              <span className="text-xs">{plan.active ? 'Active' : 'Inactive'}</span>
            </div>
            <p className="text-sm">{formatPaise(plan.pricePaise)} · {plan.interval || 'MONTHLY'} · trial {plan.trialDays || 0} days</p>
            <p className="mt-2 text-xs text-content-muted">Branches {plan.limits.branches} · Registers {plan.limits.registers} · Users {plan.limits.users} · Transactions {plan.limits.transactionsPerMonth}</p>
            <ul className="mt-2 text-sm">{(plan.features || []).map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <Button className="mt-3" size="sm" variant="outline" onClick={() => setDraft({ ...plan, limits: { ...plan.limits } })}>Edit</Button>
          </article>
        ))}
      </div>
      {draft && (
        <form className="premium-card mt-4 grid max-w-lg gap-2 p-4" onSubmit={save}>
          <Input label="Name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
          <Input label="Price (paise)" type="number" value={draft.pricePaise} onChange={(event) => setDraft({ ...draft, pricePaise: Number(event.target.value) })} />
          <Input label="Branch limit" type="number" value={draft.limits.branches} onChange={(event) => setDraft({ ...draft, limits: { ...draft.limits, branches: Number(event.target.value) } })} />
          <Input label="Register limit" type="number" value={draft.limits.registers} onChange={(event) => setDraft({ ...draft, limits: { ...draft.limits, registers: Number(event.target.value) } })} />
          <Input label="User limit" type="number" value={draft.limits.users} onChange={(event) => setDraft({ ...draft, limits: { ...draft.limits, users: Number(event.target.value) } })} />
          <label className="text-sm"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} /> Active</label>
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save plan'}</Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function PlatformSubscriptionsScreen() {
  const { state, dispatch } = useDemo();
  const [tenantId, setTenantId] = useState(state.tenants[0]?.id || '');
  const [planCode, setPlanCode] = useState('PROFESSIONAL');
  const apply = (eventType, extra = {}) => dispatch({
    type: 'subscription.assign',
    tenantId,
    planCode,
    actor: 'superadmin',
    eventType,
    note: 'Changed from the platform demo',
    ...extra,
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Subscriptions</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <select className="rounded border px-2 py-2" value={tenantId} onChange={(event) => setTenantId(event.target.value)}>
          {state.tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
        </select>
        <select className="rounded border px-2 py-2" value={planCode} onChange={(event) => setPlanCode(event.target.value)}>
          {state.plans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name}</option>)}
        </select>
        <Button onClick={() => apply('PLAN_CHANGED')}>Assign plan</Button>
        <Button variant="outline" onClick={() => apply('RENEWED', { status: 'ACTIVE' })}>Renew</Button>
        <Button variant="outline" onClick={() => apply('TRIAL_EXTENDED', { status: 'TRIALING', extendTrialDays: 14 })}>Extend trial</Button>
        <Button variant="outline" onClick={() => apply('SUSPENDED', { status: 'SUSPENDED' })}>Suspend</Button>
      </div>
      <p className="mt-3 text-xs text-content-muted">These actions update the demo subscription only. No payment is collected.</p>
      <ul className="mt-4 space-y-2 text-sm">
        {state.subscriptions.map((subscription) => (
          <li key={subscription.id} className="premium-card p-3">
            {state.tenants.find((tenant) => tenant.id === subscription.tenantId)?.name} · {subscription.planCode} · {subscription.status}
            <div className="text-xs text-content-muted">
              {subscription.trialEndsAt ? `Trial ends ${new Date(subscription.trialEndsAt).toLocaleDateString('en-IN')}` : 'No trial date'}
              {subscription.renewsAt ? ` · Recorded renewal ${new Date(subscription.renewsAt).toLocaleDateString('en-IN')}` : ''}
            </div>
            <div className="text-xs text-content-muted">{subscription.history?.[0]?.type} {subscription.history?.[0]?.note}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlatformCustomersScreen() {
  const { state } = useDemo();
  const rows = state.users.filter((user) => user.email !== 'superadmin@demo.innosify.test');
  return (
    <div>
      <h1 className="text-2xl font-semibold">Customers</h1>
      <ul className="mt-4 space-y-2">
        {rows.map((user) => {
          const memberships = state.memberships.filter((item) => item.userId === user.id);
          return (
            <li key={user.id} className="premium-card p-3 text-sm">
              <p className="font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-content-muted">{user.email}</p>
              <p>{memberships.map((item) => `${state.tenants.find((tenant) => tenant.id === item.tenantId)?.name} (${item.role})`).join(', ') || 'No business yet'}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function PlatformPaymentsScreen() {
  const { state } = useDemo();
  const invoices = useMemo(() => state.subscriptions.map((subscription) => {
    const plan = state.plans.find((item) => item.code === subscription.planCode);
    const tenant = state.tenants.find((item) => item.id === subscription.tenantId);
    return { id: subscription.id, tenant: tenant?.name, plan: plan?.name, amount: plan?.pricePaise || 0, status: subscription.status === 'SUSPENDED' ? 'PAST DUE' : 'SIMULATED' };
  }), [state]);
  return (
    <div>
      <h1 className="text-2xl font-semibold">Payments</h1>
      <p className="mt-1 text-sm text-content-muted">Simulated subscription invoices. No card or bank was charged.</p>
      <table className="mt-4 w-full text-left text-sm">
        <thead><tr><th className="p-2">Business</th><th>Plan</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-t"><td className="p-2">{invoice.tenant}</td><td>{invoice.plan}</td><td>{formatPaise(invoice.amount)}</td><td>{invoice.status}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AuditLogsScreen() {
  const { state } = useDemo();
  return (
    <div>
      <h1 className="text-2xl font-semibold">Audit logs</h1>
      <ul className="mt-4 space-y-2 text-sm">
        {state.audit.map((entry) => (
          <li key={entry.id} className="premium-card p-3">
            <span className="font-medium">{entry.action}</span> · {entry.summary}
            <div className="text-xs text-content-muted">{new Date(entry.createdAt).toLocaleString()} · {entry.actor}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SupportScreen() {
  const { state, dispatch } = useDemo();
  const [subject, setSubject] = useState('Cannot print a label');
  return (
    <div>
      <h1 className="text-2xl font-semibold">Support</h1>
      <ul className="mt-4 space-y-2">
        {state.tickets.map((ticket) => (
          <li key={ticket.id} className="premium-card p-3 text-sm">
            <p className="font-medium">{ticket.subject}</p>
            <p className="text-content-muted">{state.tenants.find((tenant) => tenant.id === ticket.tenantId)?.name} · {ticket.status}</p>
            <p className="mt-1">{ticket.body}</p>
            <Button className="mt-2" size="sm" variant="outline" onClick={() => dispatch({ type: 'ticket.update', id: ticket.id, patch: { status: ticket.status === 'CLOSED' ? 'OPEN' : 'CLOSED' } })}>
              {ticket.status === 'CLOSED' ? 'Reopen' : 'Close'}
            </Button>
          </li>
        ))}
      </ul>
      <form className="mt-4 max-w-lg" onSubmit={(event) => { event.preventDefault(); dispatch({ type: 'ticket.save', record: { tenantId: state.tenants[0].id, subject, status: 'OPEN', priority: 'Normal', body: 'Logged from platform demo.', createdAt: new Date().toISOString() } }); }}>
        <Input label="New ticket subject" value={subject} onChange={(event) => setSubject(event.target.value)} />
        <Button className="mt-2" type="submit">Add ticket</Button>
      </form>
    </div>
  );
}

export function PlatformSettingsScreen() {
  const { state, dispatch, reset } = useDemo();
  const [companyName, setCompanyName] = useState(state.platformSettings.companyName);
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold">Platform settings</h1>
      <div className="mt-4 space-y-3 premium-card p-4">
        <Input label="Company name" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
        <p className="text-sm text-content-muted">Support email {state.platformSettings.supportEmail}. Default plans are the four catalog entries.</p>
        <Button onClick={() => dispatch({ type: 'platform.settings', patch: { companyName } })}>Save company name</Button>
        <Button variant="danger" onClick={() => {
          if (!window.confirm('Reset demo data? This restores the sample dataset stored in this browser. It does not affect accounts outside the demo.')) return;
          reset();
        }}>Reset Demo Data</Button>
      </div>
    </div>
  );
}
