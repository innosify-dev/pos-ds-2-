import { useMemo, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { formatPaise, paiseToRupees } from '@services/demo/money.js';
import { creditedPaise, refundedPaise } from '@services/demo/engine.js';
import { eligibleSoldQty } from '@services/demo/customerFlows.js';
import { ExchangeForm } from '@modules/retail/components/returns/ExchangeForm.jsx';
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
          {receipt.lines.map((line) => <p key={line.productId}>{line.name} × {line.qty}</p>)}
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
            const already = line.qty - eligibleSoldQty(state, sale, index);
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
          <ExchangeForm sale={sale} products={state.products.filter((product) => product.tenantId === tenant?.id)} currency={tenant?.currency} />
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
            <button type="button" className="text-accent" onClick={() => { setSaleId(item.saleId); setAmount(String(paiseToRupees(Math.max(0, item.amountPaise - refundedPaise(state, item.saleId) - creditedPaise(state, item.saleId))))); }}>{item.invoiceNo} · return {formatPaise(item.amountPaise, tenant?.currency)} · refunded {formatPaise(refundedPaise(state, item.saleId), tenant?.currency)} · store credit {formatPaise(creditedPaise(state, item.saleId), tenant?.currency)}</button>
          </li>
        ))}
      </ul>
      <Input label="Refund amount (₹)" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} />
      <select className="rounded border border-border px-2 py-2 text-sm" value={method} onChange={(event) => setMethod(event.target.value)}>
        <option value="cash">Cash</option>
        <option value="upi">UPI (simulated)</option>
        <option value="card">Card (simulated)</option>
      </select>
      <div className="flex flex-wrap gap-2">
        <Button onClick={submit} disabled={!saleId}>Record simulated refund</Button>
        <Button variant="outline" disabled={!saleId} onClick={() => {
          const result = dispatch({ type: 'credit.issue', tenantId: tenant.id, saleId, amountPaise: Math.round(Number(amount) * 100), clientKey: `crd-${saleId}-${Date.now()}` });
          toast.push(result.ok ? 'Store credit issued. This is not a bank refund.' : result.error, result.ok ? 'success' : 'danger');
        }}>Issue as store credit</Button>
      </div>
      <h3 className="pt-2 text-sm font-semibold">History</h3>
      <ul className="text-sm">{state.refunds.filter((item) => item.tenantId === tenant?.id && allowed.has(state.sales.find((sale) => sale.id === item.saleId)?.branchId)).map((item) => <li key={item.id}>{item.invoiceNo} · {formatPaise(item.amountPaise, tenant?.currency)} · {item.status}</li>)}</ul>
    </Shell>
  );
}

export { CustomersScreen } from '../customers/CustomersScreen.jsx';

export { InventoryScreen } from '../inventory/InventoryScreen.jsx';
export { PurchasesScreen } from '../inventory/PurchasesScreen.jsx';
export { SuppliersScreen } from '../inventory/SuppliersScreen.jsx';
export { BranchesScreen } from '../branches/BranchesScreen.jsx';

export { SubscriptionScreen } from '../subscription/SubscriptionScreen.jsx';
