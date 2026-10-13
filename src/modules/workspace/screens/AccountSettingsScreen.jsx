import { Link } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { useTheme } from '@core/theme';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { cn } from '@utils/cn';
import { useDemo } from '@services/demo';
import { PersonalProfileForm } from '../components/PersonalProfileForm.jsx';
import { WorkspaceLayout } from './WorkspaceScreens.jsx';

export function AccountSettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { tenantUser, businesses, simulateExpiry } = useAuth();
  const { dispatch } = useDemo();

  return (
    <WorkspaceLayout>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Account</p>
        <h1 className="mt-2 text-3xl font-semibold">Account settings</h1>
        <p className="mt-2 text-sm text-content-muted">
          Personal preferences for this login. Store branding, GST, and branch hours stay in each business’s settings.
        </p>

        <section className="premium-card mt-6 p-6">
          <h2 className="font-semibold">Personal information</h2>
          <p className="mt-1 text-sm text-content-muted">Name and phone belong to you, not to a single shop.</p>
          <div className="mt-5">
            <PersonalProfileForm />
          </div>
        </section>

        <section className="premium-card mt-4 p-6">
          <h2 className="font-semibold">Security</h2>
          <p className="mt-2 text-sm text-content-muted">
            Changing a password from inside the account is unavailable. This demo does not verify the current password on this page, and it will not show a success message for a change that did not happen.
          </p>
          <p className="mt-2 text-sm text-content-muted">
            Password reset still works from the login screen. <Link to="/forgot-password" className="font-medium text-accent">Forgot password</Link> creates a demo reset link. That flow is separate from this page.
          </p>
        </section>

        <section className="premium-card mt-4 p-6">
          <h2 className="font-semibold">Preferences</h2>
          <p className="mt-4 text-xs font-medium text-content">Appearance</p>
          <p className="mt-1 text-xs text-content-muted">Uses the existing theme control. It applies immediately in this browser session and is not stored on the account.</p>
          <div className="mt-2 inline-flex rounded-full bg-surface-muted p-1">
            {['light', 'dark'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors',
                  theme === mode ? 'bg-surface text-content shadow-sm' : 'text-content-muted hover:text-content',
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {tenantUser && (
            <label className="mt-5 block text-sm">
              Preferred business
              <select
                className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2"
                value={tenantUser.preferredTenantId || ''}
                onChange={(event) => dispatch({ type: 'preference.set', userId: tenantUser.id, tenantId: event.target.value || null })}
              >
                <option value="">None</option>
                {businesses.map(({ tenant }) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
              </select>
              <span className="mt-1 block text-xs text-content-muted">Saved on this demo account. It does not rename the business.</span>
            </label>
          )}
        </section>

        <section className="premium-card mt-4 p-6">
          <h2 className="font-semibold">Demo session</h2>
          <p className="mt-2 text-sm text-content-muted">Expire only this customer session. Business records and the saved profile stay in the demo store. The platform admin session is left alone.</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              simulateExpiry('tenant');
              window.location.assign('/login?expired=1');
            }}
          >
            Simulate session expiry
          </Button>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
