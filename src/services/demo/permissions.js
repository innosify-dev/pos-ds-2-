/** Demo role permissions. These are UI and mock-store checks, not a security boundary. */

export const ROLE_LABELS = {
  OWNER: 'Owner/Admin',
  BUSINESS_ADMIN: 'Owner/Admin',
  BRANCH_MANAGER: 'Branch Head',
  CASHIER: 'Cashier',
  INVENTORY_STAFF: 'Inventory Staff',
  SUPER_ADMIN: 'Super Admin',
};

const ALL = ['*'];

export const ROLE_PERMISSIONS = {
  OWNER: ALL,
  BUSINESS_ADMIN: [
    'dashboard.view',
    'pos.use',
    'products.manage',
    'inventory.manage',
    'purchases.manage',
    'customers.manage',
    'sales.view',
    'returns.manage',
    'refunds.manage',
    'registers.manage',
    'branches.manage',
    'team.manage',
    'analytics.view',
    'settings.manage',
    'subscription.view',
  ],
  BRANCH_MANAGER: [
    'dashboard.view',
    'pos.use',
    'products.view',
    'inventory.manage',
    'purchases.manage',
    'customers.manage',
    'sales.view',
    'returns.manage',
    'refunds.manage',
    'registers.manage',
    'branches.view',
    'team.view',
    'analytics.view',
  ],
  CASHIER: ['pos.use', 'sales.view', 'returns.create', 'customers.view', 'customers.create'],
  INVENTORY_STAFF: ['products.manage', 'inventory.manage', 'purchases.manage'],
  SUPER_ADMIN: ['platform.access'],
};

export const ROUTE_PERMISSIONS = {
  '/retail/dashboard': 'dashboard.view',
  '/retail/counter': 'pos.use',
  '/retail/pos': 'pos.use',
  '/retail/stockroom': 'inventory.manage',
  '/retail/products': 'products.view',
  '/retail/categories': 'products.view',
  '/retail/brands': 'products.view',
  '/retail/inventory': 'inventory.manage',
  '/retail/purchases': 'purchases.manage',
  '/retail/suppliers': 'purchases.manage',
  '/retail/registers': 'registers.manage',
  '/retail/branches': 'branches.view',
  '/retail/sales': 'sales.view',
  '/retail/returns': 'returns.create',
  '/retail/refunds': 'refunds.manage',
  '/retail/customers': 'customers.view',
  '/retail/team': 'team.view',
  '/retail/analytics': 'analytics.view',
  '/retail/subscription': 'subscription.view',
  '/retail/settings': 'settings.manage',
};

const MANAGE_IMPLIES_VIEW = {
  'products.view': 'products.manage',
  'branches.view': 'branches.manage',
  'team.view': 'team.manage',
  'returns.create': 'returns.manage',
  'customers.view': 'customers.manage',
};

export function hasPermission(role, permission) {
  if (!permission) return true;
  const granted = ROLE_PERMISSIONS[role] ?? [];
  if (granted.includes('*') || granted.includes(permission)) return true;
  const manager = MANAGE_IMPLIES_VIEW[permission];
  return Boolean(manager && granted.includes(manager));
}

export function landingPath({ memberships, role, preferredTenantId, lastTenantId }) {
  if (role === 'SUPER_ADMIN') return '/platform/dashboard';
  const active = memberships?.filter((item) => item.status === 'ACTIVE') ?? [];
  if (active.length === 0) return '/app/businesses/new';
  if (role === 'CASHIER') return '/retail/counter';
  if (role === 'INVENTORY_STAFF') return '/retail/stockroom';
  if (role === 'BRANCH_MANAGER') return '/retail/dashboard';
  if (active.length > 1) {
    const preferred = preferredTenantId && active.some((item) => item.tenantId === preferredTenantId);
    const last = lastTenantId && active.some((item) => item.tenantId === lastTenantId);
    if (!preferred && !last) return '/app/businesses';
  }
  if (role === 'CASHIER') return '/retail/counter';
  if (role === 'INVENTORY_STAFF') return '/retail/stockroom';
  return '/retail/dashboard';
}

export function permissionForPath(pathname) {
  const match = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`));
  return match ? ROUTE_PERMISSIONS[match] : null;
}
