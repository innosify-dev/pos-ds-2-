import { Link } from 'react-router-dom';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { accountInitials, accountName } from '@core/auth/AccountMenu.jsx';
import { ROLE_LABELS } from '@services/demo/permissions.js';
import { PersonalProfileForm } from '../components/PersonalProfileForm.jsx';
import { WorkspaceLayout } from './WorkspaceScreens.jsx';

export function ProfileScreen() {
  const { tenantUser, memberships, role, businesses } = useAuth();
  const currentRole = ROLE_LABELS[role] || role;

  return (
    <WorkspaceLayout>
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Account</p>
        <h1 className="mt-2 text-3xl font-semibold">My Profile</h1>
        <p className="mt-2 text-sm text-content-muted">
          This is your personal account. It stays the same when you switch businesses. Business names and branch records are not changed here.
        </p>

        <section className="premium-card mt-6 p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-semibold text-content-inverse">
              {tenantUser?.avatarDataUrl
                ? <img src={tenantUser.avatarDataUrl} alt="" className="h-full w-full object-cover" />
                : accountInitials(tenantUser)}
            </span>
            <div>
              <h2 className="font-semibold">{accountName(tenantUser)}</h2>
              <p className="text-sm text-content-muted">{tenantUser?.email}</p>
            </div>
          </div>
          <PersonalProfileForm />
        </section>

        <section className="premium-card mt-4 p-6">
          <h2 className="font-semibold">Account information</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-content-muted">Current role</dt>
              <dd className="mt-1 font-medium">{currentRole || 'No business selected'}</dd>
              <p className="mt-1 text-xs text-content-muted">Roles are assigned by the business. You cannot change your own role here.</p>
            </div>
            <div>
              <dt className="text-xs text-content-muted">Businesses on this account</dt>
              <dd className="mt-1">
                {businesses.length === 0 && <span className="text-content-muted">None yet</span>}
                <ul className="space-y-1">
                  {memberships.map((membership) => {
                    const business = businesses.find((item) => item.tenant.id === membership.tenantId);
                    return (
                      <li key={membership.id}>
                        {business?.tenant.name || 'Business'} · {ROLE_LABELS[membership.role] || membership.role}
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </div>
          </dl>
          <Link to="/app/settings/account" className="mt-5 inline-block text-sm font-medium text-accent">Open account settings</Link>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
