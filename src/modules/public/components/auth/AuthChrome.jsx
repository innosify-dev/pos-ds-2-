import { Link } from 'react-router-dom';
import { Input } from '@shared/ui/Input';
import { googleAuthStatus, beginGoogleSignIn } from '@services/auth/google.js';
import '@assets/styles/auth.css';

function EyeIcon({ off }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
      {off ? (
        <>
          <path d="M3 3l18 18" strokeLinecap="round" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.5 0 9.5 4.2 10.5 7-0.4 1.1-1.2 2.4-2.3 3.6M6.1 6.1C4.2 7.4 2.8 9.2 1.5 12c1 2.8 5 7 10.5 7 1.6 0 3-.3 4.3-.9" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function Brand({ compact }) {
  return (
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
      <span className={`flex items-center justify-center rounded-xl bg-accent font-semibold text-content-inverse ${compact ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-xs'}`}>IP</span>
      Innosify POS
    </Link>
  );
}

export function FormErrorMessage({ children }) {
  if (!children) return null;
  return <p className="text-sm text-danger" role="alert">{children}</p>;
}

export function PasswordInput({ label, shown, onToggle, ...props }) {
  return (
    <Input
      label={label}
      type={shown ? 'text' : 'password'}
      trailing={(
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center text-content-muted transition hover:text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          aria-label={shown ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          onClick={onToggle}
        >
          <EyeIcon off={shown} />
        </button>
      )}
      {...props}
    />
  );
}

export function GoogleAuthButton() {
  const status = googleAuthStatus();
  return (
    <div>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={status.message}
        onClick={() => beginGoogleSignIn()}
        className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-content opacity-70 shadow-sm"
      >
        <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden>
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.98 10.72A5.4 5.4 0 0 1 3.7 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.02-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
        </svg>
        Continue with Google
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-content-muted">Coming soon</span>
      </button>
      <p className="mt-2 text-center text-xs text-content-muted">{status.message}</p>
    </div>
  );
}

export function AuthProductShowcase() {
  const bars = [46, 72, 58, 86, 64];
  return (
    <aside className="auth-stage relative hidden overflow-hidden text-white md:flex md:flex-col md:justify-between md:p-8 lg:p-12" aria-hidden>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">Innosify POS</p>
        <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight lg:text-4xl">Billing, stock, and every branch in one view.</h2>
      </div>
      <div className="relative mt-8">
        <div className="rounded-3xl border border-white/10 bg-white p-4 text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold">Dashboard</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">Sample</span>
          </div>
          <div className="mt-4 flex h-24 items-end gap-2">
            {bars.map((height, index) => (
              <div key={index} className="auth-bar flex-1 rounded-t bg-indigo-500" style={{ height: `${height}%`, animationDelay: `${index * 0.08}s` }} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-slate-500">
            <p><span className="block text-sm font-semibold text-slate-900">₹28,400</span>Today</p>
            <p><span className="block text-sm font-semibold text-slate-900">2</span>Branches</p>
            <p><span className="block text-sm font-semibold text-slate-900">6</span>Low stock</p>
          </div>
        </div>
        <div className="auth-float absolute -left-4 bottom-8 hidden rounded-2xl border border-white/15 bg-[#111827]/85 px-3 py-2 text-xs shadow-lg backdrop-blur lg:block">
          <p className="text-white/60">Main Store</p>
          <p className="font-semibold">Sale completed</p>
        </div>
        <div className="auth-float absolute -right-2 -top-4 hidden rounded-2xl bg-white px-3 py-2 text-xs text-slate-900 shadow-lg lg:block" style={{ animationDelay: '-2s' }}>
          <p className="text-slate-500">Inventory</p>
          <p className="font-semibold">Organza · low</p>
        </div>
      </div>
      <p className="mt-6 text-xs text-slate-400">Figures on this panel are samples. Payments in the product are simulated.</p>
    </aside>
  );
}

export function AuthLayout({ title, subtitle, children, variant, aside }) {
  if (variant === 'login') {
    return (
      <div className="min-h-screen bg-white lg:fixed lg:inset-0 lg:grid lg:grid-cols-[minmax(0,54%)_minmax(0,46%)] lg:overflow-hidden">
        {aside}
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:px-10 lg:py-5">
          <Brand compact />
          <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-6 lg:py-3">
            <h1 className="text-3xl font-semibold tracking-tight text-content">{title}</h1>
            <p className="mt-1.5 text-sm leading-relaxed text-content-muted">{subtitle}</p>
            <div className="mt-5">{children}</div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 grid overflow-hidden bg-canvas md:grid-cols-2">
      <section className="flex h-full flex-col overflow-y-auto px-5 py-8 sm:px-10">
        <Brand compact />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <h1 className="text-3xl font-semibold tracking-tight text-content">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-content-muted">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </section>
      <AuthProductShowcase />
    </div>
  );
}
