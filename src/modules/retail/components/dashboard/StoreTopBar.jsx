/**
 * Retail top bar (module-owned). Core Header stays generic;
 * this renders the store context row seen in the dashboard design.
 */
export function StoreTopBar({ title, dateLabel, storeName, userName, notificationCount }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-5 py-2.5">
      <h1 className="text-[15px] font-semibold text-content">{title}</h1>
      <span className="hidden h-5 w-px bg-border sm:block" />
      <span className="flex items-center gap-1.5 text-xs text-content-muted">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
          <rect x="3.5" y="5" width="17" height="15" rx="2" />
          <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
        </svg>
        {dateLabel}
      </span>

      <div className="ml-auto flex items-center gap-2.5">
        <label className="hidden items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs text-content-muted md:flex">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            placeholder="Search..."
            className="w-36 bg-transparent outline-none placeholder:text-content-muted"
          />
          <kbd className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] text-content-muted">⌘ K</kbd>
        </label>

        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg border border-border bg-surface-elevated p-1.5 text-content-muted hover:text-content"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
            <path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold text-content-inverse">
              {notificationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-content"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
            <rect x="3.5" y="7" width="17" height="13" rx="2" />
            <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
          </svg>
          {storeName}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-content-muted">
            <path d="m7 10 5 5 5-5" />
          </svg>
        </button>

        <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-content">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-content-inverse">
            {userName.charAt(0)}
          </span>
          {userName}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 text-content-muted">
            <path d="m7 10 5 5 5-5" />
          </svg>
        </button>
      </div>
    </div>
  );
}
