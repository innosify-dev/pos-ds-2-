import { NavigationShell } from '@core/navigation';
import { getActiveModule, getActiveModuleNavigation } from '@app/moduleRegistry';

/**
 * Application sidebar shell.
 * Brand label comes from the active business module — no hardcoded business names here.
 */
export function Sidebar() {
  const navigation = getActiveModuleNavigation();
  const activeModule = getActiveModule();

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent font-serif text-sm font-bold text-content-inverse">
          S
        </span>
        <span className="text-sm font-semibold text-accent">{activeModule?.name ?? 'POS'}</span>
      </div>
      <NavigationShell navigation={navigation} />
    </aside>
  );
}
