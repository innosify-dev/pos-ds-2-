import { useMemo, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { formatPaise } from '@services/demo/money.js';
import { useToast } from '@shared/feedback/Toast.jsx';

const LIMIT_LABELS = [
  ['branches', 'Branches'],
  ['registers', 'Registers'],
  ['users', 'Users'],
  ['transactions', 'Transactions this month'],
];

export function SubscriptionScreen() {
  const { state, dispatch } = useDemo();
  const { tenant, subscription, plan } = useTenant();
  const toast = useToast();
  const [busy, setBusy] = useState('');
  const usage = useMemo(() => {
    const month = new Date().toISOString().slice(0, 7);
    return {
      branches: state.branches.filter((item) => item.tenantId === tenant?.id).length,
      registers: state.registers.filter((item) => item.tenantId === tenant?.id).length,
      users: state.memberships.filter((item) => item.tenantId === tenant?.id && item.status === 'ACTIVE').length,
      transactions: state.sales.filter((item) => item.tenantId === tenant?.id && item.createdAt.slice(0, 7) === month).length,
    };
  }, [state, tenant?.id]);

  if (!plan || !subscription) {
    return (
      <div className="p-5">
        <h2 className="text-base font-semibold">Subscription</h2>
        <p className="mt-2 text-sm text-content-muted">No subscription is recorded for this business.</p>
      </div>
    );
  }

  const trialDays = subscription.trialEndsAt ? Math.ceil((new Date(subscription.trialEndsAt) - Date.now()) / 86400000) : null;
  const limits = {
    branches: plan.limits?.branches,
    registers: plan.limits?.registers,
    users: plan.limits?.users,
    transactions: plan.limits?.transactionsPerMonth,
  };

  const change = (planCode) => {
    if (busy) return;
    setBusy(planCode);
    const result = dispatch({
      type: 'subscription.assign',
      tenantId: tenant.id,
      planCode,
      status: 'ACTIVE',
      eventType: 'PLAN_CHANGED',
      note: 'Simulated plan change. No payment was taken.',
      actor: 'owner',
    });
    setBusy('');
    toast.push(result.ok ? `${planCode} is now the demo plan. No card was charged.` : result.error, result.ok ? 'success' : 'danger');
  };

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <header>
        <h2 className="text-base font-semibold">Subscription</h2>
        <p className="mt-0.5 text-xs text-content-muted">{tenant?.name}. Plan details come from the demo catalog. Switching a plan does not collect a payment.</p>
      </header>
      <section className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-content-muted">Current plan</p>
        <h2 className="mt-1 text-lg font-semibold">{plan.name}</h2>
        <p className="text-sm text-content-muted">{formatPaise(plan.pricePaise)} · {plan.interval || 'MONTHLY'} · {subscription.status}</p>
        {subscription.status === 'TRIALING' && trialDays != null && (
          <p className="mt-1 text-sm">Trial end {new Date(subscription.trialEndsAt).toLocaleDateString('en-IN')} ({trialDays} day{trialDays === 1 ? '' : 's'}).</p>
        )}
        {subscription.renewsAt && <p className="mt-1 text-sm text-content-muted">Recorded renewal date {new Date(subscription.renewsAt).toLocaleDateString('en-IN')}. No charge is collected.</p>}
        <ul className="mt-3 space-y-2">
          {LIMIT_LABELS.map(([key, label]) => {
            const used = usage[key] || 0;
            const cap = limits[key];
            const width = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0;
            return (
              <li key={key}>
                <div className="flex justify-between text-sm"><span>{label}</span><span className="tabular-nums">{used} / {cap ?? '—'}</span></div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-muted"><div className="h-full bg-accent" style={{ width: `${width}%` }} /></div>
              </li>
            );
          })}
        </ul>
      </section>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {state.plans.filter((item) => item.active).map((item) => (
          <article key={item.code} className="flex flex-col rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold">{item.name}</h2>
              {item.code === plan.code && <span className="rounded-full bg-accent-muted px-2 py-0.5 text-[11px] font-medium text-accent">Current</span>}
            </div>
            <p className="mt-1 text-sm">{formatPaise(item.pricePaise)} / month</p>
            <p className="mt-1 text-xs text-content-muted">{item.description}</p>
            <ul className="mt-3 flex-1 space-y-1 text-sm">
              {(item.features || []).map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <p className="mt-2 text-xs text-content-muted">
              {item.limits.branches} branches · {item.limits.registers} registers · {item.limits.users} users
            </p>
            <Button
              className="mt-3"
              size="sm"
              variant={item.code === plan.code ? 'outline' : 'primary'}
              disabled={item.code === plan.code || Boolean(busy)}
              onClick={() => change(item.code)}
            >
              {item.code === plan.code ? 'Current plan' : busy === item.code ? 'Saving…' : 'Use in this demo'}
            </Button>
          </article>
        ))}
      </div>
      <section>
        <h2 className="text-sm font-semibold">History</h2>
        {(subscription.history || []).length === 0 ? <p className="mt-1 text-sm text-content-muted">No subscription events are recorded.</p> : (
          <ul className="mt-2 space-y-1 text-sm">
            {subscription.history.map((event, index) => (
              <li key={`${event.at || index}-${event.type}`}>{event.type} · {event.planCode} · {event.note}{event.at ? ` · ${new Date(event.at).toLocaleDateString('en-IN')}` : ''}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
