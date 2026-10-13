import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FeatureStage } from '@modules/public/components/marketing/FeatureStage.jsx';
import '@assets/styles/home.css';
import '@assets/styles/marketing.css';

const tabs = [
  { id: 'billing', label: 'Billing' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'branches', label: 'Branches' },
  { id: 'staff', label: 'Staff' },
  { id: 'analytics', label: 'Analytics' },
];

const stories = [
  {
    id: 'billing',
    kicker: 'Smart POS billing',
    title: 'Bill in seconds at the counter',
    copy: 'Search or scan, build the cart, apply a discount, and show GST from the product rate. Cash, card, UPI, and split amounts are recorded as simulated payments.',
    aside: 'A certified hardware scanner and a live payment gateway are not part of this demo.',
    kind: 'billing',
  },
  {
    id: 'inventory',
    kicker: 'Inventory management',
    title: 'See what is on the shelf',
    copy: 'Products, categories, and brands stay with the business. Sales, purchases, adjustments, and transfers explain the stock balance, including low-stock alerts.',
    aside: 'Automatic purchase orders are not included.',
    kind: 'inventory',
  },
  {
    id: 'branches',
    kicker: 'Multi-branch management',
    title: 'One business, more than one counter',
    copy: 'Switch the branch and the registers and sales follow that location. How many branches you can add depends on the plan chosen in setup.',
    aside: 'A separate warehouse module is not live.',
    kind: 'branches',
  },
  {
    id: 'staff',
    kicker: 'Employee and role management',
    title: 'Each person signs in to their own work',
    copy: 'Owner/Admin runs the business. A Branch Head sees the assigned branch. A Cashier opens billing. Inventory Staff opens products. There is no separate multi-business login.',
    aside: 'Biometric clock-in and payroll are not included.',
    kind: 'staff',
  },
  {
    id: 'reports',
    kicker: 'Sales and reports',
    title: 'Read the shop from its own sales',
    copy: 'Dashboard totals and charts summarize transactions already stored for that business. They are not a filing-ready GST return.',
    aside: 'AI-written insights are not available.',
    kind: 'analytics',
  },
  {
    id: 'brand',
    kicker: 'Business branding',
    title: 'A name, logo, and accent for each shop',
    copy: 'The workspace follows the business you opened. Another business on the same owner account keeps its own brand.',
    aside: 'Card billing for the subscription itself is not connected.',
    kind: 'brand',
  },
];

const benefits = [
  ['Faster daily billing', 'Find the item, total the bill, and record a simulated payment without leaving the counter.'],
  ['Better stock visibility', 'Quantities and low-stock notices stay with the products of that business.'],
  ['Organized employee access', 'Cashiers, branch heads, and inventory staff do not share the owner’s screens.'],
  ['Multi-branch operations', 'Registers and sales stay with the branch, inside the plan’s limits.'],
  ['Connected business insights', 'Reports read the same sales the counter already recorded.'],
  ['Simplified retail management', 'Catalog, staff, branches, and brand live in one retail workspace.'],
];

function useReveal() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-mkt-reveal]')];
    if (!nodes.length) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-in');
      });
    }, { threshold: 0.2 });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}

export function FeaturesScreen() {
  const [tab, setTab] = useState('billing');
  useReveal();
  const active = tabs.find((item) => item.id === tab) || tabs[0];

  const onTabsKey = (event) => {
    const index = tabs.findIndex((item) => item.id === tab);
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setTab(tabs[(index + 1) % tabs.length].id);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setTab(tabs[(index - 1 + tabs.length) % tabs.length].id);
    }
  };

  return (
    <main id="public-content">
      <section className="home-hero relative overflow-hidden text-white" aria-labelledby="features-hero">
        <div className="home-beam" aria-hidden />
        <div className="home-beam home-beam-b" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">Features</p>
            <h1 id="features-hero" className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
              Everything your retail business needs.
              <span className="mt-1 block"><span className="home-sheen">One powerful platform.</span></span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300">
              From billing counters to business insights, Innosify POS brings your daily retail operations together.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/signup" className="rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">Start Free Trial</Link>
              <Link to="/pricing" className="rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">View Pricing</Link>
            </div>
          </div>
          <FeatureStage kind="billing" />
        </div>
      </section>

      <section className="bg-canvas py-16" aria-labelledby="demo-title">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="demo-title" className="text-3xl font-semibold tracking-tight text-content">Look through the workspace</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-content-muted">These previews use sample figures. Switching a tab does not change a shop’s sales or stock.</p>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Product previews" onKeyDown={onTabsKey}>
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`feature-tab-${item.id}`}
                aria-selected={item.id === tab}
                aria-controls="feature-preview"
                tabIndex={item.id === tab ? 0 : -1}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${item.id === tab ? 'bg-accent text-content-inverse' : 'border border-border bg-surface text-content'}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div id="feature-preview" role="tabpanel" aria-labelledby={`feature-tab-${active.id}`} className="mt-6">
            <FeatureStage kind={active.id} />
          </div>
        </div>
      </section>

      <div className="bg-[#070b14] py-8 text-white">
        {stories.map((story, index) => (
          <section key={story.id} id={story.id} className="scroll-mt-24" aria-labelledby={`${story.id}-title`}>
            <div data-mkt-reveal className={`mkt-reveal mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 lg:grid-cols-2 ${index % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">{story.kicker}</p>
                <h2 id={`${story.id}-title`} className="mt-2 text-3xl font-semibold tracking-tight">{story.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{story.copy}</p>
                <p className="mt-4 text-xs text-slate-400">Not live yet: {story.aside}</p>
              </div>
              <FeatureStage kind={story.kind} />
            </div>
          </section>
        ))}
      </div>

      <section className="bg-canvas py-16" aria-labelledby="benefits-title">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="benefits-title" className="text-3xl font-semibold tracking-tight text-content">What changes on the shop floor</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map(([title, copy]) => (
              <article key={title} className="rounded-3xl border border-border bg-surface p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md motion-reduce:transform-none">
                <h3 className="font-semibold text-content">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-content-muted">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
