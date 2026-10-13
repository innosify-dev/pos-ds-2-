import { Link } from 'react-router-dom';
import { useDemo } from '@services/demo';
import { FaqList, Icon, planCta, planPrice } from '@modules/public/components/PublicMarketing.jsx';
import '@assets/styles/home.css';
import '@assets/styles/marketing.css';

const LIMIT_ROWS = [
  ['branches', 'Branches'],
  ['registers', 'Registers'],
  ['users', 'Users'],
  ['transactionsPerMonth', 'Transactions / month'],
];

const faqs = [
  ['How does the free trial work?', 'Create an account and continue into business setup. A plan that includes trial days starts that trial there. The Free plan has no trial. Nothing on this site charges a card.'],
  ['Can I manage multiple branches?', 'Yes, up to the branch limit of the plan you select in setup. Sales and registers stay with that business.'],
  ['Can I add employees?', 'Owners and admins can add staff with their own logins. Branch heads, cashiers, and inventory staff see the work their role allows.'],
  ['Can I upgrade a subscription?', 'Plan changes are available on the business subscription screen. In this demo the change is simulated and does not bill a payment method.'],
  ['What billing cycle is configured?', 'Every plan in the demo catalog is monthly. A yearly price is not configured, so this page does not offer a yearly toggle or a savings figure.'],
  ['Are subscription payments collected?', 'No. Prices are illustrative. A payment gateway for the subscription is not connected.'],
];

function intervalLabel(plan) {
  if (plan.interval === 'MONTHLY') return plan.pricePaise ? 'per month' : 'no monthly charge';
  return plan.interval || 'billing cycle not set';
}

function countLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function PricingScreen() {
  const { state } = useDemo();
  const plans = state.plans.filter((plan) => plan.active);
  const yearly = plans.some((plan) => plan.interval && plan.interval !== 'MONTHLY');

  return (
    <main id="public-content">
      <section className="home-hero relative overflow-hidden text-white" aria-labelledby="pricing-heading">
        <div className="home-beam" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-16 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">Pricing</p>
          <h1 id="pricing-heading" className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            Simple pricing.
            <span className="mt-1 block"><span className="home-sheen">Built for businesses that grow.</span></span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300">
            Start with the right plan for your retail business and scale as your operations expand.
          </p>
          <p className="mt-4 max-w-2xl text-sm text-slate-400">
            Amounts, trials, and limits come from the demo plan list. They are illustrative and are not a card charge. Signup continues into business setup, where the plan is chosen.
            {yearly ? '' : ' Yearly billing is not configured.'}
          </p>
        </div>
      </section>

      <section className="bg-canvas py-16" aria-labelledby="plans-title">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="plans-title" className="text-2xl font-semibold tracking-tight text-content">Demo plans</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article key={plan.code} className="flex flex-col rounded-3xl border border-border bg-surface p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-content">{plan.name}</h3>
                <p className="mt-4 text-3xl font-semibold tracking-tight text-content">{planPrice(plan.pricePaise)}</p>
                <p className="text-xs text-content-muted">{intervalLabel(plan)} · illustrative</p>
                <p className="mt-3 text-sm text-content-muted">{plan.description}</p>
                <p className="mt-3 text-xs font-medium text-content">{plan.trialDays ? `${plan.trialDays}-day trial during setup` : 'No trial period'}</p>
                <p className="mt-2 text-xs text-content-muted">
                  {countLabel(plan.limits.branches, 'branch', 'branches')} · {countLabel(plan.limits.registers, 'register', 'registers')} · {countLabel(plan.limits.users, 'user', 'users')}
                </p>
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
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-16" aria-labelledby="compare-title">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="compare-title" className="text-2xl font-semibold tracking-tight text-content">What each plan allows</h2>
          <p className="mt-2 max-w-2xl text-sm text-content-muted">These rows are the limits stored on the plan. The app blocks a new branch, register, or user when that limit is full.</p>
          <div className="mt-6 overflow-x-auto rounded-3xl border border-border">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-canvas text-content">
                <tr>
                  <th className="px-4 py-3 font-medium">Included</th>
                  {plans.map((plan) => <th key={plan.code} className="px-4 py-3 font-medium">{plan.name}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <th className="px-4 py-3 font-medium text-content-muted">Price</th>
                  {plans.map((plan) => <td key={plan.code} className="px-4 py-3 text-content">{planPrice(plan.pricePaise)}</td>)}
                </tr>
                <tr className="border-t border-border">
                  <th className="px-4 py-3 font-medium text-content-muted">Billing cycle</th>
                  {plans.map((plan) => <td key={plan.code} className="px-4 py-3 text-content">{plan.interval === 'MONTHLY' ? 'Monthly' : plan.interval}</td>)}
                </tr>
                {LIMIT_ROWS.map(([key, label]) => (
                  <tr key={key} className="border-t border-border">
                    <th className="px-4 py-3 font-medium text-content-muted">{label}</th>
                    {plans.map((plan) => <td key={plan.code} className="px-4 py-3 tabular-nums text-content">{plan.limits?.[key] ?? '—'}</td>)}
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <th className="px-4 py-3 font-medium text-content-muted">Trial</th>
                  {plans.map((plan) => <td key={plan.code} className="px-4 py-3 text-content">{plan.trialDays ? `${plan.trialDays} days` : 'None'}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-content-muted md:hidden">Swipe sideways to see every plan. The page itself does not scroll sideways.</p>
        </div>
      </section>

      <section className="bg-canvas py-16" aria-labelledby="pricing-faq">
        <div className="mx-auto max-w-6xl px-4">
          <h2 id="pricing-faq" className="text-2xl font-semibold tracking-tight text-content">Questions about plans</h2>
          <div className="mt-6">
            <FaqList items={faqs} />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-[#111827] px-6 py-12 text-white sm:px-10">
          <h2 className="text-3xl font-semibold tracking-tight">Choose a plan during setup.</h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">Create an account. Business onboarding is the next step, including the plan you want to try.</p>
          <Link to="/signup" className="mt-6 inline-flex rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">Start Free Trial</Link>
        </div>
      </section>
    </main>
  );
}
