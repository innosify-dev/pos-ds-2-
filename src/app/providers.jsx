import { DemoProvider } from '@services/demo';
import { AuthProvider } from '@core/auth/AuthProvider.jsx';
import { TenantProvider } from '@core/tenant/TenantProvider.jsx';
import { ThemeProvider } from '@core/theme';
import { ToastProvider } from '@shared/feedback/Toast.jsx';

/**
 * Global application providers.
 */
export function Providers({ children }) {
  return (
    <ThemeProvider>
      <DemoProvider>
        <AuthProvider>
          <TenantProvider>
            <ToastProvider>{children}</ToastProvider>
          </TenantProvider>
        </AuthProvider>
      </DemoProvider>
    </ThemeProvider>
  );
}
