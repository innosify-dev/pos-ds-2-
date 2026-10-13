import { useEffect, useState } from 'react';
import { Modal, ModalFooter } from '@shared/dialogs/Modal';
import { Input } from '@shared/ui/Input';
import { Badge } from '@shared/display/Badge';
import { formatCash } from '@modules/retail/data/registers.data.js';

/**
 * Open-session dialog — start a cash session with opening cash + cashier.
 */
export function OpenSessionModal({ open, register, onClose, onConfirm }) {
  const [openingCash, setOpeningCash] = useState('');
  const [cashier, setCashier] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setOpeningCash('');
      setCashier(register?.cashier ?? '');
    }
  }, [open, register]);

  if (!open || !register) return null;

  const handleConfirm = () => {
    if (openingCash === '' || Number.isNaN(Number(openingCash)) || Number(openingCash) < 0) {
      setError('Enter a valid opening cash amount.');
      return;
    }
    onConfirm({ openingCash: Number(openingCash), cashier: cashier.trim() || null });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Open ${register.name}`}
      size="sm"
      footer={<ModalFooter onCancel={onClose} onConfirm={handleConfirm} confirmLabel="Open Register" />}
    >
      <div className="space-y-4">
        <p className="text-xs text-content-muted">{register.store} · {register.status}. UPI and card takings stay out of the drawer.</p>
        {register.closedAt && (
          <p className="text-xs text-content-muted">Previous close {new Date(register.closedAt).toLocaleString('en-IN')}{register.differencePaise ? ` · variance ${formatCash(register.differencePaise / 100)}` : ''}.</p>
        )}
        <Input
          label="Opening Cash (₹)"
          type="number"
          min="0"
          step="0.01"
          value={openingCash}
          onChange={(e) => setOpeningCash(e.target.value)}
          placeholder="e.g. 10000"
        />
        <Input
          label="Assigned Cashier"
          value={cashier}
          onChange={(e) => setCashier(e.target.value)}
          placeholder="e.g. Priya"
        />
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}

/**
 * Close-session dialog — count the drawer and see the difference.
 */
export function CloseSessionModal({ open, register, onClose, onConfirm }) {
  const [closingCash, setClosingCash] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setReason('');
      setClosingCash(register?.expectedCash != null ? String(register.expectedCash) : '');
    }
  }, [open, register]);

  if (!open || !register) return null;

  const expected = register.expectedCash ?? register.currentCash ?? 0;
  const counted = closingCash === '' ? null : Number(closingCash);
  const diff = counted === null || Number.isNaN(counted) ? null : Math.round((counted - expected) * 100) / 100;
  const drawer = register.drawer;

  const handleConfirm = () => {
    if (counted === null || Number.isNaN(counted) || counted < 0) {
      setError('Enter a valid closing cash count.');
      return;
    }
    if (diff !== 0 && !reason.trim()) {
      setError('Enter a reason when the count does not match the expected cash.');
      return;
    }
    onConfirm({ closingCash: counted, reason: reason.trim() });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Close ${register.name}`}
      size="sm"
      footer={<ModalFooter onCancel={onClose} onConfirm={handleConfirm} confirmLabel="Close Register" />}
    >
      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-surface-elevated p-3 text-sm">
          <div>
            <dt className="text-xs text-content-muted">Opening cash</dt>
            <dd className="font-medium text-content">{formatCash(register.openingCash)}</dd>
          </div>
          <div>
            <dt className="text-xs text-content-muted">Cash sales</dt>
            <dd className="font-medium text-content">{formatCash((drawer?.cashSalesPaise || 0) / 100)}</dd>
          </div>
          <div>
            <dt className="text-xs text-content-muted">Cash in / out</dt>
            <dd className="font-medium text-content">{formatCash((drawer?.cashInPaise || 0) / 100)} / {formatCash((drawer?.cashOutPaise || 0) / 100)}</dd>
          </div>
          <div>
            <dt className="text-xs text-content-muted">Cash refunds</dt>
            <dd className="font-medium text-content">{formatCash((drawer?.cashRefundsPaise || 0) / 100)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-content-muted">Expected cash</dt>
            <dd className="text-lg font-semibold tabular-nums text-content">{formatCash(expected)}</dd>
          </div>
        </dl>
        <Input
          label="Counted cash (₹)"
          type="number"
          min="0"
          step="0.01"
          value={closingCash}
          onChange={(e) => setClosingCash(e.target.value)}
        />
        {diff !== null && (
          <p className={`text-xs font-medium ${diff === 0 ? 'text-success' : diff > 0 ? 'text-warning' : 'text-danger'}`} role="status">
            {diff === 0 ? 'Balanced. The count matches expected cash.' : diff > 0 ? `Overage ${formatCash(diff)}` : `Shortage ${formatCash(Math.abs(diff))}`}
          </p>
        )}
        <Input label="Variance reason" value={reason} onChange={(e) => setReason(e.target.value)} hint="Required when the count does not match." />
        {error && <p className="text-xs text-danger" role="alert">{error}</p>}
      </div>
    </Modal>
  );
}

/**
 * Read-only register + session details.
 */
export function RegisterDetailsModal({ open, register, onClose }) {
  if (!open || !register) return null;

  const rows = [
    ['Register', register.name],
    ['Code', register.code || '—'],
    ['Branch', register.store],
    ['Assigned cashier', register.cashier || 'Unassigned'],
    ['Opening cash', formatCash(register.openingCash)],
    ['Cash in drawer', formatCash(register.currentCash)],
    ["Today's sales", formatCash(register.todaysSales)],
    ['Opened at', register.openedAt ?? '—'],
    ['Last sale', register.lastActivity ? `${register.lastInvoice} · ${register.lastActivity}` : 'No sale on this register'],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Register Details"
      size="sm"
      footer={<ModalFooter onCancel={onClose} cancelLabel="Close" />}
    >
      <div className="mb-3">
        <Badge variant={register.status === 'Open' ? 'success' : 'default'}>{register.status}</Badge>
      </div>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-content-muted">{k}</dt>
            <dd className="mt-0.5 font-medium text-content">{v}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
