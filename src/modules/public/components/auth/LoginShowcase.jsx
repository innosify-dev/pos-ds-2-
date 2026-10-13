import billing from '@assets/images/home/home-billing.jpg';

const lines = [
  ['Kanjivaram saree', '× 1', '₹4,200'],
  ['Cotton saree', '× 1', '₹2,800'],
];

export function LoginShowcase() {
  return (
    <aside className="login-stage relative hidden min-h-0 overflow-hidden text-white lg:block" aria-hidden>
      <img src={billing} alt="" className="login-photo absolute inset-0 h-full w-full object-cover object-[center_30%]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b14]/55 via-[#070b14]/45 to-[#070b14]/88" />
      <div className="login-glow" aria-hidden />
      <div className="relative flex h-full flex-col justify-between gap-6 p-8 xl:p-10">
        <div className="max-w-md">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-100">Innosify POS</p>
          <h2 className="mt-3 text-3xl font-semibold leading-[1.12] tracking-tight xl:text-4xl">
            Your entire retail business.
            <span className="mt-1 block">One connected platform.</span>
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-200">
            Billing, inventory, branches, and business insights — beautifully connected.
          </p>
        </div>

        <div className="login-card relative mx-auto w-full max-w-md rounded-3xl border border-white/25 bg-[#0b1220]/55 p-4 shadow-[0_24px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Checkout</p>
              <p className="text-[11px] text-indigo-100">Main Store · sample</p>
            </div>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-100">Illustrative</span>
          </div>
          <div className="login-scan-track mt-3" aria-hidden>
            <span className="login-scan" />
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {lines.map(([name, qty, price]) => (
              <li key={name} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl bg-white/10 px-3 py-2">
                <span>{name}</span>
                <span className="text-white/70">{qty}</span>
                <span className="font-medium tabular-nums">{price}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t border-white/15 pt-3 text-xs text-slate-200">
            <p className="flex justify-between"><span>GST 5% · sample</span><span className="tabular-nums">₹350</span></p>
            <p className="flex justify-between text-sm font-semibold text-white"><span>Total</span><span className="tabular-nums">₹7,350</span></p>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="login-confirm inline-flex rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white">Sale recorded · sample</p>
            <p className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-slate-100">Organza · 2 left</p>
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-slate-300">Illustrative demo data. This preview does not process a payment.</p>
      </div>
    </aside>
  );
}
