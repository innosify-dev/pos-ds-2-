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
    { label: 'Dashboard', path: `${base}/dashboard`, icon: <DashboardIcon /> },
    {
      label: 'Inventory',
      icon: <InventoryIcon />,
      children: [
        { label: 'Products', path: `${base}/products`, icon: <ProductsIcon /> },
        { label: 'Categories', path: `${base}/categories`, icon: <CategoriesIcon /> },
        { label: 'Brands', path: `${base}/brands` },
      ],
    },
    { label: 'Registers', path: `${base}/registers`, icon: <RegistersIcon /> },
    { label: 'Sales', path: `${base}/sales`, icon: <SalesIcon /> },
    { label: 'Return', path: `${base}/returns`, icon: <ReturnIcon /> },
    { label: 'Refunds', path: `${base}/refunds`, icon: <RefundsIcon /> },
    { label: 'Customers', path: `${base}/customers`, icon: <CustomersIcon /> },
    { label: 'Team', path: `${base}/team`, icon: <TeamIcon /> },
    { label: 'Analytics', path: `${base}/analytics`, icon: <AnalyticsIcon /> },
  ],
  footer: [{ label: 'Settings', path: `${base}/settings`, icon: <SettingsIcon /> }],
};

export { retailConfig };
