import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '@shared/display/Badge';
import { Button } from '@shared/ui/Button';
import { AccountMenu } from '@core/auth/AccountMenu.jsx';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { ROLE_LABELS, hasPermission } from '@services/demo/permissions.js';

export function WorkspaceLayout({ children }) {
  const { tenantUser, logout } = useAuth();
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link to="/app/businesses" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-xs text-content-inverse">IP</span>
            Innosify POS
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-content-muted">
            <Link to="/app/businesses">My Businesses</Link>
            <Link to="/app/subscriptions">Subscriptions</Link>
            <Link to="/app/profile">Account</Link>
          </nav>
          <div className="ml-auto">
            <AccountMenu user={tenantUser} onLogout={() => logout('tenant')} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}

export function BusinessesScreen() {
  const { businesses, tenantUser, selectBusiness, memberships, tenantSession } = useAuth();
  const navigate = useNavigate();
  const open = (tenantId, path) => {
    const result = selectBusiness(tenantId);
    if (!result.ok) return;
    navigate(path || result.to);
  };

  return (
    <WorkspaceLayout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-content">My Businesses</h1>
          <p className="mt-1 max-w-xl text-sm text-content-muted">
            Welcome back{tenantUser ? `, ${tenantUser.firstName}` : ''}. Each card is a separate business on this account. Opening one does not load another shop.
          </p>
        </div>
        <Button onClick={() => navigate('/app/businesses/new')}>Create new business</Button>
      </div>
      {businesses.length === 0 ? (
        <div className="premium-card mt-8 border-dashed p-10 text-center">
          <h2 className="font-semibold">No businesses yet</h2>
          <p className="mt-2 text-sm text-content-muted">Create your first shop to open the POS. This stays on the same account.</p>
          <Button className="mt-4" onClick={() => navigate('/app/businesses/new')}>Start onboarding</Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {businesses.map(({ tenant, plan, subscription, branches, staff, membership }) => {
            const current = tenantSession?.tenantId === tenant.id;
            const suspended = tenant.status === 'SUSPENDED';
            const canBranches = hasPermission(membership.role, 'branches.view');
            const canEdit = hasPermission(membership.role, 'settings.manage');
            return (
              <article key={tenant.id} className={`premium-card flex flex-col p-5 ${current ? 'ring-2 ring-accent' : ''}`} aria-current={current ? 'true' : undefined}>
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-semibold text-white" style={{ background: tenant.primaryColor }}>
                    {tenant.logoDataUrl ? <img src={tenant.logoDataUrl} alt="" className="h-full w-full object-cover" /> : tenant.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold text-content">{tenant.name}</h2>
                    <p className="text-xs capitalize text-content-muted">{String(tenant.type || '').replace('-', ' ')}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={suspended ? 'danger' : 'success'}>{suspended ? 'Suspended' : 'Active'}</Badge>
                  {current && <Badge variant="accent">Current business</Badge>}
                  {tenantUser?.preferredTenantId === tenant.id && <Badge>Preferred</Badge>}
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-xs text-content-muted">Your role</dt><dd>{ROLE_LABELS[membership.role] || membership.role}</dd></div>
                  <div><dt className="text-xs text-content-muted">Plan</dt><dd>{plan?.name || '—'} · {subscription?.status || '—'}</dd></div>
                  <div><dt className="text-xs text-content-muted">Branches</dt><dd>{branches}</dd></div>
                  <div><dt className="text-xs text-content-muted">Employees</dt><dd>{staff}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => open(tenant.id)} disabled={suspended}>{suspended ? 'Suspended' : 'Open business'}</Button>
                  {canBranches && <Button size="sm" variant="outline" onClick={() => open(tenant.id, '/retail/branches')} disabled={suspended}>View branches</Button>}
                  {canEdit && <Button size="sm" variant="outline" onClick={() => open(tenant.id, '/retail/settings')} disabled={suspended}>Edit business</Button>}
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-xs text-content-muted">{memberships.length} membership{memberships.length === 1 ? '' : 's'} on this account. Other shops in the demo are hidden until this login is a member.</p>
    </WorkspaceLayout>
  );
}

export function WorkspaceSubscriptionsScreen() {
  const { businesses } = useAuth();
  return (
    <WorkspaceLayout>
      <h1 className="text-2xl font-semibold">Subscriptions</h1>
      <p className="mt-1 text-sm text-content-muted">A subscription belongs to a business, not to the whole login.</p>
      <div className="mt-4 space-y-3">
        {businesses.map(({ tenant, plan, subscription }) => (
          <article key={tenant.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
            <div>
              <h2 className="font-semibold">{tenant.name}</h2>
              <p className="text-sm text-content-muted">{plan?.name} · {subscription?.status}</p>
            </div>
            <Link to="/pricing" className="text-sm text-accent">Compare plans</Link>
          </article>
        ))}
      </div>
    </WorkspaceLayout>
  );
}
