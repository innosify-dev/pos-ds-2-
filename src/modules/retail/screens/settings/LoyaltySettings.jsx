import { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { loyaltyProgram } from '@services/demo/customerFlows.js';
import { useToast } from '@shared/feedback/Toast.jsx';

export function LoyaltySettings() {
  const { state, dispatch } = useDemo();
  const { tenant } = useTenant();
  const toast = useToast();
  const current = loyaltyProgram(state, tenant?.id);
  const [enabled, setEnabled] = useState(Boolean(current?.enabled));
  const [spendRupees, setSpendRupees] = useState(current?.pointsPerSpendPaise ? String(current.pointsPerSpendPaise / 100) : '');
  const [pointRupees, setPointRupees] = useState(current?.paisePerPoint ? String(current.paisePerPoint / 100) : '');

  const save = () => {
    const result = dispatch({
      type: 'loyalty.configure',
      tenantId: tenant.id,
      enabled,
      pointsPerSpendPaise: Math.round(Number(spendRupees) * 100),
      paisePerPoint: Math.round(Number(pointRupees) * 100),
    });
    toast.push(result.ok ? 'Loyalty rules saved for this business.' : result.error, result.ok ? 'success' : 'danger');
  };

  return (
    <section className="premium-card p-4">
      <h3 className="text-sm font-semibold text-content">Loyalty</h3>
      <p className="mt-1 text-xs text-content-muted">Points are not earned until you save both rules. Existing point balances stay as opening balances. Store credit is separate and is not a bank balance.</p>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
        Enable loyalty for this business
      </label>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Input label="Spend for 1 point (₹)" type="number" min="1" value={spendRupees} onChange={(event) => setSpendRupees(event.target.value)} hint="Example: 100 means one point per ₹100 spent." />
        <Input label="Value of 1 point (₹)" type="number" min="0.01" step="0.01" value={pointRupees} onChange={(event) => setPointRupees(event.target.value)} hint="Example: 1 means one point reduces the bill by ₹1." />
      </div>
      <Button className="mt-3" size="sm" onClick={save}>Save loyalty rules</Button>
    </section>
  );
}
