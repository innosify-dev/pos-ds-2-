import { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { useDemo } from '@services/demo';
import { eligibleSoldQty } from '@services/demo/customerFlows.js';
import { quoteCart, formatPaise, rupeesToPaise } from '@services/demo/money.js';
import { useToast } from '@shared/feedback/Toast.jsx';

export function ExchangeForm({ sale, products, currency }) {
  const { state, dispatch } = useDemo();
  const toast = useToast();
  const [qty, setQty] = useState({});
  const [replacementId, setReplacementId] = useState('');
  const [replacementQty, setReplacementQty] = useState('1');
  const [settle, setSettle] = useState('simulated_refund');
  const [error, setError] = useState('');

  if (!sale) return null;
  const lines = sale.lines.map((line, index) => ({ line, index, eligible: eligibleSoldQty(state, sale, index) })).filter((item) => item.eligible > 0);
  const chosen = lines.filter((item) => Number(qty[item.index]) > 0);
  const returnValue = chosen.reduce((sum, item) => sum + Math.round((item.line.totalPaise * Number(qty[item.index])) / item.line.qty), 0);
  const product = products.find((item) => item.id === replacementId);
  const replacement = product ? quoteCart([{
    productId: product.id,
    qty: Number(replacementQty) || 0,
    unitPricePaise: rupeesToPaise(product.price),
    taxRate: product.taxRate || 0,
  }]) : null;
  const difference = replacement ? replacement.totalPaise - returnValue : 0;

  const submit = () => {
    setError('');
    const result = dispatch({
      type: 'exchange.create',
      tenantId: sale.tenantId,
      saleId: sale.id,
      clientKey: `ex-${sale.id}-${Date.now()}`,
      lines: chosen.map((item) => ({ lineIndex: item.index, qty: Number(qty[item.index]) })),
      replacements: [{ productId: replacementId, qty: Number(replacementQty) }],
      settle,
      payments: difference > 0 ? [{ method: 'cash', amountPaise: difference }] : [],
    });
    if (!result.ok) {
      setError(result.error);
      toast.push(result.error, 'danger');
      return;
    }
    toast.push(difference < 0 ? 'Exchange recorded. Any money back is simulated and was not transferred.' : 'Exchange recorded. The original invoice was kept.', 'success');
    setQty({});
  };

  return (
    <div className="mt-4 space-y-2 rounded-xl border border-border p-3">
      <h3 className="text-sm font-semibold text-content">Exchange</h3>
      <p className="text-xs text-content-muted">The original sale stays as recorded. A linked exchange adjusts stock. A lower price is a simulated refund or store credit, not a bank transfer.</p>
      {lines.map((item) => (
        <label key={item.index} className="flex items-center justify-between gap-3 text-sm">
          <span>{item.line.name} · eligible {item.eligible}</span>
          <input className="w-20 rounded border border-border px-2 py-1" type="number" min="0" max={item.eligible} value={qty[item.index] || ''} onChange={(event) => setQty({ ...qty, [item.index]: event.target.value })} aria-label={`Exchange quantity for ${item.line.name}`} />
        </label>
      ))}
      <Select label="Replacement" value={replacementId} onChange={(event) => setReplacementId(event.target.value)}>
        <option value="">Select a product</option>
        {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </Select>
      <Input label="Replacement quantity" type="number" min="1" value={replacementQty} onChange={(event) => setReplacementQty(event.target.value)} />
      {difference < 0 && (
        <Select label="Difference" value={settle} onChange={(event) => setSettle(event.target.value)}>
          <option value="simulated_refund">Simulated refund</option>
          <option value="store_credit">Store credit</option>
        </Select>
      )}
      <p className="text-xs text-content-muted">
        Return value {formatPaise(returnValue, currency)} · Replacement {replacement ? formatPaise(replacement.totalPaise, currency) : '—'} · Difference {formatPaise(difference, currency)}
      </p>
      {error && <p className="text-xs text-danger" role="alert">{error}</p>}
      <Button size="sm" onClick={submit} disabled={!chosen.length || !replacementId}>Confirm exchange</Button>
    </div>
  );
}
