import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion.js';

const STEPS = [
  'The cashier selects a product.',
  'The product appears in the cart.',
  'Quantity and the total update.',
  'Checkout starts.',
  'A sample transaction succeeds.',
  'The counter resets for the next demonstration.',
];

const PRICE = 2800;

export function PosDemo() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(!reduced);

  useEffect(() => {
    setPlaying(!reduced);
  }, [reduced]);

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % STEPS.length);
    }, 1600);
    return () => window.clearInterval(timer);
  }, [playing]);

  const qty = step >= 2 && step < 5 ? 2 : step >= 1 && step < 5 ? 1 : 0;
  const inCart = qty > 0;
  const checkingOut = step === 3;
  const success = step === 4;
  const gst = Math.round(PRICE * qty * 0.05);
  const total = PRICE * qty + gst;

  return (
    <section className="bg-canvas py-20" aria-labelledby="pos-demo-title">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Illustrative demo</p>
          <h2 id="pos-demo-title" className="mt-2 text-3xl font-semibold tracking-tight text-content sm:text-4xl">See Innosify POS in action.</h2>
          <p className="mt-3 text-sm leading-relaxed text-content-muted">
            This counter is a sample animation. It does not charge a card, open a payment gateway, or change a business’s sales.
          </p>
          <p className="mt-4 text-sm font-medium text-content" aria-live="polite">{STEPS[step]}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" className="rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-content-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => setPlaying(true)} aria-pressed={playing}>Play</button>
            <button type="button" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => setPlaying(false)} aria-pressed={!playing}>Pause</button>
            <button type="button" className="rounded-xl border border-border bg-surface px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => { setStep(0); setPlaying(true); }}>Replay</button>
          </div>
        </div>
        <div className="rounded-[28px] bg-[#111827] p-4 text-white shadow-xl sm:p-6">
          <div className="mb-4 flex items-center justify-between text-xs text-white/70">
            <span>Sample counter · Main Store</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5">Illustrative demo</span>
          </div>
          <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
            <button
              type="button"
              className={`rounded-2xl p-4 text-left transition ${step === 0 ? 'bg-indigo-500' : 'bg-white/10'}`}
              onClick={() => { setPlaying(false); setStep(1); }}
            >
              <p className="text-sm font-semibold">Cotton saree</p>
              <p className="mt-1 text-xs text-white/70">SKU COT00901 · ₹2,800</p>
            </button>
            <div className="rounded-2xl bg-white p-4 text-slate-900">
              <p className="text-sm font-semibold">Cart</p>
              {inCart ? (
                <div className="home-pop mt-3 flex items-center justify-between text-sm">
                  <span>Cotton saree × {qty}</span>
                  <span>₹{(PRICE * qty).toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Cart is empty</p>
              )}
              <div className="mt-4 border-t border-slate-100 pt-3 text-sm">
                <p className="text-slate-500">GST 5% sample · ₹{gst.toLocaleString('en-IN')}</p>
                <p className="mt-1 text-lg font-semibold">₹{total.toLocaleString('en-IN')}</p>
              </div>
              <div className={`mt-3 rounded-xl px-3 py-2 text-center text-sm font-semibold ${success ? 'bg-emerald-600 text-white' : checkingOut ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {success ? 'Sale completed · sample' : checkingOut ? 'Checkout' : 'Ready'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
