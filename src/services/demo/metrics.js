import { paiseToRupees } from './money.js';
import { branchStock, subscriptionFor, totalStock, usageFor } from './engine.js';

export function byTenant(list, tenantId) {
  return (list ?? []).filter((item) => item.tenantId === tenantId);
}

export function userById(state, id) {
  return state.users.find((item) => item.id === id) ?? null;
}

export function tenantById(state, id) {
  return state.tenants.find((item) => item.id === id) ?? null;
}

export function businessesForUser(state, userId) {
  return state.memberships
    .filter((item) => item.userId === userId && item.status === 'ACTIVE')
    .map((membership) => {
      const tenant = tenantById(state, membership.tenantId);
      const subscription = subscriptionFor(state, membership.tenantId);
      const plan = state.plans.find((item) => item.code === subscription?.planCode);
      return {
        membership,
        tenant,
        subscription,
        plan,
        branches: byTenant(state.branches, membership.tenantId).length,
        staff: state.memberships.filter((item) => item.tenantId === membership.tenantId && item.status === 'ACTIVE').length,
      };
    })
    .filter((item) => item.tenant);
}

function inRange(iso, from, to) {
  const time = new Date(iso).getTime();
  if (from && time < from.getTime()) return false;
  if (to && time > to.getTime()) return false;
  return true;
}

export function salesQuery(state, { tenantId, branchId, from, to, cashierId } = {}) {
  return state.sales.filter((sale) => {
    if (tenantId && sale.tenantId !== tenantId) return false;
    if (branchId && sale.branchId !== branchId) return false;
    if (cashierId && sale.cashierId !== cashierId) return false;
    return inRange(sale.createdAt, from, to);
  });
}

export function sumPaise(rows, key = 'totalPaise') {
  return rows.reduce((sum, row) => sum + (row[key] || 0), 0);
}

export function dashboardModel(state, tenantId, { branchId, from, to } = {}) {
  const sales = salesQuery(state, { tenantId, branchId, from, to });
  const products = byTenant(state.products, tenantId);
  const categories = byTenant(state.categories, tenantId).filter((item) => item.status !== 'Inactive');
  const onHand = (item) => (branchId ? Number(item.stockByBranch?.[branchId]) || 0 : totalStock(item));
  const low = products.filter((item) => onHand(item) <= (item.lowStock ?? 0));
  const customers = byTenant(state.customers, tenantId).filter((item) => !item.walkIn);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaySales = sales.filter((sale) => new Date(sale.createdAt) >= todayStart);
  const hourly = Array.from({ length: 24 }, () => 0);
  todaySales.forEach((sale) => {
    hourly[new Date(sale.createdAt).getHours()] += paiseToRupees(sale.totalPaise);
  });

  const months = [];
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - index);
    const label = date.toLocaleString('en-IN', { month: 'short' });
    const month = date.getMonth();
    const year = date.getFullYear();
    const value = sales
      .filter((sale) => {
        const created = new Date(sale.createdAt);
        return created.getMonth() === month && created.getFullYear() === year;
      })
      .reduce((sum, sale) => sum + paiseToRupees(sale.totalPaise), 0);
    months.push({ label, value: Math.round(value) });
  }

  const productSales = new Map();
  sales.forEach((sale) => {
    sale.lines.forEach((line) => {
      const current = productSales.get(line.productId) ?? { id: line.productId, name: line.name, sold: 0, revenue: 0, category: products.find((item) => item.id === line.productId)?.category ?? '' };
      current.sold += line.qty;
      current.revenue += paiseToRupees(line.totalPaise);
      productSales.set(line.productId, current);
    });
  });
  const topProducts = [...productSales.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const branchRows = byTenant(state.branches, tenantId).map((branch) => {
    const rows = sales.filter((sale) => sale.branchId === branch.id);
    return { id: branch.id, name: branch.name, orders: rows.length, revenue: Math.round(sumPaise(rows) / 100) };
  });

  return {
    todayTotal: Math.round(sumPaise(todaySales) / 100),
    todayOrders: todaySales.length,
    productCount: products.length,
    categoryCount: categories.length,
    lowStock: low.length,
    customerCount: customers.length,
    hourly,
    months,
    topProducts,
    recent: [...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6),
    lowItems: low.slice(0, 4).map((item) => ({ ...item, stock: onHand(item) })),
    branchRows,
    staff: byTenant(state.memberships, tenantId).filter((item) => item.status === 'ACTIVE').map((membership) => {
      const person = userById(state, membership.userId);
      const handled = sales.filter((sale) => sale.cashierId === membership.userId);
      return {
        id: membership.id,
        name: person ? `${person.firstName} ${person.lastName}` : 'Staff',
        role: membership.role,
        orders: handled.length,
        sales: Math.round(sumPaise(handled) / 100),
      };
    }),
  };
}

export function analyticsModel(state, tenantId, rangeDays = 30, branchId) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - rangeDays);
  const sales = salesQuery(state, { tenantId, branchId, from, to });
  const returns = byTenant(state.returns, tenantId).filter((item) => inRange(item.createdAt, from, to));
  const refunds = byTenant(state.refunds, tenantId).filter((item) => inRange(item.createdAt, from, to));
  const byProduct = new Map();
  const byCategory = new Map();
  const byCashier = new Map();
  const byMethod = new Map();
  sales.forEach((sale) => {
    const cashier = userById(state, sale.cashierId);
    const cashierName = cashier ? cashier.firstName : 'Unknown';
    byCashier.set(cashierName, (byCashier.get(cashierName) || 0) + sale.totalPaise);
    sale.payments.forEach((payment) => byMethod.set(payment.method, (byMethod.get(payment.method) || 0) + payment.amountPaise));
    sale.lines.forEach((line) => {
      const product = state.products.find((item) => item.id === line.productId);
      byProduct.set(line.name, (byProduct.get(line.name) || 0) + line.totalPaise);
      const category = product?.category || 'Other';
      byCategory.set(category, (byCategory.get(category) || 0) + line.totalPaise);
    });
  });
  const products = byTenant(state.products, tenantId);
  const stockOf = (product) => (branchId ? branchStock(product, branchId) : totalStock(product));
  const valuation = products.reduce((sum, product) => sum + stockOf(product) * Math.round((product.costPrice || 0) * 100), 0);
  const taxBands = new Map();
  sales.forEach((sale) => {
    (sale.lines || []).forEach((line) => {
      const rate = line.taxRate ?? 0;
      const current = taxBands.get(rate) || { rate, taxPaise: 0, taxablePaise: 0, lines: 0 };
      current.taxPaise += line.taxPaise || 0;
      current.taxablePaise += Math.max(0, (line.totalPaise || 0) - (line.taxPaise || 0));
      current.lines += 1;
      taxBands.set(rate, current);
    });
  });
  const dayMap = new Map();
  sales.forEach((sale) => {
    const date = new Date(sale.createdAt);
    const key = date.toISOString().slice(0, 10);
    const current = dayMap.get(key) || { key, label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), amountPaise: 0 };
    current.amountPaise += sale.totalPaise || 0;
    dayMap.set(key, current);
  });
  const purchases = byTenant(state.purchases, tenantId).filter((item) => {
    if (branchId && item.branchId !== branchId) return false;
    return inRange(item.createdAt, from, to);
  });
  return {
    sales,
    revenuePaise: sumPaise(sales),
    orders: sales.length,
    discountPaise: sumPaise(sales, 'discountPaise'),
    taxPaise: sumPaise(sales, 'taxPaise'),
    returnsPaise: sumPaise(returns, 'amountPaise'),
    refundsPaise: sumPaise(refunds, 'amountPaise'),
    daily: [...dayMap.values()].sort((a, b) => a.key.localeCompare(b.key)).map((day) => ({ label: day.label, value: Math.round(day.amountPaise / 100) })),
    taxBands: [...taxBands.values()].sort((a, b) => a.rate - b.rate),
    purchases,
    byProduct: [...byProduct.entries()].map(([name, amountPaise]) => ({ name, amountPaise })).sort((a, b) => b.amountPaise - a.amountPaise),
    byCategory: [...byCategory.entries()].map(([name, amountPaise]) => ({ name, amountPaise })),
    byCashier: [...byCashier.entries()].map(([name, amountPaise]) => ({ name, amountPaise })),
    byMethod: [...byMethod.entries()].map(([name, amountPaise]) => ({ name, amountPaise })),
    byBranch: byTenant(state.branches, tenantId).map((branch) => ({
      name: branch.name,
      amountPaise: sumPaise(sales.filter((sale) => sale.branchId === branch.id)),
    })),
    lowStock: products.filter((product) => {
      const qty = stockOf(product);
      return qty > 0 && qty <= (product.lowStock ?? 0);
    }),
    outOfStock: products.filter((product) => stockOf(product) <= 0),
    stockUnits: products.reduce((sum, product) => sum + stockOf(product), 0),
    valuationPaise: valuation,
    customers: byTenant(state.customers, tenantId).map((customer) => ({
      ...customer,
      spentPaise: sumPaise(state.sales.filter((sale) => sale.customerId === customer.id && sale.tenantId === tenantId)),
    })),
  };
}

export function platformMetrics(state) {
  const active = state.subscriptions.filter((item) => item.status === 'ACTIVE');
  const trialing = state.subscriptions.filter((item) => item.status === 'TRIALING');
  const expired = state.subscriptions.filter((item) => ['EXPIRED', 'CANCELED', 'SUSPENDED'].includes(item.status));
  const mrr = active.reduce((sum, item) => sum + (state.plans.find((plan) => plan.code === item.planCode)?.pricePaise || 0), 0);
  return {
    businesses: state.tenants.length,
    active: active.length,
    trialing: trialing.length,
    expired: expired.length,
    users: state.users.filter((user) => user.email !== 'superadmin@demo.innosify.test').length,
    mrr,
    distribution: state.plans.map((plan) => ({
      code: plan.code,
      name: plan.name,
      count: state.subscriptions.filter((item) => item.planCode === plan.code).length,
    })),
  };
}

export { usageFor, subscriptionFor };
