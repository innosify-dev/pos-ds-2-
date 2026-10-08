/**
 * Dashboard data — separated from UI per ARCHITECTURE.md.
 * Replace with services/api/ calls when the backend lands.
 */

export const dashboardMeta = {
  dateLabel: 'May 16, 2025  |  10:32 AM',
  storeName: 'Main Store',
  userName: 'Admin',
  notificationCount: 3,
};

export const dashboardStats = [
  {
    id: 'total-products',
    label: 'Total Products',
    value: 1284,
    hint: '42 added this month',
    to: '/retail/products',
    icon: 'box',
    featured: true,
    trend: [18, 22, 20, 27, 24, 30, 34],
  },
  {
    id: 'active-categories',
    label: 'Active Categories',
    value: 24,
    hint: 'Silks, Cottons, Jewellery',
    to: '/retail/categories',
    icon: 'tag',
    trend: [12, 14, 13, 18, 20, 21, 24],
  },
  {
    id: 'low-stock',
    label: 'Low Stock',
    value: 12,
    hint: 'Needs attention',
    to: '/retail/products',
    icon: 'alert',
    tone: 'warning',
    trend: [20, 18, 16, 17, 14, 13, 12],
  },
  {
    id: 'todays-orders',
    label: "Today's Orders",
    value: 48,
    hint: '+8 vs yesterday',
    to: '/retail/sales',
    icon: 'bag',
    trend: [30, 34, 29, 38, 42, 40, 48],
  },
];

/** Hourly sales across a day. Index is the hour (0 = 12 AM). */
export const workingHoursSales = {
  hourly: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    22000, 28000, 45000, 38000, 52000, 61000, 48000, 72000, 86000, 64000, 41000, 18000,
    0, 0,
  ],
};

export const todaysSalesChart = [
  { label: '9 AM', value: 22000 },
  { label: '12 PM', value: 45000, highlight: true },
  { label: '3 PM', value: 75000 },
  { label: '6 PM', value: 95000 },
  { label: '9 PM', value: 60000 },
];

export const monthlySalesChart = [
  { label: 'Jan', value: 640000 },
  { label: 'Feb', value: 720000 },
  { label: 'Mar', value: 590000 },
  { label: 'Apr', value: 880000, highlight: true },
  { label: 'May', value: 810000 },
  { label: 'Jun', value: 960000 },
  { label: 'Jul', value: 1040000 },
];

export const restockAlerts = [
  { id: 1, name: 'Kanjivaram Silk Saree', sku: 'KS-2201', left: 3, tone: 'warning', action: 'Restock' },
  { id: 2, name: 'Banarasi Silk Saree', sku: 'BS-1180', left: 0, tone: 'danger', action: 'Restock' },
  { id: 3, name: 'Soft Silk Saree', sku: 'SS-3390', left: 4, tone: 'warning', action: 'Restock' },
];

export const topProducts = [
  { id: 1, name: 'Kanjivaram Silk Saree', category: 'Kanjivaram', sold: 128, revenue: 384000, isNew: true },
  { id: 2, name: 'Banarasi Silk Saree', category: 'Banarasi', sold: 96, revenue: 288000 },
  { id: 3, name: 'Pattu Silk Saree', category: 'Pattu', sold: 74, revenue: 222000 },
  { id: 4, name: 'Georgette Saree', category: 'Georgette', sold: 61, revenue: 183000 },
  { id: 5, name: 'Chanderi Silk Saree', category: 'Chanderi', sold: 48, revenue: 144000 },
];

export const staffOnDuty = [
  { id: 1, name: 'Priya Sharma', role: 'Cashier', initials: 'PS', status: 'At Billing', tone: 'success' },
  { id: 2, name: 'Meena Kolat', role: 'Sales Executive', initials: 'MK', status: 'With Customer', tone: 'warning' },
  { id: 3, name: 'Kavitha Rao', role: 'Store Manager', initials: 'KR', status: 'In Stockroom', tone: 'muted' },
  { id: 4, name: 'Deepa Nair', role: 'Billing Staff', initials: 'DN', status: 'At Billing', tone: 'success' },
];

export const salesTarget = {
  achieved: 40,
  legend: [
    { label: 'Target reached', value: '₹4,86,000', color: 'var(--color-accent)' },
    { label: 'In progress', value: '₹7,29,000', color: 'var(--color-gold)' },
    { label: 'Pending', value: '₹4,85,000', color: 'var(--color-border-strong)' },
  ],
};

export const recentSales = [
  { invoice: 'INV-10482', customer: 'Priya', items: '2 Items', amount: '₹1,15,000', payment: 'UPI', status: 'Paid' },
  { invoice: 'INV-10481', customer: 'Kavitha', items: '1 Item', amount: '₹18,500', payment: 'Cash', status: 'Paid' },
  { invoice: 'INV-10480', customer: 'Meena', items: '3 Items', amount: '₹1,24,500', payment: 'Card', status: 'Paid' },
];

export const quickActions = [
  { id: 'add-product', label: 'Add Product', icon: 'plus', to: '/retail/products' },
  { id: 'new-sale', label: 'New Sale', icon: 'cart', to: '/retail/sales' },
  { id: 'add-purchase', label: 'Add Purchase', icon: 'bag-add', to: '/retail/registers' },
  { id: 'add-customer', label: 'Add Customer', icon: 'user-add', to: '/retail/customers' },
];