import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
];

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/accept-invitation'];

function BrandLink() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-xs font-semibold text-content-inverse">IP</span>
      Innosify POS
    </Link>
  );
}

export function PublicLayout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (AUTH_PATHS.includes(pathname)) {
    return <div className="min-h-screen bg-canvas text-content"><Outlet /></div>;
  }

  return (
    <div className="min-h-screen overflow-x-clip bg-canvas text-content">
      <a href="#public-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2 focus:shadow">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
          <BrandLink />
          <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Primary">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `rounded-lg px-3 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 ${isActive ? 'font-medium text-accent' : 'text-content-muted hover:bg-surface-muted hover:text-content'}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-medium text-content transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30">Login</Link>
            <Link to="/signup" className="rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-content-inverse shadow-sm transition hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">Get Started</Link>
          </div>
          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 md:hidden"
            aria-expanded={open}
            aria-controls="public-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              {open ? <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" /> : <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
        {open && (
          <nav id="public-menu" className="border-t border-border bg-surface px-4 py-3 md:hidden" aria-label="Mobile">
            <div className="mx-auto flex max-w-6xl flex-col gap-1">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-accent-muted font-medium text-accent' : 'text-content'}`}>
                  {link.label}
                </NavLink>
              ))}
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium">Login</Link>
              <Link to="/signup" className="mt-1 rounded-xl bg-accent px-3 py-2.5 text-center text-sm font-semibold text-content-inverse">Get Started</Link>
            </div>
          </nav>
        )}
      </header>
      <Outlet />
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BrandLink />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-content-muted">Retail point of sale for billing, stock, staff, and branches. Prices and payments shown in this demo are illustrative.</p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <Link to="/" className="text-content-muted hover:text-content">Home</Link>
            <Link to="/features" className="text-content-muted hover:text-content">Features</Link>
            <Link to="/pricing" className="text-content-muted hover:text-content">Pricing</Link>
            <Link to="/login" className="text-content-muted hover:text-content">Login</Link>
            <Link to="/signup" className="text-content-muted hover:text-content">Sign Up</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
