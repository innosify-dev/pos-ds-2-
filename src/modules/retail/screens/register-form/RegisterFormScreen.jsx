import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { knownCashiers } from '@modules/retail/data/registers.data.js';
import { useRegisters } from '@modules/retail/store/RegistersContext.jsx';
import {
  PaymentToggle,
  RegisterPreview,
  StatusSegmented,
} from '@modules/retail/components/registers';

function nextCode(registers) {
  const nums = registers
    .map((r) => /^REG-(\d+)$/.exec(r.code ?? ''))
    .filter(Boolean)
    .map((m) => Number(m[1]));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `REG-${String(next).padStart(3, '0')}`;
}

/**
 * Add / Edit register form screen — create and configure a POS register
 * with a live preview. Module state via RegistersProvider.
 */
export function RegisterFormScreen() {
  const { registerId } = useParams();
  const navigate = useNavigate();
  const { registers, addRegister, updateRegister } = useRegisters();
  const isEdit = Boolean(registerId);
  const existing = isEdit ? registers.find((r) => r.id === registerId) : null;

  const stores = useMemo(() => [...new Set([...registers.map((r) => r.store), 'Main Store'])], [registers]);

  const [form, setForm] = useState(() =>
    existing
      ? {
          name: existing.name,
          code: existing.code,
          store: existing.store,
          cashier: existing.cashier ?? '',
          isActive: existing.isActive,
          openingCash: existing.openingCash != null ? String(existing.openingCash) : '',
          allowCash: existing.allowCash,
          allowCard: existing.allowCard,
          allowUpi: existing.allowUpi,
        }
      : {
          name: '',
          code: nextCode(registers),
          store: 'Main Store',
          cashier: '',
          isActive: true,
          openingCash: '',
          allowCash: true,
          allowCard: true,
          allowUpi: true,
        }
  );
  const [error, setError] = useState('');

  if (isEdit && !existing) {
    return <Navigate to="/retail/registers" replace />;
  }

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.name.trim()) {
      setError('Register Name is required.');
      return;
    }
    if (!form.code.trim()) {
      setError('Register Code is required.');
      return;
    }
    if (!form.store) {
      setError('Store is required.');
      return;
    }
    if (!form.cashier) {
      setError('Assigned Cashier is required.');
      return;
    }
    const codeTaken = registers.some((r) => r.code === form.code.trim() && r.id !== existing?.id);
    if (codeTaken) {
      setError('This Register Code is already in use.');
      return;
    }
    if (form.openingCash !== '' && (Number.isNaN(Number(form.openingCash)) || Number(form.openingCash) < 0)) {
      setError('Enter a valid Opening Cash amount.');
      return;
    }
    const values = {
      name: form.name.trim(),
      code: form.code.trim(),
      store: form.store,
      cashier: form.cashier,
      isActive: form.isActive,
      openingCash: form.openingCash === '' ? null : Number(form.openingCash),
      allowCash: form.allowCash,
      allowCard: form.allowCard,
      allowUpi: form.allowUpi,
    };
    if (isEdit) updateRegister(existing.id, values);
    else addRegister(values);
    navigate('/retail/registers');
  };

  const actions = (
    <>
      <Button variant="outline" onClick={() => navigate('/retail/registers')}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M8 4v5h7V4M8 20v-6h8v6" />
        </svg>
        Save Register
      </Button>
    </>
  );

  return (
    <div className="space-y-4 bg-surface-elevated/50 p-5 pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-content-muted">
        <Link to="/retail/registers" className="hover:text-accent">Registers</Link>
        <span className="mx-1.5">/</span>
        <span>{isEdit ? 'Edit Register' : 'Add Register'}</span>
      </nav>

      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="text-lg font-bold text-content">{isEdit ? 'Edit Register' : 'Add Register'}</h2>
          <p className="mt-0.5 text-xs text-content-muted">Create and configure a new POS register</p>
        </div>
        <div className="ml-auto flex items-center gap-2.5">{actions}</div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <section className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-accent">Register Details</h3>
            <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 sm:grid-cols-[160px_1fr]">
              <span className="text-sm text-content">Register Name <span className="text-accent">*</span></span>
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Register 04" />
              <span className="text-sm text-content">Register Code <span className="text-accent">*</span></span>
              <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="REG-004" />
              <span className="text-sm text-content">Store <span className="text-accent">*</span></span>
              <Select value={form.store} onChange={(e) => set('store', e.target.value)}>
                {stores.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
              <span className="text-sm text-content">Assigned Cashier <span className="text-accent">*</span></span>
              <Select value={form.cashier} onChange={(e) => set('cashier', e.target.value)}>
                <option value="">Select cashier</option>
                {knownCashiers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <span className="text-sm text-content">Status <span className="text-accent">*</span></span>
              <StatusSegmented value={form.isActive} onChange={(v) => set('isActive', v)} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-accent">Cash Settings</h3>
            <div className="grid grid-cols-1 items-center gap-x-6 gap-y-4 sm:grid-cols-[160px_1fr]">
              <span className="text-sm text-content">Opening Cash</span>
              <div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.openingCash}
                  onChange={(e) => set('openingCash', e.target.value)}
                  placeholder="₹5,000"
                />
                <p className="mt-1 text-xs text-content-muted">Starting cash available in the register</p>
              </div>
            </div>
            <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
              {[
                ['Allow Cash Payments', 'allowCash'],
                ['Allow Card Payments', 'allowCard'],
                ['Allow UPI Payments', 'allowUpi'],
              ].map(([label, key]) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-content">{label}</span>
                  <PaymentToggle checked={form[key]} onChange={(v) => set(key, v)} label={label} />
                </div>
              ))}
            </div>
          </section>

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <RegisterPreview
          name={form.name}
          store={form.store}
          code={form.code}
          cashier={form.cashier}
          openingCash={form.openingCash}
          isActive={form.isActive}
        />
      </div>

      <div className="fixed bottom-0 left-52 right-0 z-10 flex items-center justify-end gap-2.5 border-t border-border bg-surface px-5 py-3">
        {actions}
      </div>
    </div>
  );
}
