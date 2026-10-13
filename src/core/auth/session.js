const TENANT_KEY = 'innosify.session.tenant';
const PLATFORM_KEY = 'innosify.session.platform';
const LAST_KEY = 'innosify.lastTenant';
const TWELVE_HOURS = 12 * 60 * 60 * 1000;

function keyFor(scope) {
  return scope === 'platform' ? PLATFORM_KEY : TENANT_KEY;
}

export function readSession(scope) {
  try {
    const raw = localStorage.getItem(keyFor(scope));
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.expiresAt || session.expiresAt < Date.now()) {
      localStorage.removeItem(keyFor(scope));
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function writeSession(scope, session) {
  localStorage.setItem(keyFor(scope), JSON.stringify({
    ...session,
    scope,
    expiresAt: session.expiresAt ?? Date.now() + TWELVE_HOURS,
  }));
  return readSession(scope);
}

export function clearSession(scope) {
  localStorage.removeItem(keyFor(scope));
}

export function rememberTenant(userId, tenantId) {
  const all = JSON.parse(localStorage.getItem(LAST_KEY) || '{}');
  all[userId] = tenantId;
  localStorage.setItem(LAST_KEY, JSON.stringify(all));
}

export function lastTenant(userId) {
  try {
    return JSON.parse(localStorage.getItem(LAST_KEY) || '{}')[userId] ?? null;
  } catch {
    return null;
  }
}

export function expireSession(scope) {
  const session = readSession(scope);
  if (!session) return;
  writeSession(scope, { ...session, expiresAt: Date.now() - 1000 });
  clearSession(scope);
}
