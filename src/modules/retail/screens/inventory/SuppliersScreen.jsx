import { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useToast } from '@shared/feedback/Toast.jsx';

const EMPTY = { id: '', name: '', phone: '', city: '' };

export function SuppliersScreen() {
  const { state, dispatch } = useDemo();
  const { tenant } = useTenant();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const rows = state.suppliers.filter((supplier) => supplier.tenantId === tenant?.id);
  const visible = rows.filter((supplier) => `${supplier.name} ${supplier.phone || ''} ${supplier.city || ''}`.toLowerCase().includes(query.trim().toLowerCase()));

  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    if (!form.name.trim()) {
      setError('Supplier name is required.');
      return;
    }
    setBusy(true);
    setError('');
    const record = {
      tenantId: tenant.id,
      name: form.name.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
    };
    if (form.id) record.id = form.id;
    const result = dispatch({ type: 'supplier.save', record });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      toast.push(result.error, 'danger');
      return;
    }
    toast.push(form.id ? 'Supplier updated' : 'Supplier added', 'success');
    setForm(EMPTY);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 p-3 sm:p-4">
      <header>
        <h2 className="text-lg font-semibold tracking-tight text-content">Suppliers</h2>
        <p className="text-xs text-content-muted">Suppliers belong to {tenant?.name || 'this business'}. GSTIN and email are not stored.</p>
      </header>

      <form className="premium-card grid gap-3 p-3 md:grid-cols-3" onSubmit={submit}>
        <Input label="Supplier name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Input label="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
        {error && <p className="text-xs text-danger md:col-span-3" role="alert">{error}</p>}
        <div className="flex gap-2 md:col-span-3">
          <Button type="submit" size="sm" disabled={busy}>{busy ? 'Saving...' : form.id ? 'Save changes' : 'Add supplier'}</Button>
          {form.id && <Button type="button" size="sm" variant="outline" onClick={() => { setForm(EMPTY); setError(''); }}>Cancel</Button>}
        </div>
      </form>

      <section className="premium-card p-3">
        <Input aria-label="Search suppliers" placeholder="Search name, phone, or city" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9" />
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-content-muted">
            {rows.length === 0 ? 'No suppliers for this business yet.' : 'No suppliers match this search.'}
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-2 md:hidden">
              {visible.map((supplier) => (
                <li key={supplier.id} className="rounded-xl border border-border p-3 text-sm">
                  <p className="font-medium">{supplier.name}</p>
                  <p className="text-xs text-content-muted">{supplier.phone || 'No phone'} · {supplier.city || 'No city'}</p>
                  <button type="button" className="mt-2 text-xs font-medium text-accent" onClick={() => setForm({ id: supplier.id, name: supplier.name, phone: supplier.phone || '', city: supplier.city || '' })}>Edit</button>
                </li>
              ))}
            </ul>
            <div className="mt-3 hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-content-muted">
                    <th className="py-2 pr-3 font-medium">Name</th>
                    <th className="py-2 pr-3 font-medium">Phone</th>
                    <th className="py-2 pr-3 font-medium">City</th>
                    <th className="py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((supplier) => (
                    <tr key={supplier.id} className="border-b border-border/70">
                      <td className="py-2 pr-3 font-medium">{supplier.name}</td>
                      <td className="py-2 pr-3">{supplier.phone || '—'}</td>
                      <td className="py-2 pr-3">{supplier.city || '—'}</td>
                      <td className="py-2">
                        <button type="button" className="text-xs font-medium text-accent" onClick={() => setForm({ id: supplier.id, name: supplier.name, phone: supplier.phone || '', city: supplier.city || '' })}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
