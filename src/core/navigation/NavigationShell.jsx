import { NavLink } from 'react-router-dom';
import { cn } from '@utils/cn';

function NavItems({ items }) {
  return items.map((item) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors',
          isActive
            ? 'bg-white font-medium text-ink'
            : 'text-white/55 hover:bg-white/10 hover:text-white'
        )
      }
    >
      {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
      {item.label}
    </NavLink>
  ));
}

/**
 * Navigation rendering framework.
 * Supports primary items and optional footer items from the active business module.
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