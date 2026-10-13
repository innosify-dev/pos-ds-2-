/**
 * Google sign-in boundary.
 *
 * This frontend demo does not complete Google authentication.
 * A configured client id is not enough: the authorization code must be
 * exchanged by NestJS, and this module must never create a local session.
 *
 * Required before this can be enabled:
 * 1. Google Cloud Console → APIs & Services → OAuth consent screen
 *    (External, app name Innosify POS, authorized domains).
 * 2. Credentials → OAuth client ID → Web application.
 *    Authorized JavaScript origins: the public site origin.
 *    Authorized redirect URI: the NestJS callback, for example
 *    https://api.example.com/auth/google/callback.
 * 3. NestJS authorization-code flow with PKCE:
 *    - start endpoint returns the Google authorize URL and stores the verifier server-side
 *    - callback verifies the code, identity token, and email_verified
 *    - issue the existing application session
 *    - do not link an existing account only because the email text matches
 * 4. Frontend env: VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_AUTH_URL pointing at that start endpoint.
 *    Never put a client secret in frontend code or in this file.
 * 5. Prove a real browser round-trip before treating the button as working.
 */

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const authUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;

export function googleAuthStatus() {
  const hasClient = typeof clientId === 'string' && clientId.trim().length > 0;
  const hasStart = typeof authUrl === 'string' && authUrl.trim().length > 0;
  return {
    configured: false,
    readyToWire: hasClient && hasStart,
    message: 'Google sign-in is coming soon. Email and password remain available.',
  };
}

export function beginGoogleSignIn() {
  return {
    ok: false,
    code: 'not_configured',
    error: googleAuthStatus().message,
  };
}
