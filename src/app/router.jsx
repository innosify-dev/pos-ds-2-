import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@core/layout';
import { getActiveModule, getActiveModuleRoutes } from './moduleRegistry.js';

/**
 * Application-level routing.
 * Business routes are registered by their respective modules.
 */
export function AppRouter() {
  const activeModule = getActiveModule();
  const moduleRoutes = getActiveModuleRoutes();
  const homePath = activeModule?.config?.routePrefix ?? '/';

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to={homePath} replace />} />
          {moduleRoutes}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
