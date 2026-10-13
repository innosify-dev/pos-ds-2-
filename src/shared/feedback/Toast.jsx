import { createContext, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(() => ({
    push(message, tone = 'success') {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((list) => [...list, { id, message, tone }]);
      setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 3200);
    },
  }), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-80 flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-[0_12px_30px_rgb(28_27_46/0.12)] ${
              toast.tone === 'danger'
                ? 'border-danger/30 bg-danger-muted text-danger'
                : 'border-border bg-surface text-content'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
