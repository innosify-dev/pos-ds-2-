import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useDemo } from '@services/demo';
import { subscriptionFor } from '@services/demo/engine.js';

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const { state } = useDemo();
  const auth = useAuth();
  const tenant = state.tenants.find((item) => item.id === auth.tenantSession?.tenantId) ?? null;
  const branches = state.branches.filter((item) => item.tenantId === tenant?.id);
  const [branchId, setBranchId] = useState(null);

  useEffect(() => {
    if (!tenant) {
      setBranchId(null);
      return;
    }
    const allowed = auth.membership?.branchIds?.length
      ? branches.filter((branch) => auth.membership.branchIds.includes(branch.id))
      : branches;
    const next = allowed.find((branch) => branch.id === branchId) || allowed.find((branch) => branch.isDefault) || allowed[0];
    setBranchId(next?.id ?? null);
  }, [tenant?.id, auth.membership?.id]);

  const value = useMemo(() => {
    const subscription = tenant ? subscriptionFor(state, tenant.id) : null;
    const plan = state.plans.find((item) => item.code === subscription?.planCode) ?? null;
    const visibleBranches = auth.membership?.branchIds?.length
      ? branches.filter((branch) => auth.membership.branchIds.includes(branch.id))
      : branches;
    return {
      tenant,
      branches: visibleBranches,
      branch: visibleBranches.find((item) => item.id === branchId) ?? visibleBranches[0] ?? null,
      setBranchId,
      subscription,
      plan,
    };
  }, [state, tenant, branches, branchId, auth.membership]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) throw new Error('useTenant must be used within TenantProvider');
  return context;
}
