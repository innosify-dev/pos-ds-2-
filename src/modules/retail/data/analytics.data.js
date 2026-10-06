/**
 * Analytics data — separated from UI per ARCHITECTURE.md.
 * Replace with services/api/ calls when the backend lands.
 */

export const analyticsStats = [
  {
    id: 'total-revenue',
    label: 'Total Revenue',
    value: 1284500,
    hint: '6.4% vs last period',
    icon: 'trend',
    trend: [820, 900, 960, 1040, 1120, 1200, 1284],
  },
  {
    id: 'new-customers',
    label: 'New Customers',
    value: 214,
    hint: '18 added this week',
    icon: 'bag',
    trend: [120, 140, 150, 168, 180, 196, 214],
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: 68,
    suffix: '%',
    hint: 'of walk-ins billed',
    icon: 'tag',
    trend: [52, 55, 58, 60, 63, 66, 68],
  },
  {
    id: 'avg-order',
    label: 'Avg Order Value',
    value: 4260,
    prefix: '₹',
    hint: '₹1,240 vs last period',
    icon: 'box',
    featured: true,
    trend: [3400, 3550, 3700, 3900, 4050, 4180, 4260],
  },
];

export const revenueRanges = [
  {
    id: 'days',
    label: 'Days',
    caption: 'Revenue per day over the last week',
    series: [
      { label: 'Mon', value: 118000 },
      { label: 'Tue', value: 142000 },
      { label: 'Wed', value: 96000 },
      { label: 'Thu', value: 168000 },
      { label: 'Fri', value: 196000 },
      { label: 'Sat', value: 224000 },
      { label: 'Sun', value: 148000 },
    ],
  },
  {
    id: 'weeks',
    label: 'Weeks',
    caption: 'Revenue per week over the last six weeks',
    series: [
      { label: 'W1', value: 640000 },
      { label: 'W2', value: 720000 },
      { label: 'W3', value: 590000 },
      { label: 'W4', value: 880000 },
      { label: 'W5', value: 810000 },
      { label: 'W6', value: 960000 },
    ],
  },
  {
    id: 'months',
    label: 'Months',
    caption: 'Revenue per month across the financial year',
    series: [
      { label: 'Jan', value: 640000 },
      { label: 'Feb', value: 720000 },
      { label: 'Mar', value: 590000 },
      { label: 'Apr', value: 880000 },
      { label: 'May', value: 810000 },
      { label: 'Jun', value: 960000 },
      { label: 'Jul', value: 1040000 },
    ],
  },
];

export const categoryShare = {
  achieved: 68,
  legend: [
    { label: 'Kanjivaram', value: '₹4,86,000', color: 'var(--color-accent)' },
    { label: 'Banarasi', value: '₹3,12,000', color: 'var(--color-gold)' },
    { label: 'Pattu', value: '₹2,04,000', color: 'rgb(var(--rgb-success))' },
    { label: 'Georgette', value: '₹1,18,000', color: 'rgb(var(--rgb-border-strong))' },
    { label: 'Chanderi', value: '₹64,000', color: 'rgb(var(--rgb-border))' },
  ],
};

export const activityFeed = [
  { id: 1, actor: 'Priya Sharma', action: 'billed invoice', target: 'INV-10482', time: '2 min ago', tone: 'success' },
  { id: 2, actor: 'Kavitha Rao', action: 'added stock for', target: 'Kanjivaram Silk Saree', time: '18 min ago', tone: 'muted' },
  { id: 3, actor: 'Meena Kolat', action: 'processed return', target: 'INV-10461', time: '42 min ago', tone: 'warning' },
  { id: 4, actor: 'Deepa Nair', action: 'registered customer', target: 'Lakshmi Menon', time: '1 hr ago', tone: 'muted' },
  { id: 5, actor: 'Anitha Suresh', action: 'adjusted quantity', target: 'Soft Silk Saree', time: '2 hrs ago', tone: 'danger' },
];

export const topContributors = [
  { id: 1, name: 'Kavitha Rao', role: 'Store Manager', sales: 412000, share: 32 },
  { id: 2, name: 'Priya Sharma', role: 'Cashier', sales: 284000, share: 22 },
  { id: 3, name: 'Meena Kolat', role: 'Sales Executive', sales: 246000, share: 19 },
  { id: 4, name: 'Deepa Nair', role: 'Billing Staff', sales: 198000, share: 15 },
  { id: 5, name: 'Anitha Suresh', role: 'Stock Executive', sales: 64000, share: 5 },
];

export const analyticsRanges = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '12m', label: 'Last 12 months' },
];