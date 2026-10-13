import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@core/layout';
import { RequireBusiness, RequirePlatform, RequireTenant } from './guards.jsx';
import { PublicLayout } from '@modules/public/layouts/PublicLayout.jsx';
import { LandingScreen } from '@modules/public/screens/LandingScreen.jsx';
import { FeaturesScreen } from '@modules/public/screens/FeaturesScreen.jsx';
import { PricingScreen } from '@modules/public/screens/PricingScreen.jsx';
import { AcceptInvitationScreen, ForgotPasswordScreen, LoginScreen, ResetPasswordScreen, SignupScreen } from '@modules/public/screens/AuthScreens.jsx';
import { NotFoundScreen, UnauthorizedScreen } from '@modules/public/screens/StatusScreens.jsx';
import { BusinessesScreen, WorkspaceSubscriptionsScreen } from '@modules/workspace/screens/WorkspaceScreens.jsx';
import { ProfileScreen } from '@modules/workspace/screens/ProfileScreen.jsx';
import { AccountSettingsScreen } from '@modules/workspace/screens/AccountSettingsScreen.jsx';
import { OnboardingScreen } from '@modules/workspace/screens/OnboardingScreen.jsx';
import { RetailLayout } from '@modules/retail/layouts/RetailLayout.jsx';
import { DashboardScreen } from '@modules/retail/screens/dashboard/DashboardScreen.jsx';
import { CashierDesk } from '@modules/retail/screens/dashboard/CashierDesk.jsx';
import { InventoryDesk } from '@modules/retail/screens/dashboard/InventoryDesk.jsx';
import { ProductsScreen } from '@modules/retail/screens/products/ProductsScreen.jsx';
import { ProductFormScreen } from '@modules/retail/screens/product-form/ProductFormScreen.jsx';
import { CategoriesScreen } from '@modules/retail/screens/categories/CategoriesScreen.jsx';
import { BrandsScreen } from '@modules/retail/screens/brands/BrandsScreen.jsx';
import { RegistersScreen } from '@modules/retail/screens/registers/RegistersScreen.jsx';
import { RegisterFormScreen } from '@modules/retail/screens/register-form/RegisterFormScreen.jsx';
import { TeamScreen } from '@modules/retail/screens/team/TeamScreen.jsx';
import { AnalyticsScreen } from '@modules/retail/screens/analytics/AnalyticsScreen.jsx';
import { SettingsScreen } from '@modules/retail/screens/settings/SettingsScreen.jsx';
import { PosScreen } from '@modules/retail/screens/pos/PosScreen.jsx';
import {
  BranchesScreen,
  CustomersScreen,
  InventoryScreen,
  PurchasesScreen,
  RefundsScreen,
  ReturnsScreen,
  SalesScreen,
  SubscriptionScreen,
  SuppliersScreen,
} from '@modules/retail/screens/flows/RetailFlows.jsx';
import {
  AuditLogsScreen,
  PlatformCustomersScreen,
  PlatformDashboardScreen,
  PlatformLayout,
  PlatformLoginScreen,
  PlatformPaymentsScreen,
  PlatformSettingsScreen,
  PlatformSubscriptionsScreen,
  PlansScreen,
  SupportScreen,
  TenantDetailScreen,
  TenantsScreen,
} from '@modules/platform/screens/PlatformScreens.jsx';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/features" element={<FeaturesScreen />} />
          <Route path="/pricing" element={<PricingScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
          <Route path="/reset-password" element={<ResetPasswordScreen />} />
          <Route path="/accept-invitation" element={<AcceptInvitationScreen />} />
        </Route>

        <Route element={<RequireTenant />}>
          <Route path="/app/businesses" element={<BusinessesScreen />} />
          <Route path="/app/businesses/new" element={<OnboardingScreen />} />
          <Route path="/app/profile" element={<ProfileScreen />} />
          <Route path="/app/account" element={<Navigate to="/app/profile" replace />} />
          <Route path="/app/settings/account" element={<AccountSettingsScreen />} />
          <Route path="/app/subscriptions" element={<WorkspaceSubscriptionsScreen />} />
          <Route element={<RequireBusiness />}>
            <Route element={<AppLayout />}>
              <Route path="/retail" element={<RetailLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardScreen />} />
                <Route path="counter" element={<CashierDesk />} />
                <Route path="stockroom" element={<InventoryDesk />} />
                <Route path="pos" element={<PosScreen />} />
                <Route path="products" element={<ProductsScreen />} />
                <Route path="products/new" element={<ProductFormScreen />} />
                <Route path="products/:productId/edit" element={<ProductFormScreen />} />
                <Route path="categories" element={<CategoriesScreen />} />
                <Route path="brands" element={<BrandsScreen />} />
                <Route path="inventory" element={<InventoryScreen />} />
                <Route path="purchases" element={<PurchasesScreen />} />
                <Route path="suppliers" element={<SuppliersScreen />} />
                <Route path="registers" element={<RegistersScreen />} />
                <Route path="registers/new" element={<RegisterFormScreen />} />
                <Route path="registers/:registerId/edit" element={<RegisterFormScreen />} />
                <Route path="branches" element={<BranchesScreen />} />
                <Route path="sales" element={<SalesScreen />} />
                <Route path="returns" element={<ReturnsScreen />} />
                <Route path="refunds" element={<RefundsScreen />} />
                <Route path="customers" element={<CustomersScreen />} />
                <Route path="team" element={<TeamScreen />} />
                <Route path="analytics" element={<AnalyticsScreen />} />
                <Route path="subscription" element={<SubscriptionScreen />} />
                <Route path="settings" element={<SettingsScreen />} />
              </Route>
            </Route>
          </Route>
        </Route>

        <Route path="/platform/login" element={<PlatformLoginScreen />} />
        <Route element={<RequirePlatform />}>
          <Route path="/platform" element={<PlatformLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PlatformDashboardScreen />} />
            <Route path="tenants" element={<TenantsScreen />} />
            <Route path="tenants/:tenantId" element={<TenantDetailScreen />} />
            <Route path="plans" element={<PlansScreen />} />
            <Route path="subscriptions" element={<PlatformSubscriptionsScreen />} />
            <Route path="customers" element={<PlatformCustomersScreen />} />
            <Route path="payments" element={<PlatformPaymentsScreen />} />
            <Route path="audit-logs" element={<AuditLogsScreen />} />
            <Route path="support" element={<SupportScreen />} />
            <Route path="settings" element={<PlatformSettingsScreen />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
