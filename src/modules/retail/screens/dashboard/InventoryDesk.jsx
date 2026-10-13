import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { StatCard } from '@modules/retail/components/dashboard';
import { StockBadge } from '@modules/retail/components/inventory/StockBadge.jsx';
import { buildMovements, formatWhen, stockLabel, visibleQty } from '@modules/retail/components/inventory/inventoryView.js';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useDemo } from '@services/demo';
import { landingPath } from '@services/demo/permissions.js';

/**
 * Inventory home for stock staff. Quantities are the authorized branches only.
 */
export function InventoryDesk() {
  const { state } = useDemo();
  const { tenant, branch, branches } = useTenant();
  const { role, memberships, tenantUser, can, lastTenantId } = useAuth();
  const navigate = useNavigate();

  if (role && role !== 'INVENTORY_STAFF') {
    return <Navigate to={landingPath({ memberships, role, lastTenantId, preferredTenantId: tenantUser?.preferredTenantId })} replace />;
  }

  const branchIds = branches.map((item) => item.id);
  const products = state.products.filter((item) => item.tenantId === tenant?.id);
  const rows = products.map((product) => {
    const qty = visibleQty(product, branchIds);
    return { product, qty, status: stockLabel(qty, product.lowStock) };
  });
  const low = rows.filter((row) => row.status === 'Low Stock');
  const out = rows.filter((row) => row.status === 'Out of Stock');
  const purchases = state.purchases.filter((item) => item.tenantId === tenant?.id && branchIds.includes(item.branchId));
  const waiting = purchases.filter((item) => item.status && item.status !== 'RECEIVED');
  const movements = buildMovements(state, tenant?.id, branchIds, state.users).slice(0, 6);
  const counts = [
    { label: 'In Stock', value: rows.filter((row) => row.status === 'In Stock').length },
    { label: 'Low Stock', value: low.length },
    { label: 'Out of Stock', value: out.length },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight text-content">Stock desk</h2>
          <p className="truncate text-xs text-content-muted">
            {tenant?.name || 'This business'}
            {branch?.name ? ` · ${branch.name}` : ''}
            {branches.length > 1 ? ` · ${branches.length} branches` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can('inventory.manage') && <Button size="sm" onClick={() => navigate('/retail/inventory')}>View stock</Button>}
          {can('products.manage') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/products/new')}>Add product</Button>}
        </div>
      </header>

      {branchIds.length === 0 && (
        <p className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-content-muted">No branch is assigned to this account.</p>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard compact id="total-products" label="Products" value={products.length} hint="In this business" to="/retail/products" icon="box" />
        <StatCard compact id="low-stock" label="Low stock" value={low.length} hint="Above zero, at or under the threshold" to="/retail/inventory" icon="alert" tone="warning" />
        <StatCard compact id="orders" label="Out of stock" value={out.length} hint="Zero at your branches" to="/retail/inventory" icon="alert" tone="danger" />
        <StatCard compact id="on-duty" label="Receipts waiting" value={waiting.length} hint={waiting.length ? 'Not marked received' : 'No receipt is waiting'} to="/retail/purchases" icon="bag" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <section className="premium-card p-3 lg:col-span-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-content">Low stock</h3>
            <button type="button" className="text-xs font-medium text-accent" onClick={() => navigate('/retail/inventory')}>Open stock</button>
          </div>
          {low.length + out.length === 0 ? (
            <p className="py-3 text-xs text-content-muted">No stock alerts at your branches.</p>
          ) : (
            <ul className="mt-1">
              {[...out, ...low].slice(0, 8).map((row) => (
                <li key={row.product.id} className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 text-xs last:border-b-0">
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-content">{row.product.name}</span>
                    <span className="text-content-muted">{row.product.sku} · {row.qty} on hand · threshold {row.product.lowStock ?? 0}</span>
                  </span>
                  <StockBadge status={row.status} />
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="premium-card p-3">
          <h3 className="text-sm font-semibold text-content">Stock status</h3>
          <ul className="mt-2 space-y-2">
            {counts.map((item) => (
              <li key={item.label} className="flex items-center justify-between text-sm">
                <span className="text-content-muted">{item.label}</span>
                <span className="font-semibold tabular-nums">{item.value}</span>
              </li>
            ))}
          </ul>
          <h3 className="mt-4 text-sm font-semibold text-content">Shortcuts</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate('/retail/products')}>Products</Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/retail/purchases')}>Purchases</Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/retail/inventory')}>Adjust stock</Button>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="premium-card p-3">
          <h3 className="text-sm font-semibold text-content">Stock movement</h3>
          <p className="text-[11px] text-content-muted">Sales, receipts, adjustments, and transfers already recorded.</p>
          {movements.length === 0 ? (
            <p className="py-3 text-xs text-content-muted">No stock movement is recorded for your branches.</p>
          ) : (
            <ul className="mt-1">
              {movements.map((move) => (
                <li key={move.id} className="border-b border-border/60 py-1.5 text-xs last:border-b-0">
                  <span className="font-medium text-content">{move.productName}</span>
                  <span className="text-content-muted"> · {move.delta > 0 ? `+${move.delta}` : move.delta} · {formatWhen(move.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="premium-card p-3">
          <h3 className="text-sm font-semibold text-content">Branch products</h3>
          <p className="text-[11px] text-content-muted">A per-product update time is not stored. Quantities are current on-hand.</p>
          {rows.length === 0 ? (
            <p className="py-3 text-xs text-content-muted">This business has no products yet.</p>
          ) : (
            <ul className="mt-1">
              {rows.slice(0, 6).map((row) => (
                <li key={row.product.id} className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 text-xs last:border-b-0">
                  <span className="min-w-0 truncate font-medium">{row.product.name}</span>
                  <span className="shrink-0 text-content-muted">{row.qty} · {row.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
