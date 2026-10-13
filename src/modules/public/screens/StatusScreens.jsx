import { Link } from 'react-router-dom';

export function UnauthorizedScreen() {
  return (
    <main className="premium-card mx-auto my-16 max-w-lg px-8 py-16 text-center">
      <h1 className="text-2xl font-semibold">Access denied</h1>
      <p className="mt-2 text-sm text-content-muted">This demo role cannot open that page. The check is in the browser only; the API will enforce it later.</p>
      <Link to="/app/businesses" className="mt-4 inline-block text-accent">Back to My Businesses</Link>
    </main>
  );
}

export function NotFoundScreen() {
  return (
    <main className="premium-card mx-auto my-16 max-w-lg px-8 py-16 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-content-muted">That route is not part of the demo.</p>
      <Link to="/" className="mt-4 inline-block text-accent">Go to the homepage</Link>
    </main>
  );
}

export function SubscriptionBlockedScreen() {
  const params = new URLSearchParams(window.location.search);
  return (
    <main className="premium-card mx-auto my-16 max-w-lg px-8 py-16 text-center">
      <h1 className="text-2xl font-semibold">Subscription restricted</h1>
      <p className="mt-2 text-sm text-content-muted">{params.get('reason') || 'This business cannot use the POS until the demo subscription is active.'}</p>
      <Link to="/retail/subscription" className="mt-4 inline-block text-accent">View subscription</Link>
    </main>
  );
}
