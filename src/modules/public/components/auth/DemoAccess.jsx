import { demoMode } from '@services/demo';

const ROLES = [
  {
    id: 'owner',
    scope: 'tenant',
    email: 'owner@demo.takshi.test',
    tenantId: 't-takshi',
    name: 'Owner / Admin',
    description: 'Takshi Silks. Both branches, catalog, team, and reports.',
    icon: 'store',
  },
  {
    id: 'manager',
    scope: 'tenant',
    email: 'manager@demo.takshi.test',
    tenantId: 't-takshi',
    name: 'Branch Head / Manager',
    description: 'Main Store only. Billing and branch operations.',
    icon: 'branch',
  },
  {
    id: 'cashier',
    scope: 'tenant',
    email: 'cashier@demo.takshi.test',
    tenantId: 't-takshi',
    name: 'Cashier',
    description: 'Billing, sales, and customers for Main Store.',
    icon: 'till',
  },
  {
    id: 'inventory',
    scope: 'tenant',
    email: 'inventory@demo.takshi.test',
    tenantId: 't-takshi',
    name: 'Inventory Staff',
    description: 'Products and stock for Main Store. No billing.',
    icon: 'box',
  },
];

const PLATFORM = {
  id: 'platform',
  scope: 'platform',
  email: 'superadmin@demo.innosify.test',
  name: 'Platform Super Admin',
  description: 'Separate platform session. Demo businesses and subscriptions.',
  icon: 'shield',
};

function Icon({ name }) {
  const common = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true };
  if (name === 'shield') {
    return <svg {...common}><path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-3Z" /></svg>;
  }
  if (name === 'branch') {
    return <svg {...common}><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /></svg>;
  }
  if (name === 'till') {
    return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 10h4M7 14h10" /></svg>;
  }
  if (name === 'box') {
    return <svg {...common}><path d="M3 8 12 4l9 4-9 4-9-4Z" /><path d="M3 8v8l9 4 9-4V8" /><path d="M12 12v8" /></svg>;
  }
  return <svg {...common}><path d="M4 10h16v9H4z" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}

function Card({ role, pending, onExplore }) {
  return (
    <li>
      <button
        type="button"
        disabled={pending}
        onClick={() => onExplore(role)}
        className="flex w-full items-center gap-3 rounded-xl border border-border bg-canvas px-3 py-2 text-left transition hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
          <Icon name={role.icon} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-content">{role.name}</span>
          <span className="block text-[11px] leading-snug text-content-muted">{role.description}</span>
        </span>
        <span className="shrink-0 text-[11px] font-semibold text-accent">Explore Demo</span>
      </button>
    </li>
  );
}

export function DemoAccess({ pending, onExplore }) {
  if (!demoMode) return null;
  return (
    <section className="mt-4 border-t border-border pt-4" aria-label="Explore Innosify POS — Demo Access">
      <h2 className="text-sm font-semibold text-content">Explore Innosify POS — Demo Access</h2>
      <p className="mt-1 text-[11px] leading-relaxed text-content-muted">
        Opens a labeled demo session in this browser. Sample figures are not live shop data. Payments stay simulated.
      </p>
      <ul className="mt-3 space-y-2">
        {ROLES.map((role) => <Card key={role.id} role={role} pending={pending} onExplore={onExplore} />)}
      </ul>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-content-muted">Platform portal</p>
      <ul className="mt-2">
        <Card role={PLATFORM} pending={pending} onExplore={onExplore} />
      </ul>
    </section>
  );
}
