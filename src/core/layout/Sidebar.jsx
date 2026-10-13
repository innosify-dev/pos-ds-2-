import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { NavigationShell } from '@core/navigation';
import { getActiveModuleNavigation } from '@app/moduleRegistry';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { cn } from '@utils/cn';
import { useShell } from './ShellContext.jsx';

function filterNav(items, can, role) {
  return items.flatMap((item) => {
    if (item.roles && !item.roles.includes(role)) return [];
    if (item.children?.length) {
      const children = filterNav(item.children, can, role);
      return children.length ? [{ ...item, children }] : [];
    }
    if (item.permission && !can(item.permission)) return [];
    return [item];
  });
}

/**
 * Application sidebar. Routes and permissions stay with the active module.
 * Collapse is a visual preference; it does not remove navigation.
 */
export function Sidebar() {
  const navigation = getActiveModuleNavigation();
  const { can, memberships, logout, role } = useAuth();
  const { tenant } = useTenant();
  const { collapsed, mobileOpen, toggleCollapsed, closeMobile } = useShell();
  const location = useLocation();
  const primary = filterNav(navigation.primary ?? [], can, role);
  const footer = filterNav(navigation.footer ?? [], can, role);
  const mark = tenant?.name?.slice(0, 1) || 'IP';

  useEffect(() => {
    closeMobile();
  }, [location.pathname]);

  const panel = (compact) => (
    <div className={cn('flex h-full min-h-0 flex-col bg-sidebar text-content-inverse', compact ? 'w-[4.75rem]' : 'w-64')}>
      <div className={cn('flex h-14 items-center border-b border-white/10', compact ? 'justify-center px-2' : 'gap-2.5 px-3')}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-sm font-semibold text-white">
          {tenant?.logoDataUrl ? <img src={tenant.logoDataUrl} alt="" className="h-full w-full object-cover" /> : mark}
        </span>
        {!compact && <span className="truncate text-sm font-semibold tracking-tight text-white">{tenant?.name ?? 'Innosify POS'}</span>}
      </div>
      <NavigationShell navigation={{ primary, footer }} collapsed={compact} onNavigate={closeMobile} />
      <div className={cn('space-y-0.5 border-t border-white/10 p-2 text-xs', compact && 'px-1.5')}>
        {memberships.length > 0 && (
          <Link
            to="/app/businesses"
            title={compact ? 'My Businesses' : undefined}
            onClick={closeMobile}
            className={cn('flex items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white', compact ? 'justify-center px-0 py-2' : 'px-2 py-1.5')}
          >
            {compact ? 'B' : 'My Businesses'}
          </Link>
        )}
        <button
          type="button"
          className={cn('flex w-full items-center rounded-xl text-left text-white/70 hover:bg-white/10 hover:text-white', compact ? 'justify-center px-0 py-2' : 'px-2 py-1.5')}
          onClick={() => logout('tenant')}
          aria-label="Logout"
          title={compact ? 'Logout' : undefined}
        >
          {compact ? '↩' : 'Logout'}
        </button>
        <button
          type="button"
          className={cn('hidden w-full items-center rounded-xl text-white/50 hover:bg-white/10 hover:text-white md:flex', compact ? 'justify-center px-0 py-2' : 'px-2 py-1.5')}
          onClick={toggleCollapsed}
          aria-pressed={compact}
        >
          {compact ? '»' : '« Collapse'}
        </button>
        {!compact && <p className="px-2 text-[10px] text-white/40">Demo mode</p>}
      </div>
    </div>
  );

  return (
    <>
      <aside className={cn('hidden h-full shrink-0 transition-[width] duration-200 motion-reduce:transition-none md:flex', collapsed ? 'w-[4.75rem]' : 'w-64')}>
        {panel(collapsed)}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button type="button" className="absolute inset-0 bg-slate-950/50" aria-label="Close navigation" onClick={closeMobile} />
          <aside className="absolute inset-y-0 left-0 flex max-w-[85vw] shadow-2xl">
            {panel(false)}
          </aside>
        </div>
      )}
    </>
  );
}
