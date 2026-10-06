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
    <aside className="flex w-56 shrink-0 flex-col bg-sidebar text-content-inverse">
      <div className="flex h-14 items-center gap-2.5 border-b border-white/10 px-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-signal-lime font-serif text-sm font-bold text-ink">
          T
        </span>
        <span className="text-sm font-semibold tracking-tight text-white">{activeModule?.name ?? 'POS'}</span>
      </div>
      <NavigationShell navigation={navigation} />
    </aside>
  );
}