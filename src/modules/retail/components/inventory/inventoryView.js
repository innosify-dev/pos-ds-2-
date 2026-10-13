/** Presentation helpers for stock screens. Quantities stay on the shared demo records. */

export function branchQty(product, branchId) {
  return Number(product?.stockByBranch?.[branchId]) || 0;
}

export function visibleQty(product, branchIds) {
  return branchIds.reduce((sum, id) => sum + branchQty(product, id), 0);
}

/** Same threshold as the demo stock rule, applied only to quantities this user can see. */
export function stockLabel(qty, lowStock) {
  const low = Number(lowStock ?? 0);
  if (qty <= 0) return 'Out of Stock';
  if (qty <= low) return 'Low Stock';
  return 'In Stock';
}

export function inventoryCost(products, branchIds) {
  let value = 0;
  let priced = 0;
  products.forEach((product) => {
    const cost = Number(product.costPrice);
    if (!Number.isFinite(cost)) return;
    priced += 1;
    value += visibleQty(product, branchIds) * cost;
  });
  return { value, priced, total: products.length };
}

export function formatWhen(value) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
}

export function movementLabel(type) {
  const key = String(type || '').toUpperCase();
  if (key === 'ADJUST' || key === 'ADJUSTMENT') return 'Adjustment';
  if (key === 'TRANSFER') return 'Transfer';
  if (key === 'SALE') return 'Sale';
  if (key === 'PURCHASE') return 'Purchase';
  if (key === 'RETURN') return 'Return';
  return type || 'Movement';
}

function userName(users, id) {
  const user = users.find((item) => item.id === id);
  if (!user) return 'Not recorded';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Not recorded';
}

/**
 * History rows from recorded stock moves, sales, receipts, and restocked returns.
 * Nothing here is stored separately from those records.
 */
export function buildMovements(state, tenantId, branchIds, users = []) {
  const allowed = new Set(branchIds);
  const touches = (id) => Boolean(id) && allowed.has(id);
  const productName = (id, fallback) => state.products.find((item) => item.id === id)?.name || fallback || 'Product';
  const rows = [];

  (state.stockMoves || []).forEach((move) => {
    if (move.tenantId !== tenantId) return;
    if (move.branchId && !touches(move.branchId) && !touches(move.fromBranchId) && !touches(move.toBranchId)) return;
    if (!move.branchId && !touches(move.fromBranchId) && !touches(move.toBranchId)) return;
    rows.push({
      id: move.id,
      type: move.type,
      productId: move.productId,
      productName: productName(move.productId),
      branchId: move.branchId,
      fromBranchId: move.fromBranchId,
      toBranchId: move.toBranchId,
      delta: Number(move.delta) || 0,
      reference: move.reason || 'Stock movement',
      user: 'Not recorded',
      createdAt: move.createdAt,
    });
  });

  (state.sales || []).forEach((sale) => {
    if (sale.tenantId !== tenantId || !touches(sale.branchId)) return;
    (sale.lines || []).forEach((line, index) => {
      rows.push({
        id: `${sale.id}-line-${index}`,
        type: 'SALE',
        productId: line.productId,
        productName: productName(line.productId, line.name),
        branchId: sale.branchId,
        delta: -Number(line.qty || 0),
        reference: sale.invoiceNo || 'Sale',
        user: userName(users, sale.cashierId),
        createdAt: sale.createdAt,
      });
    });
  });

  (state.purchases || []).forEach((purchase) => {
    if (purchase.tenantId !== tenantId || !touches(purchase.branchId)) return;
    (purchase.lines || []).forEach((line, index) => {
      rows.push({
        id: `${purchase.id}-line-${index}`,
        type: 'PURCHASE',
        productId: line.productId,
        productName: productName(line.productId, line.name),
        branchId: purchase.branchId,
        delta: Number(line.qty) || 0,
        reference: purchase.note || 'Goods receipt',
        user: 'Not recorded',
        createdAt: purchase.createdAt,
      });
    });
  });

  (state.returns || []).forEach((entry) => {
    const sale = (state.sales || []).find((item) => item.id === entry.saleId);
    if (entry.tenantId !== tenantId || !sale || !touches(sale.branchId)) return;
    (entry.lines || []).filter((line) => line.restock).forEach((line, index) => {
      rows.push({
        id: `${entry.id}-restock-${index}`,
        type: 'RETURN',
        productId: line.productId,
        productName: productName(line.productId, line.name),
        branchId: sale.branchId,
        delta: Number(line.qty) || 0,
        reference: entry.invoiceNo || sale.invoiceNo || 'Return',
        user: 'Not recorded',
        createdAt: entry.createdAt,
      });
    });
  });

  return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
