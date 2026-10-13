import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export function accountName(user) {
  const name = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  return name || user?.email || 'Account';
}

export function accountInitials(user) {
  const parts = accountName(user).split(/\s+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part.charAt(0)).join('');
  return (letters || '?').toUpperCase();
}

/**
 * Account menu for the signed-in person.
 * The trigger never logs the user out. Logout is a separate menu item.
 */
export function AccountMenu({
  user,
  roleLabel,
  businessName,
  branchName,
  onLogout,
  profileHref = '/app/profile',
  settingsHref = '/app/settings/account',
  showAccountLinks = true,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const menuId = useId();
  const name = accountName(user);
  const initials = accountInitials(user);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    menuRef.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        className="flex max-w-[14rem] items-center gap-1.5 rounded-lg text-xs font-medium text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={`Account menu for ${name}`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-content-inverse">
          {user?.avatarDataUrl ? <img src={user.avatarDataUrl} alt="" className="h-full w-full object-cover" /> : initials}
        </span>
        <span className="hidden truncate sm:inline">{name}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 shrink-0 text-content-muted" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-30 mt-2 w-[min(18rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-border bg-surface p-2 text-left shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-content">{name}</p>
            <p className="truncate text-xs text-content-muted">{user?.email}</p>
            {roleLabel && <p className="mt-1 text-xs font-medium text-accent">{roleLabel}</p>}
            {(businessName || branchName) && (
              <p className="mt-1 truncate text-[11px] text-content-muted">
                {[businessName, branchName].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          {showAccountLinks && (
            <>
              <MenuLink to={profileHref} onSelect={close}>My Profile</MenuLink>
              <MenuLink to={settingsHref} onSelect={close}>Account Settings</MenuLink>
            </>
          )}
          <button
            type="button"
            role="menuitem"
            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm text-danger hover:bg-danger-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            onClick={(event) => {
              event.stopPropagation();
              close();
              onLogout?.();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({ to, onSelect, children }) {
  return (
    <Link
      to={to}
      role="menuitem"
      className="mt-1 block rounded-xl px-3 py-2 text-sm text-content hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      onClick={onSelect}
    >
      {children}
    </Link>
  );
}
