/**
 * Application-level configuration.
 * Business-specific configuration belongs inside each business module.
 */

export const appConfig = {
  name: 'Innosify POS',
  version: '0.1.0',
};

/**
 * Determines which business module is active.
 * Will be driven by tenant/license settings in the future.
 */
export function getActiveBusinessType() {
  return import.meta.env.VITE_BUSINESS_TYPE ?? 'retail';
}
