import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { permissionForPath } from '@services/demo/permissions.js';

export function RequireTenant() {
  const { tenantSession, tenantUser } = useAuth();
  const location = useLocation();
  if (!tenantSession || !tenantUser) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  return <Outlet />;
}

export function RequireBusiness() {
  const { tenantSession, memberships, can } = useAuth();
  const location = useLocation();
  if (!tenantSession?.tenantId) {
    return <Navigate to={memberships.length === 0 ? '/app/businesses/new' : '/app/businesses'} replace />;
  }
  const permission = permissionForPath(location.pathname);
  if (permission && !can(permission)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}

export function RequirePlatform() {
  const { platformSession } = useAuth();
  if (!platformSession) return <Navigate to="/platform/login" replace />;
  return <Outlet />;
}

export function RedirectIfTenant() {
  const { tenantSession, tenantUser, role, memberships } = useAuth();
  if (!tenantSession || !tenantUser) return <Outlet />;
  if (memberships.length === 0) return <Navigate to="/app/businesses/new" replace />;
  if (!tenantSession.tenantId) return <Navigate to="/app/businesses" replace />;
  if (role === 'CASHIER') return <Navigate to="/retail/counter" replace />;
  if (role === 'INVENTORY_STAFF') return <Navigate to="/retail/stockroom" replace />;
  if (role === 'BRANCH_MANAGER') return <Navigate to="/retail/dashboard" replace />;
  if (memberships.length > 1) return <Navigate to="/app/businesses" replace />;
  return <Navigate to="/retail/dashboard" replace />;
}
