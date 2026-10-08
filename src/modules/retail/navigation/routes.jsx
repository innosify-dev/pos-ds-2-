import { Route, Navigate } from 'react-router-dom';
import { retailConfig } from '../config/retail.config.js';
import { RetailLayout } from '../layouts/RetailLayout.jsx';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen.jsx';
import { ProductsScreen } from '../screens/products/ProductsScreen.jsx';
import { ProductFormScreen } from '../screens/product-form/ProductFormScreen.jsx';
import { CategoriesScreen } from '../screens/categories/CategoriesScreen.jsx';
import { BrandsScreen } from '../screens/brands/BrandsScreen.jsx';
import { RegistersScreen } from '../screens/registers/RegistersScreen.jsx';
import { RegisterFormScreen } from '../screens/register-form/RegisterFormScreen.jsx';
import { SalesScreen } from '../screens/sales/SalesScreen.jsx';
import { ReturnsScreen } from '../screens/returns/ReturnsScreen.jsx';
import { RefundsScreen } from '../screens/refunds/RefundsScreen.jsx';
import { CustomersScreen } from '../screens/customers/CustomersScreen.jsx';
import { TeamScreen } from '../screens/team/TeamScreen.jsx';
import { AnalyticsScreen } from '../screens/analytics/AnalyticsScreen.jsx';
import { SettingsScreen } from '../screens/settings/SettingsScreen.jsx';

const base = retailConfig.routePrefix;

/**
 * Retail module routes.
 * Each sidebar item maps to a screen folder under screens/<feature>/.
 */
export const retailRoutes = [
  <Route key="retail" path={base} element={<RetailLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DashboardScreen />} />
    <Route path="products" element={<ProductsScreen />} />
    <Route path="products/new" element={<ProductFormScreen />} />
    <Route path="products/:productId/edit" element={<ProductFormScreen />} />
    <Route path="categories" element={<CategoriesScreen />} />
    <Route path="brands" element={<BrandsScreen />} />
    <Route path="registers" element={<RegistersScreen />} />
    <Route path="registers/new" element={<RegisterFormScreen />} />
    <Route path="registers/:registerId/edit" element={<RegisterFormScreen />} />
    <Route path="sales" element={<SalesScreen />} />
    <Route path="returns" element={<ReturnsScreen />} />
    <Route path="refunds" element={<RefundsScreen />} />
    <Route path="customers" element={<CustomersScreen />} />
    <Route path="team" element={<TeamScreen />} />
    <Route path="analytics" element={<AnalyticsScreen />} />
    <Route path="settings" element={<SettingsScreen />} />
  </Route>,
];
