import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@utils/cn';

function isPathActive(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function linkClass(isActive) {
  return cn(
    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors',
    isActive ? 'bg-white font-medium text-ink' : 'text-white/55 hover:bg-white/10 hover:text-white'
  );
}

function NavLinkItem({ item }) {
  return (
    <NavLink to={item.path} className={({ isActive }) => linkClass(isActive)}>
      {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
      {item.label}
    </NavLink>
  );
}

function NavGroup({ item }) {
  const { pathname } = useLocation();
  const childActive = item.children.some((child) => isPathActive(pathname, child.path));
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] text-white/55 transition-colors hover:bg-white/10 hover:text-white"
      >
        {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform', open ? 'rotate-0' : 'rotate-180')}
          aria-hidden
        >
          <path d="m7 14 5-5 5 5" />
        </svg>
      </button>

      {open && (
        <div className="relative ml-5 mt-0.5">
          {item.children.map((child, index) => {
            const last = index === item.children.length - 1;
            return (
              <div key={child.path} className="relative">
                <span
                  className={cn('absolute left-0 top-0 w-px bg-white/25', last ? 'h-1/2' : 'bottom-0')}
                  aria-hidden
                />
                <span className="absolute left-0 top-1/2 h-px w-3 bg-white/25" aria-hidden />
                <NavLink to={child.path} className={({ isActive }) => cn(linkClass(isActive), 'ml-3')}>
                  {child.label}
                </NavLink>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function NavItems({ items }) {
  return items.map((item) =>
    item.children?.length ? <NavGroup key={item.label} item={item} /> : <NavLinkItem key={item.path} item={item} />
  );
}

/**
 * Navigation rendering framework.
 * Supports primary items, collapsible groups, and optional footer items.
 * Items may carry an optional `icon` node — rendered generically, owned by the module.
 */
export function NavigationShell({ navigation }) {
  const { primary = [], footer = [] } = Array.isArray(navigation)
    ? { primary: navigation, footer: [] }
    : navigation || { primary: [], footer: [] };

  if (primary.length === 0 && footer.length === 0) {
    return (
      <nav className="flex flex-1 flex-col p-shell">
        <p className="text-xs text-white/50">No navigation configured</p>
      </nav>
    );
  }

  return (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-auto p-3">
      <div className="flex-1 space-y-0.5">
        <NavItems items={primary} />
      </div>
      {footer.length > 0 && (
        <div className="mt-auto space-y-0.5 border-t border-white/10 pt-3">
          <NavItems items={footer} />
        </div>
      )}
    </nav>
  );
}
