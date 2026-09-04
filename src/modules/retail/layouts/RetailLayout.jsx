import { Outlet, useLocation } from 'react-router-dom';
import { StoreTopBar } from '../components/dashboard/StoreTopBar.jsx';
import { RegistersProvider } from '../store/RegistersContext.jsx';
import { ProductsProvider } from '../store/ProductsContext.jsx';
import { dashboardMeta } from '../data/dashboard.data.js';

const routeTitles = {
  dashboard: 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  registers: 'Registers',
  sales: 'Sales',
  returns: 'Return',
  refunds: 'Refunds',
  customers: 'Customers',
};

/**
 * Retail-specific layout wrapper.
 * Renders the store context top bar (module-owned) around retail screens.
 * Core AppLayout stays generic — retail titles live here, inside the module.
 */
export function RetailLayout() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);
  const segment = segments[segments.length - 1];
  // Form screens (…/new, …/:id/edit) inherit the parent section title.
  const section = segments.length > 2 && ['new', 'edit'].includes(segment) ? segments[segments.length - 2] : segment;
  const title = routeTitles[section] ?? 'Retail';

  return (
    <RegistersProvider>
      <ProductsProvider>
      <div className="flex min-h-full flex-col">
        <StoreTopBar
          title={title}
          dateLabel={dashboardMeta.dateLabel}
          storeName={dashboardMeta.storeName}
          userName={dashboardMeta.userName}
          notificationCount={dashboardMeta.notificationCount}
        />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
      </ProductsProvider>
    </RegistersProvider>
  );
}
