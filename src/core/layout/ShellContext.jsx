import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ShellContext = createContext(null);
const STORAGE_KEY = 'innosify.sidebar.collapsed';

export function ShellProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      /* preference stays in memory */
    }
  }, [collapsed]);

  const value = useMemo(() => ({
    collapsed,
    mobileOpen,
    toggleCollapsed: () => setCollapsed((current) => !current),
    openMobile: () => setMobileOpen(true),
    closeMobile: () => setMobileOpen(false),
  }), [collapsed, mobileOpen]);

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const context = useContext(ShellContext);
  if (!context) {
    return {
      collapsed: false,
      mobileOpen: false,
      toggleCollapsed: () => {},
      openMobile: () => {},
      closeMobile: () => {},
    };
  }
  return context;
}
