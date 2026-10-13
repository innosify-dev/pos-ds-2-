import { Link } from 'react-router-dom';

export function planPrice(paise) {
  if (!paise) return 'Free';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 ? 2 : 0,
  }).format(rupees);
}

export function planCta(plan) {
  if (plan.trialDays > 0) return `Start ${plan.trialDays}-day trial`;
  if (!plan.pricePaise) return 'Create account';
  return 'Get started';
}

const LIMIT_ROWS = [
  ['branches', 'Branches'],
  ['registers', 'Registers'],
  ['users', 'Users'],
  ['transactionsPerMonth', 'Transactions / month'],
];

export function Icon({ name, className = 'h-5 w-5' }) {
  const props = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, className, 'aria-hidden': true };
  if (name === 'scan') {
    return <svg {...props}><path d="M4 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3" strokeLinecap="round" /><path d="M7 12h10" strokeLinecap="round" /></svg>;
  }
  if (name === 'boxes') {
    return <svg {...props}><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" strokeLinejoin="round" /><path d="M12 12 3 7.5M12 12l9-4.5M12 12v9" /></svg>;
  }
  if (name === 'branches') {
    return <svg {...props}><path d="M4 20V9l8-5 8 5v11" strokeLinejoin="round" /><path d="M9 20v-6h6v6" /></svg>;
  }
  if (name === 'users') {
    return <svg {...props}><circle cx="9" cy="8" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" strokeLinecap="round" /><circle cx="17" cy="9" r="2.2" /><path d="M16.2 14.2A4.5 4.5 0 0 1 21 18.5" strokeLinecap="round" /></svg>;
  }
  if (name === 'receipt') {
    return <svg {...props}><path d="M7 3h10v18l-2.2-1.4L12 21l-2.8-1.4L7 21V3Z" strokeLinejoin="round" /><path d="M10 8h4M10 12h4" strokeLinecap="round" /></svg>;
  }
  if (name === 'chart') {
    return <svg {...props}><path d="M4 19V5M4 19h16" strokeLinecap="round" /><path d="M8 15v-4M12 15V8M16 15v-6" strokeLinecap="round" /></svg>;
  }
  return <svg {...props}><path d="M5 12.5 9.2 17 19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function SectionIntro({ eyebrow, title, text, id, level = 'h2' }) {
  const Heading = level;
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">{eyebrow}</p>}
      <Heading id={id} className={`${level === 'h1' ? 'text-4xl' : 'text-2xl sm:text-3xl'} mt-2 font-semibold tracking-tight text-content`}>{title}</Heading>
      {text && <p className="mt-3 text-sm leading-relaxed text-content-muted sm:text-base">{text}</p>}
    </div>
  );
}

function WindowChrome({ title, children }) {
  return (
    <div className="premium-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2.5">
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <span className="h-2 w-2 rounded-full bg-border-strong" />
        <p className="ml-2 truncate text-[11px] font-medium text-content-muted">{title}</p>
      </div>
      {children}
    </div>
  );
}

export function DashboardPreview() {
  const stats = [
    ['Products', '128', 'accent'],
    ['Categories', '14', 'success'],
    ['Low stock', '6', 'warning'],
    ['Today', '₹42.8k', 'accent'],
  ];
  return (
    <WindowChrome title="Owner dashboard · sample retail shop">
      <div className="grid grid-cols-[5.5rem_1fr] sm:grid-cols-[7.5rem_1fr]">
        <div className="space-y-1 bg-sidebar p-2 text-[10px] text-white/70">
          <p className="rounded-md bg-white/10 px-2 py-1.5 font-medium text-white">Dashboard</p>
          <p className="px-2 py-1.5">Billing</p>
          <p className="px-2 py-1.5">Inventory</p>
          <p className="px-2 py-1.5">Reports</p>
        </div>
        <div className="space-y-3 bg-canvas p-3">
          <div className="grid grid-cols-2 gap-2">
            {stats.map(([label, value, tone]) => (
              <div key={label} className="rounded-lg border border-border bg-surface p-2">
                <span className={`mb-1 inline-flex h-5 w-5 items-center justify-center rounded-md ${tone === 'success' ? 'bg-success-muted text-success' : tone === 'warning' ? 'bg-warning-muted text-warning' : 'bg-accent-muted text-accent'}`}>
                  <Icon name={tone === 'warning' ? 'boxes' : 'chart'} className="h-3 w-3" />
                </span>
                <p className="text-[10px] text-content-muted">{label}</p>
                <p className="text-sm font-semibold text-content">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex h-16 items-end gap-1.5 rounded-lg border border-border bg-surface px-3 py-2">
            {[40, 55, 48, 72, 64, 88, 70].map((height) => (
              <span key={height} className="flex-1 rounded-sm bg-accent/70" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </WindowChrome>
  );
}

export function BillingPreview() {
  return (
    <WindowChrome title="Billing · sample invoice">
      <div className="grid gap-3 bg-canvas p-3 sm:grid-cols-[1fr_9.5rem]">
        <div className="rounded-lg border border-border bg-surface p-3 text-xs">
          <div className="flex justify-between gap-3 border-b border-border pb-2">
            <span>Silk saree</span>
            <span className="tabular-nums">₹4,500</span>
          </div>
          <div className="flex justify-between gap-3 border-b border-border py-2">
            <span>Cotton shirt</span>
            <span className="tabular-nums">₹890</span>
          </div>
          <div className="mt-2 flex justify-between text-content-muted"><span>GST</span><span>₹270</span></div>
          <div className="mt-1 flex justify-between font-semibold text-content"><span>Total</span><span>₹5,660</span></div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-3 text-[11px]">
          <p className="font-medium text-content">Payment</p>
          <p className="mt-2 rounded-md bg-accent px-2 py-1 text-center font-medium text-content-inverse">Cash</p>
          <p className="mt-1 rounded-md bg-surface-muted px-2 py-1 text-center text-content-muted">UPI · simulated</p>
          <p className="mt-2 text-content-muted">No gateway charge</p>
        </div>
      </div>
    </WindowChrome>
  );
}

export function InventoryPreview() {
  const rows = [
    ['Silk saree', 'SKU-104', '18', 'In stock'],
    ['Rice 5 kg', 'GR-220', '4', 'Low'],
    ['Floor tile', 'TL-18', '42', 'In stock'],
  ];
  return (
    <WindowChrome title="Inventory · sample stock">
      <div className="bg-canvas p-3">
        <table className="w-full text-left text-xs">
          <thead className="text-content-muted">
            <tr>
              <th className="pb-2 font-medium">Product</th>
              <th className="pb-2 font-medium">SKU</th>
              <th className="pb-2 font-medium">Qty</th>
              <th className="pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, sku, qty, status]) => (
              <tr key={sku} className="border-t border-border">
                <td className="py-2 font-medium text-content">{name}</td>
                <td className="py-2 text-content-muted">{sku}</td>
                <td className="py-2 tabular-nums">{qty}</td>
                <td className="py-2">
                  <span className={`rounded-full px-2 py-0.5 ${status === 'Low' ? 'bg-warning-muted text-warning' : 'bg-success-muted text-success'}`}>{status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </WindowChrome>
  );
}

export function BranchPreview() {
  return (
    <WindowChrome title="Branches · sample day">
      <div className="grid gap-2 bg-canvas p-3 sm:grid-cols-2">
        {[
          ['Main Store', '₹28,400', '3 registers'],
          ['City Showroom', '₹14,400', '1 register'],
        ].map(([name, sales, meta]) => (
          <div key={name} className="rounded-lg border border-border bg-surface p-3">
            <p className="text-xs text-content-muted">{name}</p>
            <p className="mt-1 text-lg font-semibold text-content">{sales}</p>
            <p className="text-[11px] text-content-muted">{meta} · today</p>
          </div>
        ))}
      </div>
    </WindowChrome>
  );
}

export function AnalyticsPreview() {
  return (
    <WindowChrome title="Reports · sample month">
      <div className="bg-canvas p-3">
        <div className="flex h-24 items-end gap-2 rounded-lg border border-border bg-surface px-3 py-3">
          {[35, 50, 42, 68, 60, 84, 73, 90].map((height, index) => (
            <span key={index} className={`flex-1 rounded-sm ${index === 7 ? 'bg-accent' : 'bg-accent/35'}`} style={{ height: `${height}%` }} />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-content-muted">Figures in the live app come from that business’s own sales.</p>
      </div>
    </WindowChrome>
  );
}

const PREVIEWS = {
  dashboard: DashboardPreview,
  billing: BillingPreview,
  inventory: InventoryPreview,
  branches: BranchPreview,
  analytics: AnalyticsPreview,
};

export function ProductPreview({ kind }) {
  const Preview = PREVIEWS[kind] || DashboardPreview;
  return <Preview />;
}

export function FaqList({ items }) {
  return (
    <div className="premium-card divide-y divide-border">
      {items.map(([question, answer]) => (
        <details key={question} className="group p-4">
          <summary className="cursor-pointer list-none font-medium text-content outline-none focus-visible:ring-2 focus-visible:ring-accent/30 [&::-webkit-details-marker]:hidden">
            <span className="flex items-center justify-between gap-4">
              {question}
              <span className="text-content-muted transition group-open:rotate-45" aria-hidden>+</span>
            </span>
          </summary>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-content-muted">{answer}</p>
        </details>
      ))}
    </div>
  );
}

export function PlanCards({ plans }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => {
        const featured = plan.code === 'PROFESSIONAL';
        return (
          <article key={plan.code} className={`premium-card flex flex-col p-5 ${featured ? 'ring-2 ring-accent/30' : ''}`}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-content">{plan.name}</h3>
              {featured && <span className="rounded-full bg-accent-muted px-2 py-0.5 text-[10px] font-semibold text-accent">Multi-branch</span>}
            </div>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-content">{planPrice(plan.pricePaise)}</p>
            <p className="text-xs text-content-muted">{plan.pricePaise ? 'per month · illustrative demo price' : 'illustrative demo plan'}</p>
            <p className="mt-3 text-sm text-content-muted">{plan.description}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-content">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link to="/signup" className="mt-5 rounded-xl bg-accent px-3 py-2.5 text-center text-sm font-semibold text-content-inverse shadow-sm transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
              {planCta(plan)}
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export function PlanComparison({ plans }) {
  return (
    <>
      <div className="premium-card hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-muted text-content">
            <tr>
              <th className="px-4 py-3 font-medium">Included in the demo</th>
              {plans.map((plan) => <th key={plan.code} className="px-4 py-3 font-medium">{plan.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {LIMIT_ROWS.map(([key, label]) => (
              <tr key={key} className="border-t border-border">
                <th className="px-4 py-3 font-medium text-content-muted">{label}</th>
                {plans.map((plan) => (
                  <td key={plan.code} className="px-4 py-3 tabular-nums text-content">{plan.limits?.[key] ?? '—'}</td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-border">
              <th className="px-4 py-3 font-medium text-content-muted">Trial</th>
              {plans.map((plan) => (
                <td key={plan.code} className="px-4 py-3 text-content">{plan.trialDays ? `${plan.trialDays} days` : 'None'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 md:hidden">
        {plans.map((plan) => (
          <article key={plan.code} className="premium-card p-4">
            <h3 className="font-semibold">{plan.name}</h3>
            <dl className="mt-3 space-y-1 text-sm">
              {LIMIT_ROWS.map(([key, label]) => (
                <div key={key} className="flex justify-between gap-3">
                  <dt className="text-content-muted">{label}</dt>
                  <dd className="tabular-nums">{plan.limits?.[key] ?? '—'}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3">
                <dt className="text-content-muted">Trial</dt>
                <dd>{plan.trialDays ? `${plan.trialDays} days` : 'None'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
