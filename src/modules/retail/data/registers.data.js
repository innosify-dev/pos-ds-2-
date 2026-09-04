/**
 * Registers mock data — store registers and cash sessions, separated from UI per ARCHITECTURE.md.
 * Replace with services/api/ calls when the backend lands.
 */

export const initialRegisters = [
  {
    id: 'r1',
    name: 'Register 01',
    code: 'REG-001',
    store: 'Main Store',
    cashier: 'Priya',
    isActive: true,
    status: 'Open',
    openingCash: 10000,
    currentCash: 48500,
    todaysSales: 38500,
    openedAt: '09:02 AM',
    allowCash: true,
    allowCard: true,
    allowUpi: true,
  },
  {
    id: 'r2',
    name: 'Register 02',
    code: 'REG-002',
    store: 'Main Store',
    cashier: 'Anandh',
    isActive: true,
    status: 'Open',
    openingCash: 8000,
    currentCash: 32200,
    todaysSales: 24200,
    openedAt: '09:15 AM',
    allowCash: true,
    allowCard: true,
    allowUpi: true,
  },
  {
    id: 'r3',
    name: 'Register 03',
    code: 'REG-003',
    store: 'Main Store',
    cashier: 'Kavitha',
    isActive: true,
    status: 'Closed',
    openingCash: 5000,
    currentCash: 18750,
    todaysSales: 13750,
    openedAt: '09:05 AM',
    allowCash: true,
    allowCard: true,
    allowUpi: true,
  },
  {
    id: 'r4',
    name: 'Register 04',
    code: 'REG-004',
    store: 'Main Store',
    cashier: null,
    isActive: true,
    status: 'Closed',
    openingCash: null,
    currentCash: null,
    todaysSales: null,
    openedAt: null,
    allowCash: true,
    allowCard: true,
    allowUpi: true,
  },
];

export const knownCashiers = ['Priya', 'Anandh', 'Kavitha', 'Meena'];

/**
 * Format a cash value with Indian grouping, or an em dash when there is no session.
 */
export function formatCash(value) {
  if (value === null || value === undefined) return '—';
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

export function nowTimeLabel() {
  return new Date()
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    .toUpperCase();
}
