import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { retailConfig } from '../config/retail.config.js';
import { RetailLayout } from '../layouts/RetailLayout.jsx';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen.jsx';
import { CategoriesScreen } from '../screens/categories/CategoriesScreen.jsx';
import { BrandsScreen } from '../screens/brands/BrandsScreen.jsx';
import { RegisterFormScreen } from '../screens/register-form/RegisterFormScreen.jsx';
import { CustomersScreen, RefundsScreen, ReturnsScreen, SalesScreen } from '../screens/flows/RetailFlows.jsx';
import { TeamScreen } from '../screens/team/TeamScreen.jsx';

const ProductsScreen = lazy(() => import('../screens/products/ProductsScreen.jsx').then((mod) => ({ default: mod.ProductsScreen })));
const ProductFormScreen = lazy(() => import('../screens/product-form/ProductFormScreen.jsx').then((mod) => ({ default: mod.ProductFormScreen })));
const RegistersScreen = lazy(() => import('../screens/registers/RegistersScreen.jsx').then((mod) => ({ default: mod.RegistersScreen })));
const AnalyticsScreen = lazy(() => import('../screens/analytics/AnalyticsScreen.jsx').then((mod) => ({ default: mod.AnalyticsScreen })));
const SettingsScreen = lazy(() => import('../screens/settings/SettingsScreen.jsx').then((mod) => ({ default: mod.SettingsScreen })));

const base = retailConfig.routePrefix;

/**
 * Older route table. The mounted router is src/app/router.jsx.
 * Heavy screens stay dynamic so they are not pulled into the entry chunk.
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
