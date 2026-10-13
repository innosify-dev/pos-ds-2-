import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { StatCard } from '@modules/retail/components/dashboard';
import { CloseSessionModal, OpenSessionModal } from '@modules/retail/components/registers/RegisterModals.jsx';
import { useRegisters } from '@modules/retail/store/RegistersContext.jsx';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useDemo } from '@services/demo';
import { salesQuery } from '@services/demo/metrics.js';
import { landingPath } from '@services/demo/permissions.js';

const inr = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;

/**
 * Cashier home. Sales are this person's recorded bills at the selected branch.
 */
export function CashierDesk() {
  const { state } = useDemo();
  const { tenant, branch } = useTenant();
  const { role, memberships, tenantUser, can, lastTenantId } = useAuth();
  const { registers, openSession, closeSession } = useRegisters();
  const [openTarget, setOpenTarget] = useState(null);
  const [closeTarget, setCloseTarget] = useState(null);
  const navigate = useNavigate();

  const sales = useMemo(() => {
    if (!tenantUser?.id) return [];
    return salesQuery(state, { tenantId: tenant?.id, branchId: branch?.id, cashierId: tenantUser.id })
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [state, tenant?.id, branch?.id, tenantUser?.id]);

  if (role && role !== 'CASHIER') {
    return <Navigate to={landingPath({ memberships, role, lastTenantId, preferredTenantId: tenantUser?.preferredTenantId })} replace />;
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const today = sales.filter((sale) => new Date(sale.createdAt) >= todayStart);
  const todayTotal = today.reduce((sum, sale) => sum + (sale.totalPaise || 0), 0) / 100;
  const register = registers.find((item) => item.branchId === branch?.id && item.cashierId === tenantUser?.id)
    || registers.find((item) => item.branchId === branch?.id && item.status === 'Open');

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 p-3 sm:p-4">
      <section className="rounded-xl border border-border bg-surface px-4 py-4">
        <p className="text-xs font-medium text-content-muted">{branch?.name || 'No branch assigned'} · {tenant?.name || 'This business'}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-content">Ready to bill</h2>
        <p className="mt-1 text-sm text-content-muted">Open the till for this branch. Bills you complete show up here.</p>
        <Button className="mt-3 w-full sm:w-auto" size="lg" onClick={() => navigate('/retail/pos')}>Open POS</Button>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <StatCard compact id="todays-orders" label="Your bills today" value={today.length} hint={branch?.name || 'Assigned branch'} icon="bag" />
        <StatCard compact id="todays-sales" label="Your sales today" value={todayTotal} hint="Bills recorded under your name" icon="trend" format={inr} />
      </div>

      <section className="premium-card p-3">
        <h3 className="text-sm font-semibold text-content">Register</h3>
        {register ? (
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-content-muted">
              {register.name} · {register.status || 'Status not recorded'}
              {register.status === 'Open' ? ` · expected ₹${Number(register.expectedCash || 0).toLocaleString('en-IN')}` : ''}
            </p>
            {register.status === 'Open' ? (
              <Button size="sm" variant="outline" onClick={() => setCloseTarget(register)}>Close register</Button>
            ) : (
              <Button size="sm" onClick={() => setOpenTarget(register)}>Open register</Button>
            )}
          </div>
        ) : (
          <p className="mt-1 text-sm text-content-muted">No register is assigned to you at this branch.</p>
        )}
      </section>

      <section className="premium-card p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-content">Recent bills</h3>
          {can('sales.view') && (
            <button type="button" className="text-xs font-medium text-accent" onClick={() => navigate('/retail/sales')}>View sales</button>
          )}
        </div>
        {sales.length === 0 ? (
          <p className="py-3 text-xs text-content-muted">You have no recorded bills at this branch yet.</p>
        ) : (
          <ul className="mt-1">
            {sales.slice(0, 6).map((sale) => (
              <li key={sale.id} className="flex items-center justify-between gap-3 border-b border-border/60 py-1.5 text-xs last:border-b-0">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-content">{sale.invoiceNo || 'Sale'}</span>
                  <span className="text-content-muted">
                    {(sale.lines || []).map((line) => line.name).filter(Boolean).slice(0, 2).join(', ') || 'Items'}
                    {' · '}
                    {new Date(sale.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{inr((sale.totalPaise || 0) / 100)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="premium-card p-3">
        <h3 className="text-sm font-semibold text-content">Shortcuts</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate('/retail/pos')}>Open billing</Button>
          {can('sales.view') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/sales')}>Sales</Button>}
          {can('returns.create') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/returns')}>Returns</Button>}
          {can('customers.view') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/customers')}>Customers</Button>}
        </div>
      </section>
      <OpenSessionModal
        open={Boolean(openTarget)}
        register={openTarget}
        onClose={() => setOpenTarget(null)}
        onConfirm={({ openingCash, cashier }) => {
          openSession(openTarget.id, { openingCash, cashier: cashier || tenantUser?.firstName });
          setOpenTarget(null);
        }}
      />
      <CloseSessionModal
        open={Boolean(closeTarget)}
        register={closeTarget}
        onClose={() => setCloseTarget(null)}
        onConfirm={({ closingCash, reason }) => {
          closeSession(closeTarget.id, { closingCash, reason });
          setCloseTarget(null);
        }}
      />
    </div>
  );
}
