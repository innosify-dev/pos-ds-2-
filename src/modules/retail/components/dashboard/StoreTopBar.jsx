import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountMenu } from '@core/auth/AccountMenu.jsx';
import { useShell } from '@core/layout/ShellContext.jsx';

const SCREEN_LINKS = [
  ['Dashboard', '/retail/dashboard', 'dashboard.view'],
  ['Counter', '/retail/counter', 'pos.use', ['CASHIER']],
  ['Billing', '/retail/pos', 'pos.use'],
  ['Stock desk', '/retail/stockroom', 'inventory.manage', ['INVENTORY_STAFF']],
  ['Products', '/retail/products', 'products.view'],
  ['Categories', '/retail/categories', 'products.view'],
  ['Brands', '/retail/brands', 'products.view'],
  ['Stock', '/retail/inventory', 'inventory.manage'],
  ['Purchases', '/retail/purchases', 'purchases.manage'],
  ['Suppliers', '/retail/suppliers', 'purchases.manage'],
  ['Sales', '/retail/sales', 'sales.view'],
  ['Returns', '/retail/returns', 'returns.create'],
  ['Refunds', '/retail/refunds', 'refunds.manage'],
  ['Customers', '/retail/customers', 'customers.view'],
  ['Branches', '/retail/branches', 'branches.view'],
  ['Registers', '/retail/registers', 'registers.manage'],
  ['Team', '/retail/team', 'team.view'],
  ['Reports', '/retail/analytics', 'analytics.view'],
  ['Subscription', '/retail/subscription', 'subscription.view'],
  ['Settings', '/retail/settings', 'settings.manage'],
];

/**
 * Retail top bar. Find a screen lists only routes this role can open.
 * Notifications list only real alerts passed in by the layout.
 */
export function StoreTopBar({
  title,
  can = () => false,
  role,
  dateLabel,
  storeName,
  user,
  roleLabel,
  businessName,
  branchName,
  notificationCount,
  notificationNote,
  notifications = [],
  branches = [],
  branchId,
  onBranch,
  onLogout,
}) {
  const { openMobile } = useShell();
  const navigate = useNavigate();
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const quickRef = useRef(null);
  const quickId = useId();
  const [notesOpen, setNotesOpen] = useState(false);
  const notesRef = useRef(null);
  const notesId = useId();
  const query = quickQuery.trim().toLowerCase();
  const destinations = useMemo(
    () => SCREEN_LINKS.filter(([name, path, permission, roles]) => {
      if (roles && !roles.includes(role)) return false;
      if (!can(permission)) return false;
      return !query || `${name} ${path}`.toLowerCase().includes(query);
    }),
    [can, query, role],
  );

  const goTo = (path) => {
    setQuickOpen(false);
    setQuickQuery('');
    navigate(path);
  };

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setQuickOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!quickOpen) return undefined;
    const onPointer = (event) => {
      if (!quickRef.current?.contains(event.target)) setQuickOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setQuickOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [quickOpen]);

  useEffect(() => {
    if (!notesOpen) return undefined;
    const onPointer = (event) => {
      if (!notesRef.current?.contains(event.target)) setNotesOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') setNotesOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [notesOpen]);

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-border/80 bg-surface/90 px-3 py-2 shadow-sm backdrop-blur-xl sm:px-4">
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-content md:hidden"
        aria-label="Open navigation"
        onClick={openMobile}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold tracking-tight text-content">{title}</h1>
        <p className="hidden text-[11px] text-content-muted sm:block">{dateLabel}</p>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div ref={quickRef} className="relative">
          <button
            type="button"
            aria-expanded={quickOpen}
            aria-controls={quickId}
            aria-label="Find a screen"
            onClick={() => setQuickOpen((open) => !open)}
            className="flex h-9 items-center gap-2 rounded-xl border border-border bg-surface-muted/70 px-2.5 text-xs text-content-muted hover:text-content focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="hidden lg:inline">Find a screen</span>
            <span className="hidden text-[10px] lg:inline">Ctrl K</span>
          </button>
          {quickOpen && (
            <div id={quickId} role="dialog" aria-label="Find a screen" className="absolute right-0 z-40 mt-2 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-border bg-surface p-2 shadow-xl">
              <input
                autoFocus
                value={quickQuery}
                onChange={(event) => setQuickQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setQuickOpen(false);
                  if (event.key === 'Enter' && destinations[0]) goTo(destinations[0][1]);
                }}
                aria-label="Find a screen"
                placeholder="Search pages"
                className="w-full rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm text-content outline-none focus:border-accent"
              />
              <div className="mt-2 max-h-72 overflow-y-auto">
                {destinations.length === 0 ? (
                  <p className="p-3 text-xs text-content-muted">No accessible screens found.</p>
                ) : destinations.map(([name, path]) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => goTo(path)}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-content hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={notesRef} className="relative">
          <button
            type="button"
            aria-label={notificationCount > 0 ? `${notificationCount} notification` : 'Notifications'}
            aria-expanded={notesOpen}
            aria-controls={notesId}
            className="relative rounded-xl border border-border bg-surface p-2 text-content-muted transition hover:text-content"
            onClick={() => setNotesOpen((open) => !open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
              <path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-content-inverse">
                {notificationCount}
              </span>
            )}
          </button>
          {notesOpen && (
            <div id={notesId} role="region" aria-label="Notifications" className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-border bg-surface p-3 text-sm shadow-lg">
              {notificationNote && <p className="mb-2 text-content">{notificationNote}</p>}
              {notifications.length === 0 && !notificationNote ? (
                <p className="text-content-muted">No notifications for this business.</p>
              ) : (
                <ul className="max-h-72 space-y-1 overflow-auto">
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button type="button" className="w-full rounded-lg px-2 py-2 text-left text-xs text-content hover:bg-surface-muted" onClick={() => { setNotesOpen(false); item.onOpen?.(); }}>
                        {item.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <label className="flex max-w-[11rem] items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 py-2 text-xs font-medium text-content">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5 shrink-0" aria-hidden>
            <rect x="3.5" y="7" width="17" height="13" rx="2" />
            <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
          </svg>
          <select aria-label="Branch" className="min-w-0 flex-1 truncate bg-transparent outline-none" value={branchId || ''} onChange={(event) => onBranch?.(event.target.value)}>
            {branches.length === 0 && <option value="">{storeName}</option>}
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </label>

        <AccountMenu
          user={user}
          roleLabel={roleLabel}
          businessName={businessName || storeName}
          branchName={branchName}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}
