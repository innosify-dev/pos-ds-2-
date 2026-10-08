import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';

/**
 * Root application layout shell.
 * Provides the persistent frame around module-specific content.
 * Must stay business-agnostic — no per-module route lists here.
 * Modules render their own top bars inside their layouts.
 */
export function AppLayout() {
  return (
    <div className="flex h-screen bg-sidebar">
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-canvas">
          <main className="min-h-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable page/workspace container within the application shell.
 */
export function WorkspaceShell({ title, children }) {
  return (
    <section className="flex h-full flex-col">
      {title && (
        <header className="mb-4 border-b border-border pb-3">
          <h1 className="text-lg font-semibold text-content">{title}</h1>
        </header>
      )}
      <div className="flex-1">{children}</div>
    </section>
  );
}
