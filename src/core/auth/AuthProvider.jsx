import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useDemo } from '@services/demo';
import { authenticateDemo } from '@services/demo/store.js';
import { hasPermission } from '@services/demo/permissions.js';
import { businessesForUser } from '@services/demo/metrics.js';
import { clearSession, expireSession, lastTenant, readSession, rememberTenant, writeSession } from './session.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { state } = useDemo();
  const [tenantSession, setTenantSession] = useState(() => readSession('tenant'));
  const [platformSession, setPlatformSession] = useState(() => readSession('platform'));
  const [expired, setExpired] = useState(false);

  const refresh = () => {
    setTenantSession(readSession('tenant'));
    setPlatformSession(readSession('platform'));
  };

  useEffect(() => {
    if (!state?.users || !tenantSession?.userId) return;
    const user = state.users.find((item) => item.id === tenantSession.userId);
    if (!user) {
      clearSession('tenant');
      setTenantSession(null);
      return;
    }
    if (!tenantSession.tenantId) return;
    const stillMember = state.memberships.some((item) => item.userId === user.id && item.tenantId === tenantSession.tenantId && item.status === 'ACTIVE');
    if (!stillMember) {
      writeSession('tenant', { userId: user.id, tenantId: null, role: null, branchIds: [] });
      setTenantSession(readSession('tenant'));
    }
  }, [state, tenantSession]);

  const value = useMemo(() => {
    const tenantUser = state.users.find((item) => item.id === tenantSession?.userId) ?? null;
    const platformUser = state.users.find((item) => item.id === platformSession?.userId) ?? null;
    const memberships = tenantUser
      ? state.memberships.filter((item) => item.userId === tenantUser.id && item.status === 'ACTIVE')
      : [];
    const membership = memberships.find((item) => item.tenantId === tenantSession?.tenantId) ?? null;

    const login = ({ email, password, scope = 'tenant', tenantId }) => {
      const result = authenticateDemo({ email, password, scope });
      if (!result.ok) return result;
      if (scope === 'platform') {
        writeSession('platform', { userId: result.user.id, role: 'SUPER_ADMIN' });
        refresh();
        return { ok: true, to: '/platform/dashboard' };
      }
      if (result.memberships.length === 0) {
        writeSession('tenant', { userId: result.user.id, tenantId: null, role: null, branchIds: [] });
        refresh();
        return { ok: true, to: '/app/businesses/new', role: null };
      }
      if (!tenantId && result.memberships.length > 1) {
        writeSession('tenant', { userId: result.user.id, tenantId: null, role: null, branchIds: [] });
        refresh();
        return { ok: true, to: '/app/businesses', role: null, needsSelection: true };
      }
      const chosen = result.memberships.find((item) => item.tenantId === tenantId) ?? result.memberships[0];
      const tenant = state.tenants.find((item) => item.id === chosen.tenantId);
      if (tenant?.status === 'SUSPENDED') return { ok: false, error: 'This business is suspended in the demo.' };
      writeSession('tenant', {
        userId: result.user.id,
        tenantId: chosen.tenantId,
        role: chosen.role,
        branchIds: chosen.branchIds,
      });
      rememberTenant(result.user.id, chosen.tenantId);
      refresh();
      return { ok: true, to: destination(chosen, result.memberships.length), role: chosen.role };
    };

    const selectBusiness = (tenantId) => {
      if (!tenantUser) return { ok: false, error: 'Sign in first.' };
      const chosen = memberships.find((item) => item.tenantId === tenantId);
      if (!chosen) return { ok: false, error: 'You do not belong to that business.' };
      const tenant = state.tenants.find((item) => item.id === tenantId);
      if (tenant?.status === 'SUSPENDED') return { ok: false, error: 'This business is suspended.' };
      writeSession('tenant', {
        userId: tenantUser.id,
        tenantId,
        role: chosen.role,
        branchIds: chosen.branchIds,
      });
      rememberTenant(tenantUser.id, tenantId);
      refresh();
      return { ok: true, to: destination(chosen, memberships.length), role: chosen.role };
    };

    const logout = (scope = 'tenant') => {
      clearSession(scope);
      refresh();
    };

    const simulateExpiry = (scope = 'tenant') => {
      expireSession(scope);
      setExpired(true);
      refresh();
    };

    return {
      tenantSession,
      platformSession,
      tenantUser,
      platformUser,
      membership,
      memberships,
      businesses: tenantUser ? businessesForUser(state, tenantUser.id) : [],
      role: membership?.role ?? null,
      lastTenantId: tenantUser ? lastTenant(tenantUser.id) : null,
      expired,
      clearExpired: () => setExpired(false),
      can: (permission) => hasPermission(membership?.role, permission),
      login,
      selectBusiness,
      logout,
      simulateExpiry,
      refresh,
    };
  }, [state, tenantSession, platformSession, expired]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function destination(membership, count) {
  const role = membership?.role;
  const assigned = membership?.branchIds?.length > 0;
  if ((role === 'CASHIER' || role === 'INVENTORY_STAFF' || role === 'BRANCH_MANAGER') && !assigned) return '/unauthorized';
  if (role === 'CASHIER') return '/retail/counter';
  if (role === 'INVENTORY_STAFF') return '/retail/stockroom';
  if (role === 'BRANCH_MANAGER') return '/retail/dashboard';
  if (!count) return '/app/businesses/new';
  if (count > 1) return '/app/businesses';
  return '/retail/dashboard';
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
