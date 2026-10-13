import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { SalesChart, StaffOnDuty, StatCard, TopProducts } from '@modules/retail/components/dashboard';
import { stockLabel, visibleQty } from '@modules/retail/components/inventory/inventoryView.js';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useDemo } from '@services/demo';
import { dashboardModel } from '@services/demo/metrics.js';
import { ROLE_LABELS } from '@services/demo/permissions.js';

const inr = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

/**
 * Branch operations for a manager. Figures use the selected authorized branch.
 */
export function BranchDashboard() {
  const { state } = useDemo();
  const { tenant, branch, branches } = useTenant();
  const { can } = useAuth();
  const navigate = useNavigate();
  const branchId = branch?.id;
  const model = useMemo(
    () => dashboardModel(state, tenant?.id, branchId ? { branchId } : {}),
    [state, tenant?.id, branchId],
  );

  const products = state.products.filter((item) => item.tenantId === tenant?.id);
  const stockRows = products.map((product) => {
    const qty = branchId ? visibleQty(product, [branchId]) : visibleQty(product, branches.map((item) => item.id));
    return { product, qty, status: stockLabel(qty, product.lowStock) };
  });
  const low = stockRows.filter((row) => row.status === 'Low Stock');
  const out = stockRows.filter((row) => row.status === 'Out of Stock');
  const registers = state.registers.filter((item) => item.tenantId === tenant?.id && (!branchId || item.branchId === branchId));
  const openRegisters = registers.filter((item) => item.status === 'Open');
  const staff = state.memberships
    .filter((item) => item.tenantId === tenant?.id && item.status === 'ACTIVE' && (!branchId || !item.branchIds?.length || item.branchIds.includes(branchId)))
    .map((membership) => {
      const person = state.users.find((user) => user.id === membership.userId);
      return {
        id: membership.id,
        name: person ? `${person.firstName} ${person.lastName}` : 'Staff',
        role: ROLE_LABELS[membership.role] || membership.role,
        initials: person ? `${person.firstName?.[0] || ''}${person.lastName?.[0] || ''}`.slice(0, 2) : 'S',
        status: 'Assigned',
      };
    });
  const recent = [...model.recent].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const stats = [
    { id: 'todays-sales', label: "Today's sales", value: model.todayTotal, hint: branch?.name || 'This branch', to: can('sales.view') ? '/retail/sales' : undefined, icon: 'trend', format: inr },
    { id: 'todays-orders', label: "Today's transactions", value: model.todayOrders, hint: model.todayOrders ? 'Recorded at this branch' : 'No bills yet today', to: can('sales.view') ? '/retail/sales' : undefined, icon: 'bag' },
    { id: 'low-stock', label: 'Low stock', value: low.length, hint: low.length ? 'Above zero, at or under the threshold' : 'None at this branch', to: can('inventory.manage') ? '/retail/inventory' : undefined, icon: 'alert', tone: 'warning' },
    { id: 'on-duty', label: 'Open registers', value: openRegisters.length, hint: registers.length ? `${registers.length} registers at this branch` : 'No registers at this branch', to: can('registers.manage') ? '/retail/registers' : undefined, icon: 'bag', tone: 'success' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-content">{branch?.name || 'Branch'}</h2>
          <p className="truncate text-xs text-content-muted">
            {tenant?.name || 'This business'}
            {' · '}
            {todayLabel}
            {' · Branch operations'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can('pos.use') && <Button size="sm" onClick={() => navigate('/retail/pos')}>New bill</Button>}
          {can('sales.view') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/sales')}>Sales</Button>}
        </div>
      </header>

      {!branchId && (
        <p className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-content-muted">No branch is selected for this account.</p>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map((stat) => <StatCard key={stat.id} {...stat} compact />)}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <SalesChart points={model.months} className="lg:col-span-2" compact showSaleLink={can('pos.use')} />
        <section className="premium-card p-3">
          <h3 className="text-sm font-semibold text-content">Quick actions</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {can('sales.view') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/sales')}>View sales</Button>}
            {can('inventory.manage') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/inventory')}>View stock</Button>}
            {can('registers.manage') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/registers')}>Registers</Button>}
            {can('team.view') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/team')}>Staff</Button>}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="premium-card p-3">
          <h3 className="text-sm font-semibold text-content">Recent transactions</h3>
          <p className="text-[11px] text-content-muted">{branch?.name || 'This branch'}</p>
          {recent.length === 0 ? (
            <p className="py-3 text-xs text-content-muted">No transactions at this branch yet.</p>
          ) : (
            <ul className="mt-1">
              {recent.map((sale) => (
                <li key={sale.id} className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 text-xs last:border-b-0">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-content">{sale.invoiceNo || 'Sale'}</span>
                    <span className="text-content-muted">{new Date(sale.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">{inr((sale.totalPaise || 0) / 100)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="premium-card p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-content">Stock alerts</h3>
            {can('inventory.manage') && (
              <button type="button" className="text-xs font-medium text-accent" onClick={() => navigate('/retail/inventory')}>Open stock</button>
            )}
          </div>
          {low.length + out.length === 0 ? (
            <p className="py-3 text-xs text-content-muted">No low-stock or out-of-stock products at this branch.</p>
          ) : (
            <ul className="mt-1">
              {[...out, ...low].slice(0, 6).map((row) => (
                <li key={row.product.id} className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 text-xs last:border-b-0">
                  <span className="min-w-0 truncate font-medium">{row.product.name}</span>
                  <span className={row.status === 'Out of Stock' ? 'text-danger' : 'text-warning'}>{row.status} · {row.qty}</span>
                </li>
              ))}
            </ul>
          )}
          <h3 className="mt-3 text-sm font-semibold text-content">Registers</h3>
          {registers.length === 0 ? (
            <p className="py-2 text-xs text-content-muted">No register is assigned to this branch.</p>
          ) : (
            <ul className="mt-1">
              {registers.map((register) => (
                <li key={register.id} className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 text-xs last:border-b-0">
                  <span className="font-medium">{register.name}</span>
                  <span className="text-content-muted">{register.status || 'Not recorded'}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <StaffOnDuty dense members={staff} onInvite={can('team.manage') ? () => navigate('/retail/team') : undefined} />
      </div>

      <TopProducts dense items={model.topProducts.map((item) => ({ ...item, revenue: Math.round(item.revenue) }))} />
    </div>
  );
}
