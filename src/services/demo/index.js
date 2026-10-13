import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import { dispatchDemo, getDemoMeta, getDemoState, initDemoStore, resetDemoStore, subscribeDemo } from './store.js';

const DemoContext = createContext(null);

export function DemoProvider({ children }) {
  const [state, setState] = useState(getDemoState());
  const [meta, setMeta] = useState(getDemoMeta());

  useEffect(() => {
    let cancelled = false;
    initDemoStore().then((next) => {
      if (cancelled) return;
      setState(next);
      setMeta(getDemoMeta());
    });
    return subscribeDemo((next) => {
      setState(next);
      setMeta(getDemoMeta());
    });
  }, []);

  const value = useMemo(() => ({
    state,
    ready: meta.ready,
    driver: meta.driver,
    warning: meta.warning,
    dispatch: dispatchDemo,
    reset: resetDemoStore,
  }), [state, meta]);

  if (!meta.ready || !state) {
    return createElement(
      'div',
      { className: 'flex min-h-screen items-center justify-center bg-canvas text-sm text-content-muted' },
      'Loading demo workspace…',
    );
  }

  return createElement(DemoContext.Provider, { value }, children);
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within DemoProvider');
  return context;
}

export const demoMode = import.meta.env.VITE_DEMO_MODE !== 'false';
