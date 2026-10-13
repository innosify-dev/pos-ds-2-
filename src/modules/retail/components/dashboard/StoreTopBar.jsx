import { useEffect, useId, useRef, useState } from 'react';
import { AccountMenu } from '@core/auth/AccountMenu.jsx';
import { useShell } from '@core/layout/ShellContext.jsx';

/**
 * Retail top bar. Search is visual only. Notifications list only real alerts
 * passed in by the layout; an empty list does not invent messages.
 */
export function StoreTopBar({
  title,
  dateLabel,
  storeName,
  user,
  roleLabel,
  businessName,
  branchName,
  notificationCount,
  notificationNote,
  branches = [],
  branchId,
  onBranch,
  onLogout,
}) {
  const { openMobile } = useShell();
  const [notesOpen, setNotesOpen] = useState(false);
  const notesRef = useRef(null);
  const notesId = useId();

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
        <label className="hidden items-center gap-2 rounded-xl border border-border bg-surface-muted/70 px-3 py-2 text-xs text-content-muted lg:flex">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            disabled
            aria-label="Search is not connected"
            placeholder="Search is not connected"
            className="w-40 cursor-not-allowed bg-transparent outline-none placeholder:text-content-muted"
          />
        </label>

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
            <div id={notesId} role="region" aria-label="Notifications" className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-border bg-surface p-3 text-sm shadow-lg">
              {notificationNote ? (
                <p className="text-content">{notificationNote}</p>
              ) : (
                <p className="text-content-muted">No notifications.</p>
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
