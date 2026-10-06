import { useEffect, useState } from 'react';
import { Modal, ModalFooter } from '@shared/dialogs/Modal';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';

const shifts = [
  { value: 'billing', label: 'At Billing' },
  { value: 'floor', label: 'Sales Floor' },
  { value: 'stockroom', label: 'Stockroom' },
  { value: 'off', label: 'Off Shift' },
];

const shiftToStatus = {
  billing: 'At Billing',
  floor: 'On Floor',
  stockroom: 'In Stockroom',
  off: 'Off Shift',
};

/**
 * Add team member modal — creates a new member card on submit.
 */
export function AddMemberModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', role: 'Cashier', shift: 'billing' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ name: '', role: 'Cashier', shift: 'billing' });
      setError('');
    }
  }, [open]);

  const handleConfirm = () => {
    const name = form.name.trim();
    if (!name) {
      setError('Member name is required');
      return;
    }

    const initials = name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');

    onSubmit?.({
      id: `new-${name}-${Date.now()}`,
      name,
      role: form.role,
      shift: form.shift,
      status: shiftToStatus[form.shift],
      initials,
      tone: form.shift === 'off' ? 'muted' : form.shift === 'floor' ? 'warning' : 'success',
      orders: 0,
      sales: 0,
      shiftProgress: 0,
      rating: 0,
    });
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Team Member"
      footer={<ModalFooter onCancel={onClose} onConfirm={handleConfirm} cancelLabel="Cancel" confirmLabel="Add Member" />}
    >
      <div className="flex flex-col gap-3">
        <Input label="Full name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="e.g. Priya Sharma" error={error} />

        <label className="flex flex-col gap-1.5 text-sm font-medium text-content">
          Role
          <Input value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))} placeholder="e.g. Cashier" />
        </label>

        <Select
          label="Shift"
          value={form.shift}
          onChange={(e) => setForm((prev) => ({ ...prev, shift: e.target.value }))}
        >
          {shifts.map((shift) => (
            <option key={shift.value} value={shift.value}>
              {shift.label}
            </option>
          ))}
        </Select>
      </div>
    </Modal>
  );
}