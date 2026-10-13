import { useEffect, useId, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@utils/cn';

function isPathActive(pathname, path) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

function linkClass(isActive, collapsed) {
  return cn(
    'group relative flex items-center rounded-lg text-[13px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
    collapsed ? 'justify-center px-0 py-2' : 'gap-2 px-2.5 py-1.5',
    isActive ? 'bg-white/15 font-medium text-white shadow-[inset_3px_0_0_0_var(--color-accent)]' : 'text-white/70 hover:bg-white/10 hover:text-white',
  );
}

function Tip({ label, collapsed }) {
  if (!collapsed) return null;
  return (
    <span
      role="tooltip"
      aria-hidden="true"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {label}
    </span>
  );
}

function NavLinkItem({ item, collapsed, onNavigate }) {
  return (
    <NavLink
      to={item.path}
      title={collapsed ? item.label : undefined}
      onClick={onNavigate}
      className={({ isActive }) => linkClass(isActive, collapsed)}
    >
      {(item.icon || collapsed) && (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon || <LetterMark label={item.label} />}</span>
      )}
      {!collapsed && <span className="truncate">{item.label}</span>}
      <Tip label={item.label} collapsed={collapsed} />
    </NavLink>
  );
}

function NavGroup({ item, collapsed, onNavigate }) {
  const { pathname } = useLocation();
  const childActive = item.children.some((child) => isPathActive(pathname, child.path));
  const [open, setOpen] = useState(true);
  const panelId = useId();

  useEffect(() => {
    if (collapsed) setOpen(false);
    else if (childActive) setOpen(true);
  }, [collapsed, childActive]);

  if (collapsed) {
    return (
      <div className="group relative">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          title={item.label}
          onClick={() => setOpen((value) => !value)}
          className={linkClass(childActive, true) + ' w-full'}
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon || <LetterMark label={item.label} />}</span>
          <Tip label={item.label} collapsed />
        </button>
        {open && (
          <div id={panelId} className="absolute left-full top-0 z-50 ml-3 w-44 rounded-xl border border-white/10 bg-slate-950 p-1.5 shadow-xl">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">{item.label}</p>
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={({ isActive }) => cn(
                  'block rounded-lg px-2 py-1.5 text-xs',
                  isActive ? 'bg-white/10 font-medium text-white' : 'text-white/70 hover:bg-white/5 hover:text-white',
                )}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-[13px] text-white/60 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        {item.icon && <span className="flex h-4 w-4 shrink-0 items-center justify-center">{item.icon}</span>}
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-200 motion-reduce:transition-none', open ? 'rotate-0' : '-rotate-90')}
          aria-hidden
        >
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
      <div
        id={panelId}
        className={cn('grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none', open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="overflow-hidden">
          <div className="relative ml-5 mt-0.5 space-y-0.5 pb-1">
            {item.children.map((child) => (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={onNavigate}
                className={({ isActive }) => cn(linkClass(isActive, false), 'ml-1 py-1.5 text-[12.5px]')}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItems({ items, collapsed, onNavigate }) {
  return items.map((item) => (
    item.children?.length
      ? <NavGroup key={`${item.label}-${collapsed ? 'c' : 'e'}`} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      : <NavLinkItem key={item.path} item={item} collapsed={collapsed} onNavigate={onNavigate} />
  ));
}

function LetterMark({ label }) {
  return <span className="text-[10px] font-semibold">{label.slice(0, 1)}</span>;
}

/**
 * Navigation rendering framework.
 * Supports primary items, collapsible groups, and an icon-only collapsed mode.
 */
export function NavigationShell({ navigation, collapsed = false, onNavigate }) {
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
    <nav className={cn('sidebar-scroll flex min-h-0 flex-1 flex-col gap-0.5 p-2', collapsed ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden')}>
      {!collapsed && <p className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Store</p>}
      <div className="space-y-0.5">
        <NavItems items={primary} collapsed={collapsed} onNavigate={onNavigate} />
      </div>
      {footer.length > 0 && (
        <div className="mt-auto space-y-0.5 border-t border-white/10 pt-2">
          {!collapsed && <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">Business</p>}
          <NavItems items={footer} collapsed={collapsed} onNavigate={onNavigate} />
        </div>
      )}
    </nav>
  );
}
