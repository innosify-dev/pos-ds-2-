import { useMemo, useState } from 'react';
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
} from '@modules/retail/components/dashboard';
import {
  dashboardMeta,
  dashboardStats,
  monthlySalesChart,
  restockAlerts,
  salesTarget,
  staffOnDuty,
  topProducts,
} from '@modules/retail/data';

/**
 * Retail dashboard screen — animated store overview.
 * Layout mirrors the reference design: KPI row, analytics grid,
 * reminders + top products, then staff / target / shift tracker.
 */
export function DashboardScreen() {
  const [addedProducts, setAddedProducts] = useState([]);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const stats = useMemo(
    () =>
      dashboardStats.map((stat) =>
        stat.id === 'total-products' ? { ...stat, value: stat.value + addedProducts.length } : stat,
      ),
    [addedProducts.length],
  );

  const products = useMemo(
    () =>
      addedProducts.length === 0
        ? topProducts
        : [
            ...addedProducts.map((product, index) => ({
              id: `new-${product.name}`,
              name: product.name,
              category: product.category,
              sold: 0,
              revenue: 0,
              isNew: true,
              order: index,
            })),
            ...topProducts,
          ],
    [addedProducts],
  );

  const handleQuickAdd = (product) => setAddedProducts((prev) => [product, ...prev]);

  return (
    <div className="flex flex-col gap-4 bg-surface-elevated/40 p-5">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-content">Dashboard</h2>
          <p className="mt-0.5 text-xs text-content-muted">
            Welcome back, {dashboardMeta.userName}! Here&apos;s what&apos;s happening in your store today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="primary" onClick={() => setQuickAddOpen(true)}>
            + Add New
          </Button>
          <Button size="sm" variant="outline">
            + Import Data
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} {...stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SalesChart points={monthlySalesChart} className="lg:col-span-2" delay={120} />
        <RestockCard items={restockAlerts} delay={180} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StaffOnDuty members={staffOnDuty} className="lg:col-span-1" delay={240} />
        <SalesTargetCard target={salesTarget} className="lg:col-span-1" delay={300} />
        <div className="animate-fade-up lg:col-span-1" style={{ animationDelay: '360ms' }}>
          <ShiftTracker />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <TopProducts items={products} className="lg:col-span-2" delay={420} />
      </div>

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} onSubmit={handleQuickAdd} />
    </div>
  );
}