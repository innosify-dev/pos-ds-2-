import { createContext, useCallback, useContext, useMemo } from 'react';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { rupeesToPaise } from '@services/demo/money.js';

const RegistersContext = createContext(null);

function viewOf(register, state) {
  const branch = state.branches.find((item) => item.id === register.branchId);
  const cashier = state.users.find((item) => item.id === register.cashierId);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const todaysSales = state.sales
    .filter((sale) => sale.registerId === register.id && new Date(sale.createdAt) >= start)
    .reduce((sum, sale) => sum + sale.totalPaise, 0) / 100;
  const lastSale = state.sales
    .filter((sale) => sale.registerId === register.id)
    .reduce((latest, sale) => (!latest || sale.createdAt > latest.createdAt ? sale : latest), null);
  return {
    ...register,
    store: branch?.name ?? 'Branch',
    cashier: cashier ? `${cashier.firstName} ${cashier.lastName}`.trim() : (register.cashierName || ''),
    openingCash: (register.openingCashPaise || 0) / 100,
    currentCash: register.status === 'Open' ? (register.currentCashPaise || 0) / 100 : (register.currentCashPaise || 0) / 100,
    todaysSales,
    openedAt: register.openedAt ? new Date(register.openedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
    lastActivity: lastSale
      ? new Date(lastSale.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : null,
    lastInvoice: lastSale?.invoiceNo || null,
  };
}

export function RegistersProvider({ children }) {
  const { state, dispatch } = useDemo();
  const { tenant, branches } = useTenant();
  const registers = useMemo(
    () => state.registers
      .filter((item) => item.tenantId === tenant?.id && branches.some((branch) => branch.id === item.branchId))
      .map((item) => viewOf(item, state)),
    [state, tenant?.id, branches],
  );

  const addRegister = useCallback((values) => {
    const branch = state.branches.find((item) => item.tenantId === tenant.id && item.name === values.store) || state.branches.find((item) => item.tenantId === tenant.id);
    const cashier = state.users.find((item) => `${item.firstName} ${item.lastName}`.trim() === values.cashier) || state.users.find((item) => item.firstName === values.cashier);
    return dispatch({
      type: 'register.save',
      tenantId: tenant.id,
      register: {
        name: values.name,
        code: values.code,
        branchId: branch?.id,
        cashierId: cashier?.id || null,
        cashierName: values.cashier,
        isActive: values.isActive,
        allowCash: values.allowCash,
        allowCard: values.allowCard,
        allowUpi: values.allowUpi,
        openingCashPaise: rupeesToPaise(values.openingCash || 0),
      },
    });
  }, [dispatch, state.branches, state.users, tenant?.id]);

  const updateRegister = useCallback((id, values) => {
    const current = state.registers.find((item) => item.id === id);
    const branch = state.branches.find((item) => item.tenantId === tenant.id && item.name === values.store);
    const cashier = state.users.find((item) => `${item.firstName} ${item.lastName}`.trim() === values.cashier) || state.users.find((item) => item.firstName === values.cashier);
    return dispatch({
      type: 'register.save',
      tenantId: tenant.id,
      register: {
        ...current,
        name: values.name,
        code: values.code,
        isActive: values.isActive,
        allowCash: values.allowCash,
        allowCard: values.allowCard,
        allowUpi: values.allowUpi,
        branchId: branch?.id || current?.branchId,
        cashierId: cashier?.id || current?.cashierId || null,
        cashierName: values.cashier,
        openingCashPaise: rupeesToPaise(values.openingCash || 0),
      },
    });
  }, [dispatch, state.branches, state.registers, state.users, tenant?.id]);

  const deleteRegister = useCallback((id) => dispatch({ type: 'register.delete', id }), [dispatch]);
  const openSession = useCallback((id, { openingCash, cashier }) => {
    const person = state.users.find((item) => `${item.firstName} ${item.lastName}`.trim() === cashier) || state.users.find((item) => item.firstName === cashier);
    return dispatch({ type: 'register.open', id, openingCashPaise: rupeesToPaise(openingCash || 0), cashierId: person?.id || null });
  }, [dispatch, state.users]);
  const closeSession = useCallback((id, { closingCash }) => {
    const register = state.registers.find((item) => item.id === id);
    return dispatch({
      type: 'register.close',
      id,
      closingCashPaise: rupeesToPaise(closingCash || 0),
      expectedCashPaise: register?.currentCashPaise || 0,
    });
  }, [dispatch, state.registers]);

  const value = useMemo(
    () => ({ registers, addRegister, updateRegister, deleteRegister, openSession, closeSession }),
    [registers, addRegister, updateRegister, deleteRegister, openSession, closeSession],
  );
  return <RegistersContext.Provider value={value}>{children}</RegistersContext.Provider>;
}

export function useRegisters() {
  const ctx = useContext(RegistersContext);
  if (!ctx) throw new Error('useRegisters must be used within RegistersProvider');
  return ctx;
}
