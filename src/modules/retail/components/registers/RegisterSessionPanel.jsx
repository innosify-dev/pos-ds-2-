import { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useDemo } from '@services/demo';
import { formatPaise, rupeesToPaise } from '@services/demo/money.js';

const CATEGORIES = ['Rent', 'Electricity', 'Transport', 'Packaging', 'Maintenance', 'Staff', 'Other'];

/**
 * Cash movements and expenses for the open register at the active branch.
 * Cash expenses become one cash-out movement. UPI and card expenses do not.
 */
export function RegisterSessionPanel({ register }) {
  const { state, dispatch } = useDemo();
  const { tenant, branch } = useTenant();
  const { tenantUser, can } = useAuth();
  const [direction, setDirection] = useState('in');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('Packaging');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseNote, setExpenseNote] = useState('');
  const [method, setMethod] = useState('cash');
  const [message, setMessage] = useState('');
  const currency = tenant?.currency;

  if (!register || register.status !== 'Open' || !can('registers.manage')) return null;

  const moves = (state.cashMoves || []).filter((move) => {
    if (move.registerId !== register.id) return false;
    if (register.openedAt && new Date(move.createdAt) < new Date(register.openedAt)) return false;
    return !register.sessionId || move.sessionId === register.sessionId;
  });
  const expenses = (state.expenses || []).filter((item) => item.tenantId === tenant?.id && item.branchId === branch?.id);

  const moveCash = () => {
    const result = dispatch({
      type: 'register.cash',
      tenantId: tenant.id,
      registerId: register.id,
      direction,
      amountPaise: rupeesToPaise(amount),
      reason,
      actorId: tenantUser?.id,
    });
    setMessage(result.ok ? 'Cash movement saved in this browser.' : result.error);
    if (result.ok) {
      setAmount('');
      setReason('');
    }
  };

  const saveExpense = () => {
    const result = dispatch({
      type: 'expense.save',
      tenantId: tenant.id,
      branchId: branch?.id,
      registerId: register.id,
      category,
      description: expenseNote,
      amountPaise: rupeesToPaise(expenseAmount),
      method,
      actorId: tenantUser?.id,
    });
    setMessage(result.ok ? 'Expense saved in this browser. It is not an accounting journal.' : result.error);
    if (result.ok) setExpenseNote('');
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-content">Cash in / cash out</h3>
        <p className="mt-1 text-xs text-content-muted">{register.name} · {register.store}. Expected cash {formatPaise(Math.round((register.expectedCash || 0) * 100), currency)}.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Select label="Direction" value={direction} onChange={(event) => setDirection(event.target.value)}>
            <option value="in">Cash in</option>
            <option value="out">Cash out</option>
          </Select>
          <Input label="Amount (₹)" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} />
          <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
        </div>
        <Button className="mt-3" size="sm" onClick={moveCash}>Save movement</Button>
        <ul className="mt-3 max-h-40 space-y-1 overflow-auto text-xs">
          {moves.length === 0 && <li className="text-content-muted">No cash movements in this session.</li>}
          {moves.map((move) => (
            <li key={move.id} className="flex justify-between gap-2">
              <span>{move.direction === 'in' ? 'In' : 'Out'} · {move.reason}</span>
              <span className="tabular-nums">{formatPaise(move.amountPaise, currency)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="text-sm font-semibold text-content">Expenses</h3>
        <p className="mt-1 text-xs text-content-muted">A cash expense is one cash-out. UPI and card expenses do not change the drawer.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Select label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
            {CATEGORIES.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
          <Select label="Paid by" value={method} onChange={(event) => setMethod(event.target.value)}>
            <option value="cash">Cash from this register</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </Select>
          <Input label="Expense amount (₹)" type="number" min="0" value={expenseAmount} onChange={(event) => setExpenseAmount(event.target.value)} />
          <Input label="Description" value={expenseNote} onChange={(event) => setExpenseNote(event.target.value)} />
        </div>
        <Button className="mt-3" size="sm" onClick={saveExpense}>Save expense</Button>
        <ul className="mt-3 max-h-40 space-y-1 overflow-auto text-xs">
          {expenses.length === 0 && <li className="text-content-muted">No expenses recorded for this branch.</li>}
          {expenses.slice(-6).reverse().map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span className="truncate">{item.category} · {item.description}</span>
              <span className="shrink-0 tabular-nums">{formatPaise(item.amountPaise, currency)} {item.method}</span>
            </li>
          ))}
        </ul>
      </div>
      {message && <p className="text-xs text-content lg:col-span-2" role="status">{message}</p>}
    </section>
  );
}
