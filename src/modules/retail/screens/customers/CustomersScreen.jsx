import { useMemo, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useDemo } from '@services/demo';
import { loyaltyProgram } from '@services/demo/customerFlows.js';
import { formatPaise } from '@services/demo/money.js';
import { useToast } from '@shared/feedback/Toast.jsx';

const empty = { name: '', phone: '', email: '', address: '', city: '', stateName: '', pin: '', gstin: '', notes: '', status: 'ACTIVE' };

export function CustomersScreen() {
  const { state, dispatch } = useDemo();
  const { tenant } = useTenant();
  const { can } = useAuth();
  const toast = useToast();
  const canEdit = can('customers.manage');
  const canCreate = can('customers.create') || canEdit;
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const program = loyaltyProgram(state, tenant?.id);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.customers
      .filter((customer) => customer.tenantId === tenant?.id && !customer.walkIn)
      .filter((customer) => `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(needle))
      .map((customer) => {
        const sales = state.sales.filter((sale) => sale.tenantId === tenant?.id && sale.customerId === customer.id);
        const spentPaise = sales.reduce((sum, sale) => sum + sale.totalPaise, 0);
        const last = sales.map((sale) => sale.createdAt).sort().at(-1) || null;
        return { customer, sales, spentPaise, last };
      });
  }, [query, state.customers, state.sales, tenant?.id]);

  const selected = rows.find((row) => row.customer.id === selectedId) || null;
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const save = (event) => {
    event.preventDefault();
    setError('');
    const result = dispatch({
      type: 'customer.save',
      tenantId: tenant.id,
      record: { ...form, id: editingId || undefined },
    });
    if (!result.ok) {
      setError(result.error);
      toast.push(result.error, 'danger');
      return;
    }
    toast.push(editingId ? 'Customer updated' : 'Customer added', 'success');
    setForm(empty);
    setEditingId('');
  };

  const startEdit = (customer) => {
    setEditingId(customer.id);
    setSelectedId(customer.id);
    setForm({
      name: customer.name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      city: customer.city || '',
      stateName: customer.stateName || '',
      pin: customer.pin || '',
      gstin: customer.gstin || '',
      notes: customer.notes || '',
      status: customer.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 p-3 sm:p-4">
      <header>
        <h2 className="text-lg font-semibold tracking-tight text-content">Customers</h2>
        <p className="text-xs text-content-muted">{rows.length} in this business. Purchase totals come from recorded sales.</p>
      </header>
      <Input aria-label="Search customers" placeholder="Search name or phone" value={query} onChange={(event) => setQuery(event.target.value)} />
      {canCreate && (
        <form className="premium-card grid gap-3 p-3 md:grid-cols-2" onSubmit={save}>
          <Input label="Name" value={form.name} onChange={set('name')} required />
          <Input label="Phone" value={form.phone} onChange={set('phone')} required />
          <Input label="Email" value={form.email} onChange={set('email')} />
          <Input label="GSTIN" value={form.gstin} onChange={set('gstin')} hint="Optional, for a business customer." />
          <Input label="Address" value={form.address} onChange={set('address')} />
          <Input label="City" value={form.city} onChange={set('city')} />
          <Input label="State" value={form.stateName} onChange={set('stateName')} />
          <Input label="PIN code" value={form.pin} onChange={set('pin')} />
          <div className="md:col-span-2">
            <Input label="Notes" value={form.notes} onChange={set('notes')} />
          </div>
          {canEdit && (
            <label className="flex items-center gap-2 text-sm text-content">
              <input type="checkbox" checked={form.status === 'ACTIVE'} onChange={(event) => setForm((current) => ({ ...current, status: event.target.checked ? 'ACTIVE' : 'INACTIVE' }))} />
              Active
            </label>
          )}
          {error && <p className="text-xs text-danger md:col-span-2" role="alert">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm">{editingId ? 'Save changes' : 'Add customer'}</Button>
            {editingId && <Button type="button" size="sm" variant="outline" onClick={() => { setEditingId(''); setForm(empty); }}>Cancel edit</Button>}
          </div>
        </form>
      )}
      <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
        <div className="premium-card overflow-x-auto p-3">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-content-muted">
                <th className="py-2 pr-3 font-medium">Customer</th>
                <th className="py-2 pr-3 font-medium">Phone</th>
                <th className="py-2 pr-3 font-medium">Spent</th>
                <th className="py-2 pr-3 font-medium">Last sale</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ customer, spentPaise, last }) => (
                <tr key={customer.id} className="border-b border-border/70">
                  <td className="py-2 pr-3">
                    <button type="button" className="font-medium text-accent" onClick={() => setSelectedId(customer.id)}>{customer.name}</button>
                  </td>
                  <td className="py-2 pr-3">{customer.phone || '—'}</td>
                  <td className="py-2 pr-3 tabular-nums">{formatPaise(spentPaise, tenant?.currency)}</td>
                  <td className="py-2 pr-3">{last ? new Date(last).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="py-2">
                    <span className="text-xs">{customer.status === 'INACTIVE' ? 'Inactive' : 'Active'}</span>
                    {canEdit && <button type="button" className="ml-2 text-xs font-medium text-accent" onClick={() => startEdit(customer)}>Edit</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-8 text-center text-sm text-content-muted">No customers match this search.</p>}
        </div>
        <aside className="premium-card p-3 text-sm">
          {!selected && <p className="text-content-muted">Select a customer to see purchases, points, and store credit.</p>}
          {selected && (
            <>
              <h3 className="font-semibold text-content">{selected.customer.name}</h3>
              <p className="text-xs text-content-muted">{[selected.customer.phone, selected.customer.email, selected.customer.city].filter(Boolean).join(' · ')}</p>
              <p className="mt-2">Spent {formatPaise(selected.spentPaise, tenant?.currency)} across {selected.sales.length} sale{selected.sales.length === 1 ? '' : 's'}.</p>
              <p>Points {selected.customer.loyaltyPoints}. {program?.enabled ? `Earn 1 point per ${formatPaise(program.pointsPerSpendPaise, tenant?.currency)}. 1 point = ${formatPaise(program.paisePerPoint, tenant?.currency)}.` : 'Loyalty rules are not configured.'}</p>
              <p>Store credit {formatPaise(selected.customer.balancePaise, tenant?.currency)}. This is not a bank balance.</p>
              <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-content-muted">Purchases</h4>
              <ul className="mt-1 space-y-1">
                {selected.sales.map((sale) => <li key={sale.id}>{sale.invoiceNo} · {formatPaise(sale.totalPaise, tenant?.currency)}</li>)}
                {selected.sales.length === 0 && <li className="text-content-muted">No recorded sales.</li>}
              </ul>
              <h4 className="mt-3 text-xs font-semibold uppercase tracking-wide text-content-muted">Returns</h4>
              <ul className="mt-1 space-y-1">
                {state.returns.filter((item) => selected.sales.some((sale) => sale.id === item.saleId)).map((item) => (
                  <li key={item.id}>{item.invoiceNo} · {formatPaise(item.amountPaise, tenant?.currency)}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
