import { useMemo, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { formatPaise, paiseToRupees } from '@services/demo/money.js';
import { refundedPaise, returnedQty } from '@services/demo/engine.js';
import { useToast } from '@shared/feedback/Toast.jsx';
function Shell({ title, children }) {
  return (
    <div className="space-y-4 p-5">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </div>
  );
}

export function SalesScreen() {
  const { state } = useDemo();
  const { tenant, branches } = useTenant();
  const [query, setQuery] = useState('');
  const [receipt, setReceipt] = useState(null);
  const allowed = new Set(branches.map((item) => item.id));
  const rows = state.sales.filter((sale) => sale.tenantId === tenant?.id && allowed.has(sale.branchId) && `${sale.invoiceNo}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <Shell title="Sales">
      <Input placeholder="Search invoice" value={query} onChange={(event) => setQuery(event.target.value)} />
      <table className="w-full text-left text-sm">
        <thead><tr className="text-xs text-content-muted"><th className="py-2">Invoice</th><th>When</th><th>Cashier</th><th>Total</th><th></th></tr></thead>
        <tbody>
          {rows.map((sale) => {
            const cashier = state.users.find((user) => user.id === sale.cashierId);
            const branch = state.branches.find((item) => item.id === sale.branchId);
            return (
              <tr key={sale.id} className="border-t border-border">
                <td className="py-2">{sale.invoiceNo}</td>
                <td>{new Date(sale.createdAt).toLocaleString('en-IN')}</td>
                <td>{cashier?.firstName} · {branch?.name}</td>
                <td>{formatPaise(sale.totalPaise, tenant?.currency)}</td>
                <td><button type="button" className="text-accent" onClick={() => setReceipt(sale)}>Reprint</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {receipt && (
        <div className="rounded-xl border border-border bg-surface p-4 text-sm">
          <p className="font-semibold">{receipt.invoiceNo}</p>
          {receipt.lines.map((line) => <p key={line.productId}>{line.name} Ã— {line.qty}</p>)}
          <p>Total {formatPaise(receipt.totalPaise, tenant?.currency)}</p>
          <p className="text-xs text-content-muted">Simulated payment · {receipt.payments.map((payment) => payment.method).join(', ')}</p>
          <Button className="mt-2" size="sm" onClick={() => window.print()}>Print</Button>
        </div>
      )}
    </Shell>
  );
}

export function ReturnsScreen() {
  const { state, dispatch } = useDemo();
  const { tenant, branches } = useTenant();
  const toast = useToast();
  const [invoice, setInvoice] = useState('');
  const [qty, setQty] = useState({});
  const [reason, setReason] = useState('Customer return');
  const [restock, setRestock] = useState(true);
  const allowed = new Set(branches.map((item) => item.id));
  const sale = state.sales.find((item) => item.tenantId === tenant?.id && allowed.has(item.branchId) && item.invoiceNo.toLowerCase() === invoice.trim().toLowerCase());
  const submit = () => {
    const lines = Object.entries(qty).filter(([, value]) => Number(value) > 0).map(([index, value]) => ({ lineIndex: Number(index), qty: Number(value), restock }));
    const result = dispatch({ type: 'return.create', tenantId: tenant.id, saleId: sale.id, lines, reason });
    toast.push(result.ok ? 'Return recorded' : result.error, result.ok ? 'success' : 'danger');
  };
  return (
    <Shell title="Returns">
      <Input label="Invoice number" value={invoice} onChange={(event) => setInvoice(event.target.value)} placeholder="TAK-1048" />
      {sale && (
        <div className="space-y-2">
          {sale.lines.map((line, index) => {
            const already = returnedQty(state, sale.id, index);
            return (
              <label key={line.productId} className="flex items-center justify-between gap-3 text-sm">
                <span>{line.name} · sold {line.qty} · already returned {already}</span>
                <input className="w-20 rounded border border-border px-2 py-1" type="number" min="0" max={line.qty - already} value={qty[index] || ''} onChange={(event) => setQty({ ...qty, [index]: event.target.value })} />
              </label>
            );
          })}
          <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
          <label className="text-sm"><input type="checkbox" checked={restock} onChange={(event) => setRestock(event.target.checked)} /> Put quantity back into stock</label>
          <Button onClick={submit}>Confirm return</Button>
        </div>
      )}
    </Shell>
  );
}

export function RefundsScreen() {
  const { state, dispatch } = useDemo();
  const { tenant, branches } = useTenant();
  const toast = useToast();
  const [saleId, setSaleId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const allowed = new Set(branches.map((item) => item.id));
  const returns = state.returns.filter((item) => item.tenantId === tenant?.id && allowed.has(state.sales.find((sale) => sale.id === item.saleId)?.branchId));
  const submit = () => {
    const result = dispatch({ type: 'refund.create', tenantId: tenant.id, saleId, amountPaise: Math.round(Number(amount) * 100), method });
    toast.push(result.ok ? 'Simulated refund recorded' : result.error, result.ok ? 'success' : 'danger');
  };
  return (
    <Shell title="Refunds">
      <p className="text-xs text-content-muted">Refunds are simulated and cannot exceed the value already returned.</p>
      <ul className="space-y-2 text-sm">
        {returns.map((item) => (
          <li key={item.id}>
            <button type="button" className="text-accent" onClick={() => { setSaleId(item.saleId); setAmount(String(paiseToRupees(item.amountPaise - refundedPaise(state, item.saleId)))); }}>{item.invoiceNo} · return {formatPaise(item.amountPaise, tenant?.currency)} · refunded {formatPaise(refundedPaise(state, item.saleId), tenant?.currency)}</button>
          </li>
        ))}
      </ul>
      <Input label="Refund amount (â‚¹)" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
      <select className="rounded border border-border px-2 py-2 text-sm" value={method} onChange={(event) => setMethod(event.target.value)}>
        <option value="cash">Cash</option>
        <option value="upi">UPI (simulated)</option>
        <option value="card">Card (simulated)</option>
      </select>
      <Button onClick={submit} disabled={!saleId}>Record simulated refund</Button>
      <h3 className="pt-2 text-sm font-semibold">History</h3>
      <ul className="text-sm">{state.refunds.filter((item) => item.tenantId === tenant?.id && allowed.has(state.sales.find((sale) => sale.id === item.saleId)?.branchId)).map((item) => <li key={item.id}>{item.invoiceNo} · {formatPaise(item.amountPaise, tenant?.currency)} · {item.status}</li>)}</ul>
    </Shell>
  );
}

export function CustomersScreen() {
  const { state, dispatch } = useDemo();
  const { tenant } = useTenant();
  const [form, setForm] = useState({ name: '', phone: '', email: '', notes: '' });
  const [query, setQuery] = useState('');
  const rows = state.customers.filter((customer) => customer.tenantId === tenant?.id && !customer.walkIn && `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <Shell title="Customers">
      <Input placeholder="Search name, phone, or email" value={query} onChange={(event) => setQuery(event.target.value)} />
      <form className="grid gap-2 rounded-xl border border-border bg-surface p-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); dispatch({ type: 'customer.save', record: { ...form, tenantId: tenant.id, loyaltyPoints: 0, balancePaise: 0 } }); setForm({ name: '', phone: '', email: '', notes: '' }); }}>
        <Input label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <Input label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
        <Input label="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Input label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        <Button type="submit">Save customer</Button>
      </form>
      <ul className="space-y-3">
        {rows.map((customer) => {
          const sales = state.sales.filter((sale) => sale.customerId === customer.id);
          const spent = sales.reduce((sum, sale) => sum + sale.totalPaise, 0);
          return (
            <li key={customer.id} className="rounded-xl border border-border bg-surface p-4 text-sm">
              <p className="font-medium">{customer.name}</p>
              <p className="text-content-muted">{customer.phone} {customer.email}</p>
              <p>Loyalty points (demo): {customer.loyaltyPoints + Math.floor(spent / 10000)} · Spent {formatPaise(spent, tenant?.currency)}</p>
              <p className="text-xs text-content-muted">{customer.notes}</p>
              <ul className="mt-1">{sales.map((sale) => <li key={sale.id}>{sale.invoiceNo}</li>)}</ul>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}

export { InventoryScreen } from '../inventory/InventoryScreen.jsx';
export { PurchasesScreen } from '../inventory/PurchasesScreen.jsx';
export { SuppliersScreen } from '../inventory/SuppliersScreen.jsx';
export { BranchesScreen } from '../branches/BranchesScreen.jsx';

export { SubscriptionScreen } from '../subscription/SubscriptionScreen.jsx';
