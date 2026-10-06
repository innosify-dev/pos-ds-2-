import { useEffect, useState } from 'react';
import { Modal, ModalFooter } from '@shared/dialogs/Modal';
import { Select } from '@shared/ui/Select';
import { Input } from '@shared/ui/Input';

const categories = ['Kanjivaram', 'Banarasi', 'Pattu', 'Georgette', 'Chanderi'];

/**
 * Quick add product modal — mirrors the reference dashboard's
 * "+ Add New" flow (name, category, start date).
 */
export function QuickAddModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', category: categories[0], startDate: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm({ name: '', category: categories[0], startDate: '' });
      setError('');
    }
  }, [open]);

  const update = (field) => (value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleConfirm = () => {
    if (!form.name.trim()) {
      setError('Product name is required');
      return;
    }
    onSubmit?.({ ...form, name: form.name.trim() });
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Product"
      footer={<ModalFooter onCancel={onClose} onConfirm={handleConfirm} cancelLabel="Cancel" confirmLabel="Confirm" />}
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5 text-xs font-medium text-content">
          Product name
          <Input value={form.name} onChange={(e) => update('name')(e.target.value)} placeholder="e.g. Kanjivaram Silk Saree" />
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-content">
          Category
          <Select value={form.category} onChange={(e) => update('category')(e.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium text-content">
          Stock received on
          <Input type="date" value={form.startDate} onChange={(e) => update('startDate')(e.target.value)} />
        </label>

        {error && <p className="text-[11px] text-danger">{error}</p>}
      </div>
    </Modal>
  );
}