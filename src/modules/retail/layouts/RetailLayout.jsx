import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { StoreTopBar } from '../components/dashboard/StoreTopBar.jsx';
import { RegistersProvider } from '../store/RegistersContext.jsx';
import { ProductsProvider } from '../store/ProductsContext.jsx';
import { BrandingEffect } from '@core/branding/applyBrand.js';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { ROLE_LABELS } from '@services/demo/permissions.js';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useDemo } from '@services/demo';
import { branchStock } from '@services/demo/engine.js';

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
  const { tenantUser, logout, memberships, membership, can } = useAuth();
  const { tenant, branches, branch, setBranchId, subscription } = useTenant();
  const { state } = useDemo();
  const navigate = useNavigate();
  const segments = location.pathname.split('/').filter(Boolean);
  const segment = segments[segments.length - 1];
  const section = segments.find((part) => routeTitles[part]) || segment;
  const title = routeTitles[section] ?? 'Retail';
  const blocked = tenant?.status === 'SUSPENDED' || ['EXPIRED', 'SUSPENDED', 'CANCELED'].includes(subscription?.status);
  const notifications = [];
  if (tenant && branch && (can('inventory.manage') || can('products.view'))) {
    state.products.filter((product) => product.tenantId === tenant.id).forEach((product) => {
      const qty = branchStock(product, branch.id);
      const low = Number(product.lowStock) || 0;
      if (qty <= 0) notifications.push({ id: `out-${product.id}`, text: `${product.name} is out of stock at ${branch.name}.`, onOpen: () => navigate('/retail/inventory') });
      else if (low > 0 && qty <= low) notifications.push({ id: `low-${product.id}`, text: `${product.name} is low at ${branch.name} (${qty} left).`, onOpen: () => navigate('/retail/inventory') });
    });
  }
  (state.registerSessions || []).filter((session) => session.tenantId === tenant?.id && session.branchId === branch?.id && session.status === 'Closed' && session.differencePaise).slice(-3).forEach((session) => {
    notifications.push({
      id: `var-${session.id}`,
      text: `Register closed with a cash variance of ₹${(session.differencePaise / 100).toFixed(2)}.`,
      onOpen: () => navigate(can('registers.manage') ? '/retail/registers' : '/retail/counter'),
    });
  });
  if (subscription?.status === 'TRIALING' && subscription.trialEndsAt && can('subscription.view')) {
    notifications.push({
      id: 'trial',
      text: `Trial ends ${new Date(subscription.trialEndsAt).toLocaleDateString('en-IN')}.`,
      onOpen: () => navigate('/retail/subscription'),
    });
  }

  return (
    <RegistersProvider>
      <ProductsProvider>
      <BrandingEffect />
      <div className="flex min-h-full flex-col">
        <StoreTopBar
          title={title}
          can={can}
          role={membership?.role}
          dateLabel={new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          storeName={branch?.name || tenant?.name || 'Branch'}
          user={tenantUser}
          roleLabel={ROLE_LABELS[membership?.role] || membership?.role || ''}
          businessName={tenant?.name || ''}
          branchName={branch?.name || ''}
          notificationCount={notifications.length}
          notificationNote={blocked ? 'This business or its subscription is not active. The banner on this page has the details.' : ''}
          notifications={notifications.slice(0, 8)}
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
