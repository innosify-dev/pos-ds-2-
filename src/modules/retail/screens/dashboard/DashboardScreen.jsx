import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { ShiftTracker } from '@shared/display/ShiftTracker';
import {
  QuickAddModal,
  RestockCard,
  SalesChart,
  SalesTargetCard,
  StaffOnDuty,
  StatCard,
  TopProducts,
  WorkingHoursTracker,
} from '@modules/retail/components/dashboard';
import { demoMode, useDemo } from '@services/demo';
import { BranchDashboard } from './BranchDashboard.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { dashboardModel } from '@services/demo/metrics.js';
import { ROLE_LABELS } from '@services/demo/permissions.js';
import { useToast } from '@shared/feedback/Toast.jsx';

export function DashboardScreen() {
  const { state, dispatch } = useDemo();
  const { tenant, branch, branches } = useTenant();
  const { tenantUser, can, membership } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [branchOnly, setBranchOnly] = useState(false);
  const lockedToBranch = branches.length <= 1;
  const model = useMemo(
    () => dashboardModel(state, tenant?.id, (branchOnly || lockedToBranch) && branch?.id ? { branchId: branch.id } : {}),
    [state, tenant?.id, branchOnly, lockedToBranch, branch?.id],
  );

  const displayName = `${tenantUser?.firstName || ''} ${tenantUser?.lastName || ''}`.trim() || 'there';
  const hour = new Date().getHours();
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const monthValue = model.months.at(-1)?.value || 0;
  const target = 100000;
  const achieved = Math.min(100, Math.round((monthValue / target) * 100));

  const handleQuickAdd = (product) => {
    const result = dispatch({
      type: 'product.save',
      tenantId: tenant.id,
      product: {
        name: product.name,
        sku: `QA-${Date.now().toString(36).toUpperCase()}`,
        category: product.category,
        brand: tenant?.name || 'House',
        price: 100,
        costPrice: 60,
        taxRate: tenant?.type === 'tiles' ? 18 : 5,
        stock: 5,
        lowStock: 2,
        stockByBranch: { [branch?.id || 'unassigned']: 5 },
        status: 'Active',
        returnable: true,
      },
    });
    toast.push(result.ok ? `${product.name} added to ${tenant.name}` : result.error, result.ok ? 'success' : 'danger');
  };

  const importCsv = async (file) => {
    const text = await file.text();
    const rows = text.split(/\r?\n/).slice(1).filter(Boolean);
    let added = 0;
    rows.forEach((row) => {
      const [name, sku, price] = row.split(',');
      if (!name || !sku) return;
      const result = dispatch({
        type: 'product.save',
        tenantId: tenant.id,
        product: {
          name: name.trim(),
          sku: sku.trim(),
          category: state.categories.find((item) => item.tenantId === tenant.id)?.name || 'General',
          brand: tenant.name,
          price: Number(price) || 0,
          costPrice: 0,
          taxRate: 5,
          stock: 0,
          stockByBranch: { [branch?.id || 'unassigned']: 0 },
          lowStock: 2,
        },
      });
      if (result.ok) added += 1;
    });
    toast.push(added ? `Imported ${added} products` : 'No rows were imported', added ? 'success' : 'danger');
  };

  const ownerAdmin = membership?.role === 'OWNER' || membership?.role === 'BUSINESS_ADMIN';
  if (!ownerAdmin) return <BranchDashboard />;
  const inr = (value) => `₹${Math.round(Number(value) || 0).toLocaleString('en-IN')}`;
  const salesEmpty = model.todayOrders === 0 && model.months.every((point) => point.value === 0);
  const averageBill = model.todayOrders ? Math.round(model.todayTotal / model.todayOrders) : null;
  const recentSales = [...model.recent].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const todayLabel = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  const ownerStats = [
    {
      id: 'todays-sales',
      label: "Today's Sales",
      value: model.todayTotal,
      hint: monthValue ? `${inr(monthValue)} this month` : 'No sales yet today',
      to: can('sales.view') ? '/retail/sales' : undefined,
      icon: 'trend',
      format: (value) => inr(value),
    },
    {
      id: 'todays-orders',
      label: "Today's Transactions",
      value: model.todayOrders,
      hint: averageBill != null ? `${inr(averageBill)} average bill` : 'No bills yet today',
      to: can('sales.view') ? '/retail/sales' : undefined,
      icon: 'bag',
    },
    {
      id: 'total-products',
      label: 'Total Products',
      value: model.productCount,
      hint: model.productCount ? `${model.categoryCount} categories` : 'Add your first product',
      to: can('products.view') ? '/retail/products' : undefined,
      icon: 'box',
    },
    {
      id: 'low-stock',
      label: 'Low Stock',
      value: model.lowStock,
      hint: model.lowStock ? 'Needs attention' : 'No low-stock items',
      to: can('inventory.manage') ? '/retail/inventory' : (can('products.view') ? '/retail/products' : undefined),
      icon: 'alert',
      tone: 'warning',
    },
  ];

  return (
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 p-3 sm:p-4">
        <header className="flex flex-col gap-2 rounded-xl border border-border bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-content">{hello}, {displayName}</h2>
            <p className="truncate text-xs text-content-muted">
              {tenant?.name || 'This business'}
              {branch?.name ? ` · ${branch.name}` : ''}
              {' · '}
              {todayLabel}
              {(branchOnly || lockedToBranch) && branch?.name ? ' · Selected branch' : ' · All branches'}
              {demoMode ? ' · Demo data' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {branches.length > 1 && (
              <Button size="sm" variant={branchOnly ? 'primary' : 'outline'} onClick={() => setBranchOnly((value) => !value)}>
                {branchOnly ? branch?.name : 'All branches'}
              </Button>
            )}
            {can('pos.use') && (
              <Button size="sm" onClick={() => navigate('/retail/pos')}>New bill</Button>
            )}
            {can('products.manage') && (
              <Button size="sm" variant="outline" onClick={() => navigate('/retail/products/new')}>Add product</Button>
            )}
            {can('products.manage') && (
              <Button size="sm" variant="outline" onClick={() => setQuickAddOpen(true)}>Add new</Button>
            )}
            {can('products.manage') && (
              <label className="inline-flex h-8 cursor-pointer items-center rounded-xl border border-border bg-surface px-3 text-xs font-medium text-content">
                Import
                <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => event.target.files?.[0] && importCsv(event.target.files[0])} />
              </label>
            )}
          </div>
        </header>

        {model.productCount === 0 && salesEmpty && (
          <p className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-content-muted">
            This business has no products or sales yet.
            {can('products.manage') && <> <button type="button" className="font-medium text-accent" onClick={() => navigate('/retail/products/new')}>Add your first product</button>.</>}
            {can('pos.use') && <> <button type="button" className="font-medium text-accent" onClick={() => navigate('/retail/pos')}>Start a sale</button> when the catalog is ready.</>}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {ownerStats.map((stat) => (
            <StatCard key={stat.id} {...stat} compact />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <SalesChart points={model.months} className="lg:col-span-2" compact showSaleLink={can('pos.use')} />
          <div className="flex flex-col gap-3">
            <section className="premium-card p-3">
              <h3 className="text-sm font-semibold text-content">Quick actions</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {can('pos.use') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/pos')}>New bill</Button>}
                {can('products.manage') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/products/new')}>Add product</Button>}
                {can('products.view') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/categories')}>Categories</Button>}
                {can('inventory.manage') && <Button size="sm" variant="outline" onClick={() => navigate('/retail/inventory')}>Stock</Button>}
              </div>
            </section>
            <RestockCard
              dense
              items={model.lowItems.map((item) => ({ id: item.id, name: item.name, sku: item.sku, left: item.stock, tone: item.stock === 0 ? 'danger' : 'warning', action: 'Restock' }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <section className="premium-card p-3">
            <h3 className="text-sm font-semibold text-content">Recent transactions</h3>
            <p className="text-[11px] text-content-muted">From recorded sales in this view</p>
            {recentSales.length === 0 ? (
              <p className="py-3 text-xs text-content-muted">No transactions yet.</p>
            ) : (
              <ul className="mt-1">
                {recentSales.map((sale) => (
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
          <TopProducts dense items={model.topProducts.map((item) => ({ ...item, revenue: Math.round(item.revenue) }))} />
          <StaffOnDuty
            dense
            members={model.staff.map((member) => ({
              ...member,
              role: ROLE_LABELS[member.role] || member.role,
              initials: member.name.split(' ').map((part) => part[0]).join('').slice(0, 2),
              status: 'Assigned',
            }))}
            onInvite={can('team.view') || can('team.manage') ? () => navigate('/retail/team') : undefined}
          />
        </div>

        <WorkingHoursTracker hourly={model.hourly} className="p-3" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <SalesTargetCard
            dense
            target={{
              achieved,
              legend: [
                { label: 'This month', value: inr(monthValue), color: 'var(--color-accent)' },
                { label: 'Demo target', value: '₹1,00,000', color: 'var(--color-gold)' },
              ],
            }}
          />
          <ShiftTracker compact />
        </div>

        <QuickAddModal
          open={quickAddOpen}
          categories={[...new Set(state.categories.filter((item) => item.tenantId === tenant?.id).map((item) => item.name))]}
          onClose={() => setQuickAddOpen(false)}
          onSubmit={handleQuickAdd}
        />
      </div>
    );
}
