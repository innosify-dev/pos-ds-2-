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
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setClosingCash(register?.currentCash != null ? String(register.currentCash) : '');
    }
  }, [open, register]);

  if (!open || !register) return null;

  const expected = register.currentCash ?? 0;
  const counted = closingCash === '' ? null : Number(closingCash);
  const diff = counted === null || Number.isNaN(counted) ? null : counted - expected;

  const handleConfirm = () => {
    if (counted === null || Number.isNaN(counted) || counted < 0) {
      setError('Enter a valid closing cash count.');
      return;
    }
    onConfirm({ closingCash: counted });
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
            <dt className="text-xs text-content-muted">Opening Cash</dt>
            <dd className="font-medium text-content">{formatCash(register.openingCash)}</dd>
          </div>
          <div>
            <dt className="text-xs text-content-muted">Expected in Drawer</dt>
            <dd className="font-medium text-content">{formatCash(expected)}</dd>
          </div>
        </dl>
        <Input
          label="Closing Cash Count (₹)"
          type="number"
          min="0"
          step="0.01"
          value={closingCash}
          onChange={(e) => setClosingCash(e.target.value)}
        />
        {diff !== null && (
          <p className={`text-xs font-medium ${diff === 0 ? 'text-success' : diff > 0 ? 'text-warning' : 'text-danger'}`}>
            {diff === 0 ? 'Count matches expected.' : `Difference: ${diff > 0 ? '+' : ''}₹${diff.toLocaleString('en-IN')}`}
          </p>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}
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
    ['Store', register.store],
    ['Assigned Cashier', register.cashier ?? 'Unassigned'],
    ['Opening Cash', formatCash(register.openingCash)],
    ['Current Cash', formatCash(register.currentCash)],
    ["Today's Sales", formatCash(register.todaysSales)],
    ['Opened At', register.openedAt ?? '—'],
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
