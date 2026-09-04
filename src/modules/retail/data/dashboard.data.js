/**
 * Dashboard mock data — separated from UI per ARCHITECTURE.md.
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
    id: 'today-sales',
    label: "Today's Sales",
    value: '₹1,28,450',
    hint: '+12.5% vs yesterday',
    hintTone: 'success',
    icon: 'trend',
  },
  {
    id: 'today-orders',
    label: "Today's Orders",
    value: '48',
    hint: '+8 orders',
    hintTone: 'success',
    icon: 'bag',
  },
  {
    id: 'low-stock',
    label: 'Low Stock',
    value: '12 Products',
    hint: 'Needs attention',
    hintTone: 'warning',
    icon: 'alert',
  },
  {
    id: 'total-products',
    label: 'Total Products',
    value: '1,284',
    hint: '24 added this month',
    hintTone: 'muted',
    icon: 'box',
  },
];

export const todaysSalesChart = [
  { label: '9 AM', value: 22000 },
  { label: '12 PM', value: 45000 },
  { label: '3 PM', value: 75000 },
  { label: '6 PM', value: 95000 },
  { label: '9 PM', value: 60000 },
];

export const recentSales = [
  { invoice: 'INV-10482', customer: 'Priya', items: '2 Items', amount: '₹15,000', payment: 'UPI', status: 'Paid' },
  { invoice: 'INV-10481', customer: 'Kavitha', items: '1 Item', amount: '₹8,500', payment: 'Cash', status: 'Paid' },
  { invoice: 'INV-10480', customer: 'Meena', items: '3 Items', amount: '₹24,500', payment: 'Card', status: 'Paid' },
];

export const inventoryAttention = [
  { id: 1, name: 'Kanjivaram Silk Saree', left: 3, status: 'Low Stock', tone: 'warning', gradient: 'from-amber-600 to-red-700' },
  { id: 2, name: 'Banarasi Silk Saree', left: 0, status: 'Out of Stock', tone: 'danger', gradient: 'from-emerald-700 to-amber-800' },
  { id: 3, name: 'Soft Silk Saree', left: 4, status: 'Low Stock', tone: 'warning', gradient: 'from-rose-500 to-pink-700' },
];

export const quickActions = [
  { id: 'add-product', label: 'Add Product', icon: 'plus', to: '/retail/products' },
  { id: 'new-sale', label: 'New Sale', icon: 'cart', to: '/retail/sales' },
  { id: 'add-purchase', label: 'Add Purchase', icon: 'bag-add', to: '/retail/registers' },
  { id: 'add-customer', label: 'Add Customer', icon: 'user-add', to: '/retail/customers' },
];
