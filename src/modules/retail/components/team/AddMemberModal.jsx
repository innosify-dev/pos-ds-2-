import { useEffect, useState } from 'react';
import { Modal, ModalFooter } from '@shared/dialogs/Modal';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';

export const STAFF_ROLES = [
  { value: 'CASHIER', label: 'Cashier', description: 'Billing, sales, and customers on the branches you assign. No inventory or settings.' },
  { value: 'INVENTORY_STAFF', label: 'Inventory Staff', description: 'Products, stock, and purchases on the assigned branches. Billing stays closed.' },
  { value: 'BRANCH_MANAGER', label: 'Branch Head', description: 'Branch operations, registers, and reports for the assigned branches.' },
  { value: 'BUSINESS_ADMIN', label: 'Business admin', description: 'Business management for this shop, including settings and team. The app shows this as Owner/Admin.' },
  { value: 'OWNER', label: 'Owner', description: 'Full access for this business on the same login model. The app shows this as Owner/Admin. This does not create a second account type.' },
];

const empty = { name: '', email: '', phone: '', role: 'CASHIER', branchIds: [] };

/**
 * Add or edit a staff membership. The form never asks for or shows a password.
 */
export function AddMemberModal({ open, onClose, onSubmit, mode = 'add', initial, branches = [], busy = false }) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const editing = mode === 'edit';
  const role = STAFF_ROLES.find((item) => item.value === form.role);

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(initial
      ? { ...empty, ...initial, branchIds: [...(initial.branchIds || [])] }
      : { ...empty, branchIds: branches[0] ? [branches[0].id] : [] });
    // Reset only when the dialog opens. `initial` is a fresh object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleBranch = (id) => {
    setForm((prev) => ({
      ...prev,
      branchIds: prev.branchIds.includes(id) ? prev.branchIds.filter((item) => item !== id) : [...prev.branchIds, id],
    }));
  };

  const handleConfirm = () => {
    if (busy) return;
    if (!editing && form.name.trim().length < 2) {
      setError('Full name is required.');
      return;
    }
    if (!editing && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!editing && form.phone.trim() && !/^[0-9+\-\s()]{8,16}$/.test(form.phone.trim())) {
      setError('Enter a valid phone number, or leave it blank.');
      return;
    }
    if (!form.branchIds.length) {
      setError('Choose at least one branch this person can use.');
      return;
    }
    const result = onSubmit?.({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role,
      branchIds: form.branchIds,
    });
    if (result && result.ok === false) {
      setError(result.error || 'Could not save this person.');
      return;
    }
    if (result !== false) onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit staff access' : 'Add employee'}
      size="lg"
      footer={<ModalFooter onCancel={onClose} onConfirm={handleConfirm} confirmLabel={busy ? 'Saving…' : editing ? 'Save access' : 'Add employee'} loading={busy} />}
    >
      <div className="flex flex-col gap-4">
        <p className="text-xs text-content-muted">Saved in this browser’s demo data. No email is sent, and this form does not ask for a password. Platform Super Admin cannot be assigned here.</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Personal information</p>
        <Input label="Full name *" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} disabled={editing} required={!editing} />
        <Input label="Email *" type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} disabled={editing} required={!editing} />
        {!editing && <Input label="Phone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />}
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">Access</p>
        <Select label="Role *" value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}>
          {STAFF_ROLES.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </Select>
        {role && <p className="text-xs text-content-muted">{role.description}</p>}
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-content">Branches *</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {branches.map((branch) => (
              <label key={branch.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <input type="checkbox" checked={form.branchIds.includes(branch.id)} onChange={() => toggleBranch(branch.id)} />
                {branch.name}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p className="text-xs text-danger" role="alert">{error}</p>}
      </div>
    </Modal>
  );
}
