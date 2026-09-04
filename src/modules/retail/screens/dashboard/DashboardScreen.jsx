import {
  InventoryAttention,
  QuickActions,
  RecentSales,
  SalesChart,
  StatCard,
} from '@modules/retail/components/dashboard';
import {
  dashboardMeta,
  dashboardStats,
  inventoryAttention,
  quickActions,
  recentSales,
  todaysSalesChart,
} from '@modules/retail/data';

/**
 * Retail dashboard screen — store overview (stats, sales, inventory, quick actions).
 * Store top bar is rendered by RetailLayout.
 */
export function DashboardScreen() {
  return (
    <div className="space-y-4 bg-surface-elevated/50 p-5">
        <div>
          <h2 className="text-base font-semibold text-content">Dashboard</h2>
          <p className="mt-0.5 text-xs text-content-muted">
            Welcome back, {dashboardMeta.userName}! Here&apos;s what&apos;s happening in your store today.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((s) => (
            <StatCard key={s.id} {...s} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SalesChart points={todaysSalesChart} />
          <RecentSales rows={recentSales} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <InventoryAttention items={inventoryAttention} />
          <QuickActions actions={quickActions} />
        </div>
    </div>
  );
}
