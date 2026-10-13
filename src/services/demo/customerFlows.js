import { quoteCart } from './money.js';

function fail(message) {
  const error = new Error(message);
  error.code = 'DEMO_RULE';
  throw error;
}

function stockAt(product, branchId) {
  return product?.stockByBranch?.[branchId] ?? 0;
}

const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GSTIN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PIN = /^[1-9][0-9]{5}$/;

function lists(state) {
  return {
    exchanges: state.exchanges || [],
    purchaseReturns: state.purchaseReturns || [],
    loyaltyPrograms: state.loyaltyPrograms || {},
    loyaltyLedger: state.loyaltyLedger || [],
    creditLedger: state.creditLedger || [],
  };
}

export function loyaltyProgram(state, tenantId) {
  return (state.loyaltyPrograms || {})[tenantId] || null;
}

export function exchangedQty(state, saleId, lineIndex) {
  return (state.exchanges || [])
    .filter((item) => item.saleId === saleId)
    .flatMap((item) => item.lines)
    .filter((line) => line.lineIndex === lineIndex)
    .reduce((sum, line) => sum + line.qty, 0);
}

export function eligibleSoldQty(state, sale, lineIndex) {
  const original = sale?.lines?.[lineIndex];
  if (!original) return 0;
  const returned = (state.returns || [])
    .filter((item) => item.saleId === sale.id)
    .flatMap((item) => item.lines)
    .filter((line) => line.lineIndex === lineIndex)
    .reduce((sum, line) => sum + line.qty, 0);
  return Math.max(0, original.qty - returned - exchangedQty(state, sale.id, lineIndex));
}

export function creditedPaise(state, saleId) {
  return (state.creditLedger || [])
    .filter((item) => item.saleId === saleId && item.type === 'ISSUE')
    .reduce((sum, item) => sum + item.amountPaise, 0);
}

export function validateCustomer(state, record) {
  const name = String(record.name || '').trim();
  if (!name) fail('Customer name is required.');
  const phone = String(record.phone || '').replace(/\s+/g, '');
  const email = String(record.email || '').trim().toLowerCase();
  const gstin = String(record.gstin || '').trim().toUpperCase();
  const pin = String(record.pin || '').trim();
  if (!record.walkIn && !PHONE.test(phone)) fail('Enter a 10-digit mobile number.');
  if (email && !EMAIL.test(email)) fail('Enter a valid email address.');
  if (gstin && !GSTIN.test(gstin)) fail('Enter a valid 15-character GSTIN.');
  if (pin && !PIN.test(pin)) fail('Enter a 6-digit PIN code.');
  const siblings = state.customers.filter((item) => item.tenantId === record.tenantId && item.id !== record.id && !item.walkIn);
  if (phone && siblings.some((item) => String(item.phone || '').replace(/\s+/g, '') === phone)) {
    fail('A customer with this phone already exists in this business.');
  }
  if (email && siblings.some((item) => String(item.email || '').toLowerCase() === email)) {
    fail('A customer with this email already exists in this business.');
  }
  return {
    ...record,
    name,
    phone,
    email,
    gstin,
    pin,
    address: String(record.address || '').trim(),
    city: String(record.city || '').trim(),
    stateName: String(record.stateName || '').trim(),
    notes: String(record.notes || '').trim(),
    status: record.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    loyaltyPoints: Math.max(0, Math.round(Number(record.loyaltyPoints) || 0)),
    balancePaise: Math.max(0, Math.round(Number(record.balancePaise) || 0)),
  };
}

export function saveCustomer(state, action) {
  const incoming = { ...action.record, tenantId: action.tenantId || action.record.tenantId };
  if (!incoming.tenantId) fail('Missing business.');
  const existing = incoming.id ? state.customers.find((item) => item.id === incoming.id) : null;
  if (incoming.id && (!existing || existing.tenantId !== incoming.tenantId)) fail('Customer was not found in this business.');
  const record = validateCustomer(state, {
    walkIn: existing?.walkIn || false,
    ...incoming,
    id: existing?.id || incoming.id,
    loyaltyPoints: existing?.loyaltyPoints ?? 0,
    balancePaise: existing?.balancePaise ?? 0,
  });
  if (!record.id) record.id = `cus-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const list = state.customers;
  const exists = list.some((item) => item.id === record.id);
  return {
    ...state,
    customers: exists ? list.map((item) => item.id === record.id ? { ...item, ...record, loyaltyPoints: item.loyaltyPoints, balancePaise: item.balancePaise } : item) : [...list, record],
  };
}

export function configureLoyalty(state, action) {
  const enabled = Boolean(action.enabled);
  const pointsPerSpendPaise = Math.round(Number(action.pointsPerSpendPaise));
  const paisePerPoint = Math.round(Number(action.paisePerPoint));
  if (enabled) {
    if (!Number.isFinite(pointsPerSpendPaise) || pointsPerSpendPaise < 100) {
      fail('Set how many paise of spend earn one point. Use at least 100.');
    }
    if (!Number.isFinite(paisePerPoint) || paisePerPoint < 1) {
      fail('Set how many paise one point is worth.');
    }
  }
  return {
    ...state,
    loyaltyPrograms: {
      ...(state.loyaltyPrograms || {}),
      [action.tenantId]: enabled ? { enabled: true, pointsPerSpendPaise, paisePerPoint } : { enabled: false },
    },
  };
}

function customerOf(state, tenantId, customerId) {
  const customer = state.customers.find((item) => item.id === customerId && item.tenantId === tenantId);
  if (!customer) fail('Customer was not found in this business.');
  return customer;
}

function patchCustomer(state, customerId, patch) {
  return state.customers.map((item) => item.id === customerId ? { ...item, ...patch } : item);
}

export function loyaltyDiscountPaise(program, points) {
  if (!program?.enabled) return 0;
  return Math.max(0, Math.round(points) * program.paisePerPoint);
}

export function pointsEarned(program, totalPaise) {
  if (!program?.enabled || program.pointsPerSpendPaise < 1) return 0;
  return Math.floor(Math.max(0, totalPaise) / program.pointsPerSpendPaise);
}

export function applySaleLoyalty(state, action, quote) {
  const program = loyaltyProgram(state, action.tenantId);
  const points = Math.round(Number(action.loyaltyPoints) || 0);
  const credit = Math.round(Number(action.storeCreditPaise) || 0);
  if (!points && !credit && !program?.enabled) {
    return { loyaltyDiscountPaise: 0, pointsUsed: 0, pointsEarned: 0, storeCreditPaise: 0, customer: null };
  }
  const customer = action.customerId ? customerOf(state, action.tenantId, action.customerId) : null;
  if ((points || credit) && !customer) fail('Select a customer before using points or store credit.');
  if (customer?.status === 'INACTIVE') fail('This customer is inactive.');
  if (points > 0) {
    if (!program?.enabled) fail('Loyalty is not configured for this business.');
    if (points > customer.loyaltyPoints) fail('Not enough loyalty points.');
  }
  if (credit > 0 && credit > customer.balancePaise) fail('Not enough store credit.');
  if (credit > quote.totalPaise) fail('Store credit cannot exceed the bill.');
  const earned = customer ? pointsEarned(program, quote.totalPaise) : 0;
  return { loyaltyDiscountPaise: points > 0 ? points * program.paisePerPoint : 0, pointsUsed: points, pointsEarned: earned, storeCreditPaise: credit, customer };
}

export function commitSaleBalances(state, action, sale, loyalty) {
  if (!loyalty?.customer) return state;
  const nextPoints = loyalty.customer.loyaltyPoints - loyalty.pointsUsed + loyalty.pointsEarned;
  if (nextPoints < 0) fail('Not enough loyalty points.');
  const nextCredit = loyalty.customer.balancePaise - loyalty.storeCreditPaise;
  if (nextCredit < 0) fail('Not enough store credit.');
  const ledger = lists(state);
  const entries = [];
  if (loyalty.pointsUsed) {
    entries.push({ id: `lyl-${sale.id}-redeem`, tenantId: action.tenantId, customerId: loyalty.customer.id, saleId: sale.id, points: -loyalty.pointsUsed, type: 'REDEEM', createdAt: sale.createdAt });
  }
  if (loyalty.pointsEarned) {
    entries.push({ id: `lyl-${sale.id}-earn`, tenantId: action.tenantId, customerId: loyalty.customer.id, saleId: sale.id, points: loyalty.pointsEarned, type: 'EARN', createdAt: sale.createdAt });
  }
  const credits = loyalty.storeCreditPaise ? [{
    id: `crd-${sale.id}-redeem`,
    tenantId: action.tenantId,
    customerId: loyalty.customer.id,
    saleId: sale.id,
    amountPaise: loyalty.storeCreditPaise,
    type: 'REDEEM',
    createdAt: sale.createdAt,
    note: 'Store credit applied to a simulated sale. This is not a bank payment.',
  }] : [];
  return {
    ...state,
    customers: patchCustomer(state, loyalty.customer.id, { loyaltyPoints: nextPoints, balancePaise: nextCredit }),
    loyaltyLedger: [...entries, ...ledger.loyaltyLedger],
    creditLedger: [...credits, ...ledger.creditLedger],
  };
}

export function reverseLoyaltyOnReturn(state, sale, amountPaise) {
  const earned = sale.loyaltyPointsEarned || 0;
  const redeemed = sale.loyaltyPointsRedeemed || 0;
  if ((!earned && !redeemed) || !sale.customerId || !sale.totalPaise) return { state, loyaltyPointsReversed: 0, loyaltyPointsRestored: 0 };
  const prior = (state.returns || []).filter((item) => item.saleId === sale.id);
  const reversedAlready = prior.reduce((sum, item) => sum + (item.loyaltyPointsReversed || 0), 0);
  const restoredAlready = prior.reduce((sum, item) => sum + (item.loyaltyPointsRestored || 0), 0);
  const reversed = Math.min(earned - reversedAlready, Math.floor((earned * amountPaise) / sale.totalPaise));
  const restored = Math.min(redeemed - restoredAlready, Math.floor((redeemed * amountPaise) / sale.totalPaise));
  const customer = state.customers.find((item) => item.id === sale.customerId);
  if (!customer) return { state, loyaltyPointsReversed: reversed, loyaltyPointsRestored: restored };
  const points = Math.max(0, customer.loyaltyPoints - reversed + restored);
  const ledger = lists(state);
  const entries = [];
  if (reversed) entries.push({ id: `lyl-rev-${sale.id}-${reversedAlready}`, tenantId: sale.tenantId, customerId: customer.id, saleId: sale.id, points: -reversed, type: 'REVERSAL', createdAt: new Date().toISOString() });
  if (restored) entries.push({ id: `lyl-back-${sale.id}-${restoredAlready}`, tenantId: sale.tenantId, customerId: customer.id, saleId: sale.id, points: restored, type: 'RESTORE', createdAt: new Date().toISOString() });
  return {
    state: { ...state, customers: patchCustomer(state, customer.id, { loyaltyPoints: points }), loyaltyLedger: [...entries, ...ledger.loyaltyLedger] },
    loyaltyPointsReversed: reversed,
    loyaltyPointsRestored: restored,
  };
}

export function issueStoreCredit(state, action) {
  const ledger = lists(state);
  if (action.clientKey && ledger.creditLedger.some((item) => item.clientKey === action.clientKey)) {
    fail('This store credit was already issued.');
  }
  const sale = state.sales.find((item) => item.id === action.saleId && item.tenantId === action.tenantId);
  if (!sale) fail('Original sale was not found.');
  if (!sale.customerId) fail('Store credit needs a customer on the original sale.');
  const returned = state.returns.filter((item) => item.saleId === sale.id).reduce((sum, item) => sum + item.amountPaise, 0);
  const refunded = (state.refunds || []).filter((item) => item.saleId === sale.id && item.status !== 'FAILED').reduce((sum, item) => sum + item.amountPaise, 0);
  const credited = creditedPaise(state, sale.id);
  const amountPaise = Math.round(action.amountPaise);
  if (amountPaise <= 0) fail('Enter a store credit amount.');
  if (amountPaise + credited + refunded > returned) fail('Store credit cannot exceed the unpaid return value.');
  const customer = customerOf(state, action.tenantId, sale.customerId);
  const entry = {
    id: `crd-${Date.now().toString(36)}`,
    tenantId: action.tenantId,
    customerId: customer.id,
    saleId: sale.id,
    returnId: action.returnId || null,
    amountPaise,
    type: 'ISSUE',
    clientKey: action.clientKey || null,
    createdAt: new Date().toISOString(),
    note: 'Store credit issued from a return. This is not a bank refund.',
  };
  return {
    ...state,
    customers: patchCustomer(state, customer.id, { balancePaise: customer.balancePaise + amountPaise }),
    creditLedger: [entry, ...ledger.creditLedger],
  };
}

export function createExchange(state, action) {
  const book = lists(state);
  if (action.clientKey && book.exchanges.some((item) => item.clientKey === action.clientKey)) {
    fail('This exchange was already recorded.');
  }
  const sale = state.sales.find((item) => item.id === action.saleId && item.tenantId === action.tenantId);
  if (!sale) fail('Original sale was not found.');
  if (!action.lines?.length || !action.replacements?.length) fail('Choose an item to exchange and a replacement.');
  const lines = action.lines.map((line) => {
    const original = sale.lines[line.lineIndex];
    if (!original) fail('That line is not on the invoice.');
    const qty = Math.round(line.qty);
    const eligible = eligibleSoldQty(state, sale, line.lineIndex);
    if (qty <= 0 || qty > eligible) fail(`Exchange quantity for ${original.name} exceeds the quantity still eligible.`);
    const amountPaise = Math.round((original.totalPaise * qty) / original.qty);
    return { lineIndex: line.lineIndex, qty, amountPaise, name: original.name, productId: original.productId };
  });
  const replacements = action.replacements.map((line) => {
    const product = state.products.find((item) => item.id === line.productId && item.tenantId === action.tenantId);
    if (!product) fail('Replacement product was not found in this business.');
    const qty = Math.round(line.qty);
    if (qty <= 0) fail('Replacement quantity must be at least 1.');
    if (stockAt(product, sale.branchId) < qty) fail(`Not enough stock for ${product.name} at this branch.`);
    return {
      productId: product.id,
      name: product.name,
      qty,
      unitPricePaise: Math.round(Number(product.price) * 100),
      discountPaise: 0,
      taxRate: product.taxRate || 0,
    };
  });
  const replacementQuote = quoteCart(replacements, 0);
  const returnValuePaise = lines.reduce((sum, line) => sum + line.amountPaise, 0);
  const differencePaise = replacementQuote.totalPaise - returnValuePaise;
  const payments = (action.payments || []).map((payment) => ({
    method: payment.method || 'cash',
    amountPaise: Math.round(payment.amountPaise || 0),
    status: 'SIMULATED',
    label: 'Simulated exchange settlement — no bank transfer',
  }));
  const paid = payments.reduce((sum, payment) => sum + payment.amountPaise, 0);
  let settlement = 'EVEN';
  if (differencePaise > 0) {
    if (paid < differencePaise) fail('Payment does not cover the exchange difference.');
    settlement = 'CUSTOMER_PAYS';
  } else if (differencePaise < 0) {
    settlement = action.settle === 'store_credit' ? 'STORE_CREDIT' : 'SIMULATED_REFUND';
    if (settlement === 'STORE_CREDIT' && !sale.customerId) fail('Store credit needs a customer on the original sale.');
  }
  let products = state.products;
  let next = { ...state, products };
  for (const line of lines) {
    products = products.map((product) => product.id === line.productId ? stockDelta(product, sale.branchId, line.qty) : product);
  }
  for (const line of replacementQuote.lines) {
    const product = products.find((item) => item.id === line.productId);
    if (stockAt(product, sale.branchId) < line.qty) fail(`Not enough stock for ${product.name} at this branch.`);
    products = products.map((item) => item.id === line.productId ? stockDelta(item, sale.branchId, -line.qty) : item);
  }
  next = { ...state, products };
  if (settlement === 'STORE_CREDIT') {
    const customer = customerOf(next, action.tenantId, sale.customerId);
    const credit = Math.abs(differencePaise);
    next = {
      ...next,
      customers: patchCustomer(next, customer.id, { balancePaise: customer.balancePaise + credit }),
      creditLedger: [{
        id: `crd-ex-${Date.now().toString(36)}`,
        tenantId: action.tenantId,
        customerId: customer.id,
        saleId: sale.id,
        amountPaise: credit,
        type: 'ISSUE',
        createdAt: new Date().toISOString(),
        note: 'Store credit from an exchange. This is not a bank refund.',
      }, ...(next.creditLedger || [])],
    };
  }
  const exchange = {
    id: `ex-${Date.now().toString(36)}`,
    tenantId: action.tenantId,
    saleId: sale.id,
    invoiceNo: sale.invoiceNo,
    branchId: sale.branchId,
    lines,
    replacements: replacementQuote.lines,
    returnValuePaise,
    replacementPaise: replacementQuote.totalPaise,
    differencePaise,
    settlement,
    payments,
    clientKey: action.clientKey || null,
    createdAt: new Date().toISOString(),
    note: settlement === 'SIMULATED_REFUND' ? 'Difference recorded as a simulated refund. No money was transferred.' : 'Exchange linked to the original sale. The original invoice was not overwritten.',
  };
  return { ...next, exchanges: [exchange, ...book.exchanges] };
}

function stockDelta(product, branchId, delta) {
  const current = stockAt(product, branchId);
  const nextQty = current + delta;
  if (nextQty < 0) fail(`Not enough stock for ${product.name}.`);
  const stockByBranch = { ...product.stockByBranch, [branchId]: nextQty };
  const stock = Object.values(stockByBranch).reduce((sum, qty) => sum + qty, 0);
  return { ...product, stockByBranch, stock };
}

export function returnedPurchaseQty(state, purchaseId, lineIndex) {
  return (state.purchaseReturns || [])
    .filter((item) => item.purchaseId === purchaseId)
    .flatMap((item) => item.lines)
    .filter((line) => line.lineIndex === lineIndex)
    .reduce((sum, line) => sum + line.qty, 0);
}

export function createPurchaseReturn(state, action) {
  const book = lists(state);
  if (action.clientKey && book.purchaseReturns.some((item) => item.clientKey === action.clientKey)) {
    fail('This purchase return was already recorded.');
  }
  const purchase = state.purchases.find((item) => item.id === action.purchaseId && item.tenantId === action.tenantId);
  if (!purchase) fail('Purchase was not found in this business.');
  if (purchase.status && purchase.status !== 'RECEIVED') fail('Only a received purchase can be returned.');
  const reasons = new Set(['Damaged goods', 'Wrong item', 'Defective goods', 'Excess quantity', 'Other']);
  if (!reasons.has(action.reason)) fail('Choose a return reason.');
  if (!action.lines?.length) fail('Select an item to return.');
  const lines = action.lines.map((line) => {
    const original = purchase.lines[line.lineIndex];
    if (!original) fail('That line is not on the purchase.');
    const qty = Math.round(line.qty);
    const eligible = original.qty - returnedPurchaseQty(state, purchase.id, line.lineIndex);
    if (qty <= 0 || qty > eligible) fail(`Return quantity for ${original.name || 'item'} exceeds the quantity received.`);
    const product = state.products.find((item) => item.id === original.productId && item.tenantId === action.tenantId);
    if (!product) fail('Product was not found in this business.');
    if (stockAt(product, purchase.branchId) < qty) fail(`Not enough stock at this branch to return ${product.name}.`);
    const unitCostPaise = original.unitCostPaise != null
      ? Math.round(Number(original.unitCostPaise))
      : Math.round(Number(product.costPrice || 0) * 100);
    return { lineIndex: line.lineIndex, productId: product.id, name: product.name, qty, unitCostPaise, amountPaise: unitCostPaise * qty };
  });
  let products = state.products;
  for (const line of lines) {
    products = products.map((product) => product.id === line.productId ? stockDelta(product, purchase.branchId, -line.qty) : product);
  }
  const record = {
    id: `prt-${Date.now().toString(36)}`,
    tenantId: action.tenantId,
    purchaseId: purchase.id,
    supplierId: purchase.supplierId,
    branchId: purchase.branchId,
    lines,
    reason: action.reason,
    note: String(action.note || '').trim(),
    amountPaise: lines.reduce((sum, line) => sum + line.amountPaise, 0),
    settlement: 'PENDING',
    settlementNote: 'Supplier credit note is not issued from this screen.',
    clientKey: action.clientKey || null,
    createdAt: new Date().toISOString(),
  };
  return { ...state, products, purchaseReturns: [record, ...book.purchaseReturns] };
}
