import { Link, Outlet, useLocation } from 'react-router-dom';
import { StoreTopBar } from '../components/dashboard/StoreTopBar.jsx';
import { RegistersProvider } from '../store/RegistersContext.jsx';
import { ProductsProvider } from '../store/ProductsContext.jsx';
import { BrandingEffect } from '@core/branding/applyBrand.js';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { ROLE_LABELS } from '@services/demo/permissions.js';
import { useTenant } from '@core/tenant/TenantProvider.jsx';

const routeTitles = {
  pos: 'Billing',
  inventory: 'Stock',
  purchases: 'Purchases',
  suppliers: 'Suppliers',
  branches: 'Branches',
  subscription: 'Subscription',
  dashboard: 'Dashboard',
  counter: 'Counter',
  stockroom: 'Stock desk',
  products: 'Products',
  categories: 'Categories',
  brands: 'Brands',
  registers: 'Registers',
  sales: 'Sales',
  returns: 'Return',
  refunds: 'Refunds',
  customers: 'Customers',
  team: 'Team',
  analytics: 'Analytics',
  settings: 'Settings',
};

/**
 * Retail-specific layout wrapper.
 * Renders the store context top bar (module-owned) around retail screens.
 * Core AppLayout stays generic — retail titles live here, inside the module.
 */
export function RetailLayout() {
  const location = useLocation();
  const { tenantUser, logout, memberships, membership } = useAuth();
  const { tenant, branches, branch, setBranchId, subscription } = useTenant();
  const segments = location.pathname.split('/').filter(Boolean);
  const segment = segments[segments.length - 1];
  const section = segments.find((part) => routeTitles[part]) || segment;
  const title = routeTitles[section] ?? 'Retail';
  const blocked = tenant?.status === 'SUSPENDED' || ['EXPIRED', 'SUSPENDED', 'CANCELED'].includes(subscription?.status);

  return (
    <RegistersProvider>
      <ProductsProvider>
      <BrandingEffect />
      <div className="flex min-h-full flex-col">
        <StoreTopBar
          title={title}
          dateLabel={new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          storeName={branch?.name || tenant?.name || 'Branch'}
          user={tenantUser}
          roleLabel={ROLE_LABELS[membership?.role] || membership?.role || ''}
          businessName={tenant?.name || ''}
          branchName={branch?.name || ''}
          notificationCount={blocked ? 1 : 0}
          notificationNote={blocked ? 'This business or its subscription is not active. The banner on this page has the details.' : ''}
          branches={branches}
          branchId={branch?.id}
          onBranch={setBranchId}
          onLogout={() => logout('tenant')}
        />
        {memberships.length > 1 && (
          <div className="bg-accent-muted px-5 py-1.5 text-xs text-accent">
            You belong to more than one business. <Link to="/app/businesses" className="font-semibold underline">Return to My Businesses</Link>
          </div>
        )}
        {blocked && (
          <div className="bg-danger-muted px-5 py-2 text-sm text-danger">
            This demo subscription or business is not active. Open <Link to="/retail/subscription" className="underline">Subscription</Link> or ask a platform admin to restore it.
          </div>
        )}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
      </ProductsProvider>
    </RegistersProvider>
  );
}
