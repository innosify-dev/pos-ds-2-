import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { initialRegisters, nowTimeLabel } from '../data/registers.data.js';

const RegistersContext = createContext(null);

/**
 * Module-scoped registers state — shared by the registers list and the
 * add/edit register form screens. Replaced by services/api/ when the backend lands.
 */
export function RegistersProvider({ children }) {
  const [registers, setRegisters] = useState(initialRegisters);

  const addRegister = useCallback((values) => {
    const register = {
      id: `r${Date.now()}`,
      status: 'Closed',
      currentCash: null,
      todaysSales: null,
      openedAt: null,
      ...values,
    };
    setRegisters((list) => [...list, register]);
    return register;
  }, []);

  const updateRegister = useCallback((id, values) => {
    setRegisters((list) => list.map((r) => (r.id === id ? { ...r, ...values } : r)));
  }, []);

  const deleteRegister = useCallback((id) => {
    setRegisters((list) => list.filter((r) => r.id !== id));
  }, []);

  const openSession = useCallback((id, { openingCash, cashier }) => {
    setRegisters((list) =>
      list.map((r) =>
        r.id === id
          ? {
              ...r,
              status: 'Open',
              openingCash,
              currentCash: openingCash,
              todaysSales: 0,
              openedAt: nowTimeLabel(),
              cashier,
            }
          : r
      )
    );
  }, []);

  const closeSession = useCallback((id, { closingCash }) => {
    setRegisters((list) =>
      list.map((r) => (r.id === id ? { ...r, status: 'Closed', currentCash: closingCash } : r))
    );
  }, []);

  const value = useMemo(
    () => ({ registers, addRegister, updateRegister, deleteRegister, openSession, closeSession }),
    [registers, addRegister, updateRegister, deleteRegister, openSession, closeSession]
  );

  return <RegistersContext.Provider value={value}>{children}</RegistersContext.Provider>;
}

export function useRegisters() {
  const ctx = useContext(RegistersContext);
  if (!ctx) throw new Error('useRegisters must be used within RegistersProvider');
  return ctx;
}
