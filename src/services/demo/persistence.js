import { SEED_VERSION, createSeed } from './seed.js';

const DB_NAME = 'innosify-pos-demo';
const STORE = 'kv';
const KEY = 'state';
const FALLBACK_KEY = 'innosify.demo.state';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function idbGet() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const request = tx.objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function idbSet(value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDemoState() {
  try {
    const stored = await idbGet();
    if (stored?.version === SEED_VERSION) return { state: stored, driver: 'indexeddb' };
  } catch {
    /* fall through */
  }
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (raw) {
      const stored = JSON.parse(raw);
      if (stored?.version === SEED_VERSION) return { state: stored, driver: 'localstorage' };
    }
  } catch {
    /* fall through */
  }
  return { state: null, driver: null };
}

export async function saveDemoState(state) {
  try {
    await idbSet(state);
    return 'indexeddb';
  } catch {
    try {
      localStorage.setItem(FALLBACK_KEY, JSON.stringify(state));
      return 'localstorage';
    } catch (error) {
      const failure = new Error('This browser could not store the demo. Data will last only until you close the tab.');
      failure.cause = error;
      throw failure;
    }
  }
}

export async function clearDemoState() {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
  localStorage.removeItem(FALLBACK_KEY);
}

export function freshSeed() {
  return createSeed(new Date());
}
