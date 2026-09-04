import { appConfig } from '@app/config/app.config';

/**
 * Application header shell.
 * Must stay business-agnostic — module screens set their own titles
 * (e.g. via WorkspaceShell) instead of a global route-title map here.
 */
export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-surface-elevated px-shell">
      <span className="text-sm font-medium text-content">{appConfig.name}</span>
    </header>
  );
}
