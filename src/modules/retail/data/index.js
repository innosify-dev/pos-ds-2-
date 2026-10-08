export { readWorkingHours, saveWorkingHours, parseClock } from './workingHours.js';
export { dashboardMeta } from './dashboard.data.js';
export {
  dashboardStats,
  workingHoursSales,
  todaysSalesChart,
  monthlySalesChart,
  recentSales,
  restockAlerts,
  topProducts,
  staffOnDuty,
  salesTarget,
  quickActions,
} from './dashboard.data.js';
export { initialProducts, productStatuses, formatPrice } from './products.data.js';
export { initialBrands } from './brands.data.js';
export {
  initialCategories,
  buildCategoryTree,
  flattenCategoryTree,
  collectSubtreeIds,
} from './categories.data.js';
export { initialRegisters, knownCashiers, formatCash, nowTimeLabel } from './registers.data.js';
export { teamFilters, teamMembers, teamSummary } from './team.data.js';
export {
  analyticsStats,
  revenueRanges,
  categoryShare,
  activityFeed,
  topContributors,
  analyticsRanges,
} from './analytics.data.js';
export {
  settingsSections,
  accentOptions,
  shapeOptions,
  sidebarOptions,
  notificationToggles,
  storeProfile,
} from './settings.data.js';
