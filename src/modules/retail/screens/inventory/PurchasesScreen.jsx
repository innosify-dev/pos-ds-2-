import { useEffect, useMemo, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useToast } from '@shared/feedback/Toast.jsx';
import { StockBadge } from '@modules/retail/components/inventory/StockBadge.jsx';
import { formatWhen } from '@modules/retail/components/inventory/inventoryView.js';
import { returnedPurchaseQty } from '@services/demo/customerFlows.js';
import { formatPaise } from '@services/demo/money.js';

export function PurchasesScreen() {
  const { state, dispatch } = useDemo();
  const { tenant, branches, branch } = useTenant();
  const toast = useToast();
  const allowed = new Set(branches.map((item) => item.id));
  const products = state.products.filter((product) => product.tenantId === tenant?.id);
  const suppliers = state.suppliers.filter((supplier) => supplier.tenantId === tenant?.id);
  const [supplierId, setSupplierId] = useState('');
  const [productId, setProductId] = useState('');
  const [qty, setQty] = useState('1');
  const [note, setNote] = useState('');
  const [receiveBranch, setReceiveBranch] = useState(branch?.id || '');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [returnQty, setReturnQty] = useState({});
  const [returnReason, setReturnReason] = useState('Damaged goods');

  useEffect(() => {
    if (branch?.id) setReceiveBranch(branch.id);
  }, [branch?.id]);

  const purchases = useMemo(() => state.purchases.filter((item) => item.tenantId === tenant?.id && allowed.has(item.branchId)), [state.purchases, tenant?.id, branches]);
  const visible = purchases.filter((item) => {
    const supplier = suppliers.find((row) => row.id === item.supplierId);
    const text = `${supplier?.name || ''} ${item.note || ''} ${item.lines.map((line) => line.name || '').join(' ')}`.toLowerCase();
    return text.includes(query.trim().toLowerCase());
  });

  const submit = (event) => {
    event.preventDefault();
    if (busy) return;
    const amount = Math.round(Number(qty));
    if (!supplierId || !productId || amount < 1 || !receiveBranch) {
      setError('Choose a supplier, branch, product, and a quantity of at least 1.');
      return;
    }
    const product = products.find((item) => item.id === productId);
    setBusy(true);
    setError('');
    const result = dispatch({
      type: 'purchase.create',
      tenantId: tenant.id,
      branchId: receiveBranch,
      supplierId,
      note: note.trim(),
      lines: [{ productId, name: product?.name, qty: amount }],
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      toast.push(result.error, 'danger');
      return;
    }
    toast.push('Stock received', 'success');
    setQty('1');
    setNote('');
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 p-3 sm:p-4">
      <header>
        <h2 className="text-lg font-semibold tracking-tight text-content">Purchases</h2>
        <p className="text-xs text-content-muted">
          A receipt adds quantity immediately. There is no separate receive step, and no order is sent to a supplier.
        </p>
      </header>

      <form className="premium-card grid gap-3 p-3 md:grid-cols-2" onSubmit={submit}>
        <Select label="Supplier" value={supplierId} onChange={(event) => setSupplierId(event.target.value)} required>
          <option value="">Select a supplier</option>
          {suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}
        </Select>
        <Select label="Branch" value={receiveBranch} onChange={(event) => setReceiveBranch(event.target.value)} required>
          {branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select label="Product" value={productId} onChange={(event) => setProductId(event.target.value)} required>
          <option value="">Select a product</option>
          {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
        </Select>
        <Input label="Quantity" type="number" min="1" value={qty} onChange={(event) => setQty(event.target.value)} required />
        <div className="md:col-span-2">
          <Input label="Note" value={note} onChange={(event) => setNote(event.target.value)} hint="Optional. Purchase totals and tax are not stored on receipts." />
        </div>
        {error && <p className="text-xs text-danger md:col-span-2" role="alert">{error}</p>}
        <div>
          <Button type="submit" size="sm" disabled={busy || suppliers.length === 0 || products.length === 0}>
            {busy ? 'Receiving...' : 'Receive stock'}
          </Button>
        </div>
      </form>

      <section className="premium-card p-3">
        <Input aria-label="Search purchases" placeholder="Search supplier, product, or note" value={query} onChange={(event) => setQuery(event.target.value)} className="h-9" />
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-content-muted">
            {purchases.length === 0 ? 'No goods receipts for your branches yet.' : 'No receipts match this search.'}
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-content-muted">
                  <th className="py-2 pr-3 font-medium">Receipt</th>
                  <th className="py-2 pr-3 font-medium">Supplier</th>
                  <th className="py-2 pr-3 font-medium">Branch</th>
                  <th className="py-2 pr-3 font-medium">Date</th>
                  <th className="py-2 pr-3 font-medium">Items</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => {
                  const supplier = suppliers.find((row) => row.id === item.supplierId);
                  const branchName = branches.find((row) => row.id === item.branchId)?.name || 'Branch';
                  const open = openId === item.id;
                  return (
                    <tr key={item.id} className="border-b border-border/70 align-top">
                      <td className="py-2 pr-3" colSpan={open ? 6 : 1}>
                        {open ? (
                          <div>
                            <button type="button" className="text-xs font-medium text-accent" onClick={() => setOpenId(null)}>Close details</button>
                            <p className="mt-1 font-medium">{supplier?.name || 'Supplier'}</p>
                            <p className="text-xs text-content-muted">{branchName} · {formatWhen(item.createdAt)} · {item.status === 'RECEIVED' || !item.status ? 'Received' : item.status}</p>
                            <ul className="mt-2 text-sm">
                              {item.lines.map((line, index) => (
                                <li key={`${item.id}-${index}`}>{line.name || 'Item'} × {line.qty}</li>
                              ))}
                            </ul>
                            {item.note && <p className="mt-1 text-xs text-content-muted">{item.note}</p>}
                            <p className="mt-1 text-xs text-content-muted">Receipt totals are not stored. A return uses the product cost on file. Supplier credit notes stay pending.</p>
                            <div className="mt-2 space-y-2">
                              {item.lines.map((line, index) => {
                                const eligible = line.qty - returnedPurchaseQty(state, item.id, index);
                                return (
                                  <label key={`${item.id}-ret-${index}`} className="flex items-center justify-between gap-2 text-xs">
                                    <span>{line.name || 'Item'} · eligible {eligible}</span>
                                    <input className="w-16 rounded border border-border px-2 py-1" type="number" min="0" max={eligible} value={returnQty[`${item.id}-${index}`] || ''} onChange={(event) => setReturnQty({ ...returnQty, [`${item.id}-${index}`]: event.target.value })} aria-label={`Return quantity for ${line.name || 'item'}`} />
                                  </label>
                                );
                              })}
                              <Select label="Reason" value={returnReason} onChange={(event) => setReturnReason(event.target.value)}>
                                {['Damaged goods', 'Wrong item', 'Defective goods', 'Excess quantity', 'Other'].map((reason) => <option key={reason} value={reason}>{reason}</option>)}
                              </Select>
                              <Button size="sm" variant="outline" onClick={() => {
                                const lines = item.lines.map((line, index) => ({ lineIndex: index, qty: Number(returnQty[`${item.id}-${index}`]) || 0 })).filter((line) => line.qty > 0);
                                const result = dispatch({ type: 'purchase.return', tenantId: tenant.id, purchaseId: item.id, reason: returnReason, lines, clientKey: `pr-${item.id}-${Date.now()}` });
                                toast.push(result.ok ? 'Purchase return recorded. Supplier credit is pending.' : result.error, result.ok ? 'success' : 'danger');
                              }}>Return to supplier</Button>
                            </div>
                          </div>
                        ) : (
                          <button type="button" className="font-medium text-accent" onClick={() => setOpenId(item.id)}>View</button>
                        )}
                      </td>
                      {!open && (
                        <>
                          <td className="py-2 pr-3">{supplier?.name || '—'}</td>
                          <td className="py-2 pr-3">{branchName}</td>
                          <td className="py-2 pr-3">{formatWhen(item.createdAt)}</td>
                          <td className="py-2 pr-3">{item.lines.map((line) => `${line.name || 'Item'} × ${line.qty}`).join(', ')}</td>
                          <td className="py-2"><StockBadge status={item.status === 'RECEIVED' || !item.status ? 'Received' : item.status} /></td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="premium-card p-3">
        <h3 className="text-sm font-semibold text-content">Purchase returns</h3>
        <p className="text-xs text-content-muted">Stock is reduced at the receipt’s branch. Supplier settlement stays pending.</p>
        <ul className="mt-2 space-y-2 text-sm">
          {(state.purchaseReturns || []).filter((item) => item.tenantId === tenant?.id && allowed.has(item.branchId)).map((item) => (
            <li key={item.id}>
              {suppliers.find((row) => row.id === item.supplierId)?.name || 'Supplier'} · {item.reason} · {formatPaise(item.amountPaise, tenant?.currency)} · {item.settlement}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
