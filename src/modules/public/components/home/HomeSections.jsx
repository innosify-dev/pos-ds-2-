import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Lightning-fast billing',
    copy: 'Search, scan, discount, and finish a bill at the counter. GST follows the product rate.',
    visual: 'billing',
  },
  {
    title: 'Smart inventory',
    copy: 'See what is on hand, what is low, and move stock with purchases, adjustments, and transfers.',
    visual: 'stock',
  },
  {
    title: 'Multi-branch control',
    copy: 'Registers and sales stay with the branch. The plan sets how many branches you can add.',
    visual: 'branch',
  },
  {
    title: 'Staff and role management',
    copy: 'Owners and admins run the business. Branch heads, cashiers, and inventory staff use their own logins.',
    visual: 'staff',
  },
  {
    title: 'Sales analytics',
    copy: 'Daily totals and product performance come from that business’s recorded sales.',
    visual: 'chart',
  },
  {
    title: 'Business branding',
    copy: 'Each business keeps its own name, logo, and accent. Opening another shop does not copy the brand.',
    visual: 'brand',
  },
];

function Mini({ kind }) {
  if (kind === 'billing') {
    return (
      <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
        <div className="flex justify-between"><span>Cotton saree</span><span>₹2,800</span></div>
        <div className="mt-2 flex justify-between font-semibold text-slate-900"><span>Sample total</span><span>₹2,940</span></div>
      </div>
    );
  }
  if (kind === 'stock') {
    return (
      <div className="mt-4 flex items-center gap-2 text-xs">
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">8 in stock</span>
        <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800">2 low</span>
      </div>
    );
  }
  if (kind === 'branch') {
    return (
      <div className="mt-4 flex gap-2 text-xs">
        <span className="rounded-full bg-indigo-600 px-2 py-1 font-semibold text-white">Main Store</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">City Showroom</span>
      </div>
    );
  }
  if (kind === 'staff') {
    return (
      <ul className="mt-4 space-y-1 text-xs text-slate-600">
        <li>Owner/Admin · business</li>
        <li>Branch Head · assigned branch</li>
        <li>Cashier · billing</li>
      </ul>
    );
  }
  if (kind === 'chart') {
    return (
      <div className="mt-4 flex h-12 items-end gap-1" aria-hidden>
        {[40, 70, 55, 85].map((height) => <span key={height} className="flex-1 rounded-t bg-indigo-500" style={{ height: `${height}%` }} />)}
      </div>
    );
  }
  return (
    <div className="mt-4 flex items-center gap-2">
      <span className="h-8 w-8 rounded-lg bg-indigo-600" />
      <span className="h-8 w-8 rounded-lg bg-emerald-600" />
      <span className="text-xs text-slate-500">Accent per business</span>
    </div>
  );
}

const nodes = [
  ['One Owner/Admin login', 'The same account can own more than one business. There is no separate multi-business login.'],
  ['Multiple businesses', 'Each business keeps its own subscription, catalog, staff, and sales.'],
  ['Multiple branches', 'Branches and registers belong to that business, within the plan limits.'],
  ['Role-based staff', 'Branch Head, Cashier, and Inventory Staff sign in separately and see their own work.'],
];

const trust = [
  ['India-first retail', 'INR billing, GST on the product, and a GSTIN on the receipt are part of the retail demo.'],
  ['Business-level isolation', 'Catalogs, staff, and sales stay inside the business you opened. They do not mix with another shop.'],
  ['Role-based access', 'A cashier reaches billing. Inventory staff reach products. Subscription settings stay with the people who manage the business.'],
  ['Connected operations', 'Billing, stock, branches, and reports read the same business. Payments in the demo are simulated.'],
  ['Straightforward onboarding', 'Creating an account continues into business setup. The shop and plan are chosen there, not on the signup form.'],
];

export function FeatureBento() {
  return (
    <section className="bg-surface py-20" aria-labelledby="features-title">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Capabilities</p>
        <h2 id="features-title" className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-content">What the retail workspace already does</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-border bg-canvas p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
              <h3 className="text-lg font-semibold text-content">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">{feature.copy}</p>
              <Mini kind={feature.visual} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AccessModel() {
  return (
    <section className="bg-canvas py-20" aria-labelledby="access-title">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Access</p>
        <h2 id="access-title" className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-content">One owner account. Separate businesses. Separate roles.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-content-muted">
          Platform Super Admin signs in only on the private platform page. Customer shops never use that login.
        </p>
        <ol className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {nodes.map(([title, copy], index) => (
            <li key={title} className="relative rounded-3xl border border-border bg-surface p-5">
              <span className="text-xs font-semibold text-accent">0{index + 1}</span>
              <h3 className="mt-2 font-semibold text-content">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-content-muted">{copy}</p>
              {index < nodes.length - 1 && <span className="absolute -right-3 top-1/2 hidden h-px w-6 bg-indigo-300 lg:block" aria-hidden />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function TrustBand() {
  return (
    <section className="bg-[#070b14] py-20 text-white" aria-labelledby="trust-title">
      <div className="mx-auto max-w-6xl px-4">
        <h2 id="trust-title" className="max-w-2xl text-3xl font-semibold tracking-tight">A retail platform with clear boundaries</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trust.map(([title, copy]) => (
            <article key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{copy}</p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-xs text-slate-400">
          Figures inside the product scenes are sample data. This page does not publish customer counts, certifications, or payment partnerships.
          <Link to="/pricing" className="ml-2 font-semibold text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">View illustrative pricing</Link>
        </p>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="px-4 py-16" aria-labelledby="cta-title">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#111827] px-6 py-14 text-white sm:px-12">
        <div className="pointer-events-none absolute -left-10 top-0 h-48 w-48 rounded-full bg-indigo-500/40" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-400/20" aria-hidden />
        <div className="relative max-w-2xl">
          <h2 id="cta-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">Your next chapter of retail starts here.</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-300">Bring your billing, inventory, teams, and branches together with Innosify POS.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/signup" className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Start Free Trial</Link>
            <Link to="/features" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Explore Features</Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">Signup does not charge a card. Plans and trials are chosen during business setup and are illustrative in this demo.</p>
        </div>
      </div>
    </section>
  );
}
