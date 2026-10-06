import { useEffect } from 'react';
import { cn } from '@utils/cn';
import { Button } from '@shared/ui/Button';

export function Modal({ open, onClose, title, children, footer, size = 'md', className }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-plum/50" onClick={onClose} aria-hidden />
      <div className={cn('relative flex max-h-[90vh] w-full flex-col rounded-lg bg-surface shadow-xl shadow-plum/10', sizes[size], className)}>
        {title && (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 id="modal-title" className="text-lg font-semibold text-content">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-content-muted hover:bg-surface-muted hover:text-content"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ModalFooter({ onCancel, onConfirm, cancelLabel = 'Cancel', confirmLabel = 'Confirm', confirmVariant = 'primary', loading }) {
  return (
    <div className="flex justify-end gap-3">
      {onCancel && (
        <Button variant="outline" onClick={onCancel} disabled={loading}>{cancelLabel}</Button>
      )}
      {onConfirm && (
        <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>{confirmLabel}</Button>
      )}
    </div>
  );
}
