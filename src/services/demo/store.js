import { applyDemoAction } from './engine.js';
import { ensureRequiredAccounts } from './seed.js';
import { clearDemoState, freshSeed, loadDemoState, saveDemoState } from './persistence.js';

let state = null;
let driver = 'memory';
let ready = false;
let warning = '';
let initPromise = null;
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener(state));
}

export function getDemoState() {
  return state;
}

export function getDemoMeta() {
  return { ready, driver, warning };
}

export function subscribeDemo(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initDemoStore() {
  if (!initPromise) initPromise = hydrate();
  return initPromise;
}

async function hydrate() {
  if (ready && state) return state;
  try {
    const loaded = await loadDemoState();
    if (loaded.state) {
      const reconciled = ensureRequiredAccounts(loaded.state);
      state = reconciled;
      driver = loaded.driver;
      if (reconciled !== loaded.state) await saveDemoState(state);
    } else {
      state = freshSeed();
      driver = await saveDemoState(state);
    }
  } catch (error) {
    state = freshSeed();
    driver = 'memory';
    warning = error.message || 'Demo storage is unavailable. Changes last until this tab closes.';
  }
  ready = true;
  emit();
  return state;
}

export async function resetDemoStore() {
  await clearDemoState();
  state = freshSeed();
  try {
    driver = await saveDemoState(state);
    warning = '';
  } catch (error) {
    driver = 'memory';
    warning = error.message;
  }
  ready = true;
  emit();
  return state;
}

export function dispatchDemo(action) {
  if (!state) throw new Error('Demo store is not ready');
  try {
    state = applyDemoAction(state, action);
    saveDemoState(state).then((next) => {
      driver = next;
    }).catch((error) => {
      driver = 'memory';
      warning = error.message;
      emit();
    });
    emit();
    return { ok: true, state };
  } catch (error) {
    return { ok: false, error: error.message, code: error.code };
  }
}

export function evaluateLogin(source, { email, password, scope }) {
  const normalized = String(email || '').trim().toLowerCase();
  const user = source?.users?.find((item) => item.email === normalized);
  if (!user || user.password !== password) {
    return { ok: false, error: 'Those demo credentials were not recognised.' };
  }
  if (user.status !== 'ACTIVE') return { ok: false, error: 'This demo account is inactive.' };
  const isPlatform = user.platformRole === 'SUPER_ADMIN';
  if (scope === 'platform') {
    if (!isPlatform) return { ok: false, error: 'This account is not a platform administrator.' };
    return { ok: true, user, memberships: [], scope: 'platform' };
  }
  if (isPlatform) {
    return { ok: false, error: 'Platform administrators sign in from the platform login page.' };
  }
  const memberships = source.memberships.filter((item) => item.userId === user.id && item.status === 'ACTIVE');
  return { ok: true, user, memberships, scope: 'tenant' };
}

export function authenticateDemo(credentials) {
  return evaluateLogin(state, credentials);
}
