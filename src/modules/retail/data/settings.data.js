/**
 * Settings data — separated from UI per ARCHITECTURE.md.
 */

export const settingsSections = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'appearance', label: 'Appearance' },
];

export const accentOptions = [
  { id: 'plum', label: 'Plum', rgb: '107 35 143', muted: '238 228 245', hex: '#6B238F' },
  { id: 'violet', label: 'Violet', rgb: '109 40 217', muted: '240 233 254', hex: '#6D28D9' },
  { id: 'indigo', label: 'Indigo', rgb: '62 74 168', muted: '228 231 248', hex: '#3E4AA8' },
  { id: 'teal', label: 'Teal', rgb: '22 106 106', muted: '223 242 242', hex: '#166A6A' },
  { id: 'emerald', label: 'Emerald', rgb: '28 106 74', muted: '226 243 235', hex: '#1C6A4A' },
  { id: 'lime', label: 'Signal Lime', rgb: '58 140 20', muted: '235 250 228', hex: '#3A8C14' },
  { id: 'amber', label: 'Signal Amber', rgb: '176 122 24', muted: '254 246 216', hex: '#B07A18' },
  { id: 'crimson', label: 'Crimson', rgb: '168 52 84', muted: '250 231 238', hex: '#A83454' },
  { id: 'rose', label: 'Rose', rgb: '190 60 120', muted: '252 231 243', hex: '#BE3C78' },
  { id: 'slate', label: 'Slate', rgb: '71 85 105', muted: '241 245 249', hex: '#475569' },
  { id: 'graphite', label: 'Graphite', rgb: '39 39 42', muted: '244 244 245', hex: '#27272A' },
  { id: 'ink', label: 'Ink', rgb: '10 10 11', muted: '241 241 242', hex: '#0A0A0B' },
];

export const shapeOptions = [
  { id: 'sharp', label: 'Sharp', radius: '0.25rem', radiusLg: '0.375rem' },
  { id: 'soft', label: 'Soft', radius: '0.625rem', radiusLg: '0.875rem' },
  { id: 'round', label: 'Round', radius: '0.875rem', radiusLg: '1.125rem' },
  { id: 'pill', label: 'Pill', radius: '1.5rem', radiusLg: '2rem' },
];

export const sidebarOptions = [
  { id: 'ink', label: 'Ink' },
  { id: 'plum', label: 'Plum' },
  { id: 'graphite', label: 'Graphite' },
];

export const notificationToggles = [
  { id: 'low-stock', label: 'Low stock alerts', hint: 'Notify when an item falls below reorder level', enabled: true },
  { id: 'daily-summary', label: 'Daily summary', hint: 'Send a sales summary at end of day', enabled: true },
  { id: 'refunds', label: 'Refund alerts', hint: 'Alert managers when a refund is processed', enabled: false },
  { id: 'new-staff', label: 'Staff activity', hint: 'Notify when a cashier starts or ends a shift', enabled: false },
];

export const storeProfile = {
  storeName: 'Takshi Silks — Main Store',
  ownerName: 'Admin',
  email: 'admin@takshisilks.example',
  phone: '+91 98765 43210',
  gstNumber: '33AABCT1234K1Z5',
  currency: '₹ INR',
  address: '12, Kumbakonam Road, Thanjavur',
  openingTime: '10:00',
  closingTime: '21:00',
};