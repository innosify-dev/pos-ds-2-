import { retailConfig } from '../config/retail.config.js';
import {
  AnalyticsIcon,
  CategoriesIcon,
  CustomersIcon,
  DashboardIcon,
  InventoryIcon,
  ProductsIcon,
  RefundsIcon,
  RegistersIcon,
  ReturnIcon,
  SalesIcon,
  SettingsIcon,
  TeamIcon,
} from './icons.jsx';

const base = retailConfig.routePrefix;

/**
 * Retail module navigation — sidebar items.
 * Add items here only when the corresponding screen/route exists.
 */
export const retailNavigation = {
  primary: [
    { label: 'Home', path: `${base}/counter`, icon: <DashboardIcon />, permission: 'pos.use', roles: ['CASHIER'] },
    { label: 'Home', path: `${base}/stockroom`, icon: <DashboardIcon />, permission: 'inventory.manage', roles: ['INVENTORY_STAFF'] },
    { label: 'Dashboard', path: `${base}/dashboard`, icon: <DashboardIcon />, permission: 'dashboard.view' },
    { label: 'Billing', path: `${base}/pos`, icon: <SalesIcon />, permission: 'pos.use' },
    {
      label: 'Inventory',
      icon: <InventoryIcon />,
      children: [
        { label: 'Products', path: `${base}/products`, icon: <ProductsIcon />, permission: 'products.view' },
        { label: 'Categories', path: `${base}/categories`, icon: <CategoriesIcon />, permission: 'products.view' },
        { label: 'Brands', path: `${base}/brands`, permission: 'products.view' },
        { label: 'Stock', path: `${base}/inventory`, permission: 'inventory.manage' },
        { label: 'Purchases', path: `${base}/purchases`, permission: 'purchases.manage' },
        { label: 'Suppliers', path: `${base}/suppliers`, permission: 'purchases.manage' },
      ],
    },
    { label: 'Registers', path: `${base}/registers`, icon: <RegistersIcon />, permission: 'registers.manage' },
    { label: 'Branches', path: `${base}/branches`, permission: 'branches.view' },
    { label: 'Sales', path: `${base}/sales`, icon: <SalesIcon />, permission: 'sales.view' },
    { label: 'Return', path: `${base}/returns`, icon: <ReturnIcon />, permission: 'returns.create' },
    { label: 'Refunds', path: `${base}/refunds`, icon: <RefundsIcon />, permission: 'refunds.manage' },
    { label: 'Customers', path: `${base}/customers`, icon: <CustomersIcon />, permission: 'customers.view' },
    { label: 'Team', path: `${base}/team`, icon: <TeamIcon />, permission: 'team.view' },
    { label: 'Analytics', path: `${base}/analytics`, icon: <AnalyticsIcon />, permission: 'analytics.view' },
  ],
  footer: [
    { label: 'Subscription', path: `${base}/subscription`, permission: 'subscription.view' },
    { label: 'Settings', path: `${base}/settings`, icon: <SettingsIcon />, permission: 'settings.manage' },
  ],
};

export { retailConfig };
