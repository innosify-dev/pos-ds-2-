/**
 * Service boundary for screens.
 * In demo mode every call stays in the browser mock store.
 * A later NestJS client can replace these exports without changing screen contracts.
 */
export {
  authenticateDemo,
  dispatchDemo,
  getDemoState,
  initDemoStore,
  resetDemoStore,
} from '../demo/store.js';

export const apiService = {
  mode: import.meta.env.VITE_DEMO_MODE === 'false' ? 'http' : 'demo',
  note: 'Demo mode does not call the NestJS API and does not process real payments.',
};
