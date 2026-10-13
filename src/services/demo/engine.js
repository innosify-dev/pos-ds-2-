import { nextInternalBarcode } from '../barcode/codes.js';
import {
  applySaleLoyalty,
  commitSaleBalances,
  configureLoyalty,
  createExchange,
  createPurchaseReturn,
  creditedPaise,
  eligibleSoldQty,
  issueStoreCredit,
  loyaltyDiscountPaise,
  loyaltyProgram,
  reverseLoyaltyOnReturn,
  saveCustomer,
} from './customerFlows.js';
import { expectedDrawerPaise } from './drawer.js';
import { quoteCart } from './money.js';

export function demoError(message, code = 'DEMO_RULE') {
  const error = new Error(message);
  error.code = code;
  return error;
}

export function branchStock(product, branchId) {
  return product?.stockByBranch?.[branchId] ?? 0;
}

export function totalStock(product) {
  return Object.values(product?.stockByBranch ?? {}).reduce((sum, qty) => sum + qty, 0);
}

export function stockStatus(product) {
  const stock = totalStock(product);
  if (stock <= 0) return 'Out of Stock';
  if (stock <= (product.lowStock ?? 0)) return 'Low Stock';
  if (product.status === 'Inactive' || product.status === 'Draft') return product.status;
  return 'Active';
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function tenantOf(state, tenantId) {
  const tenant = state.tenants.find((item) => item.id === tenantId);
  if (!tenant) throw demoError('Business was not found');
  return tenant;
}

function planOf(state, code) {
  return state.plans.find((plan) => plan.code === code);
}

export function subscriptionFor(state, tenantId) {
  return state.subscriptions.find((item) => item.tenantId === tenantId) ?? null;
}

export function usageFor(state, tenantId) {
  const plan = planOf(state, subscriptionFor(state, tenantId)?.planCode);
  const month = new Date().toISOString().slice(0, 7);
  return {
    branches: state.branches.filter((item) => item.tenantId === tenantId).length,
    registers: state.registers.filter((item) => item.tenantId === tenantId).length,
    users: state.memberships.filter((item) => item.tenantId === tenantId && item.status === 'ACTIVE').length,
    transactions: state.sales.filter((item) => item.tenantId === tenantId && item.createdAt.slice(0, 7) === month).length,
    limits: plan?.limits ?? { branches: 0, registers: 0, users: 0, transactionsPerMonth: 0 },
    plan,
  };
}

function assertLimit(state, tenantId, key) {
  const usage = usageFor(state, tenantId);
  const limit = usage.limits[key];
  const current = usage[key === 'transactionsPerMonth' ? 'transactions' : key];
  if (current >= limit) {
    throw demoError(`The ${usage.plan?.name ?? 'current'} plan limit for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been reached. Upgrade the subscription to continue.`, 'PLAN_LIMIT');
  }
}

function assertActiveTenant(state, tenantId) {
  const tenant = tenantOf(state, tenantId);
  if (tenant.status === 'SUSPENDED') throw demoError('This business is suspended.', 'TENANT_SUSPENDED');
  const subscription = subscriptionFor(state, tenantId);
  if (!subscription || ['EXPIRED', 'SUSPENDED', 'CANCELED'].includes(subscription.status)) {
    throw demoError('This subscription does not allow new transactions.', 'SUBSCRIPTION_BLOCKED');
  }
  if (subscription.status === 'TRIALING' && subscription.trialEndsAt && new Date(subscription.trialEndsAt).getTime() < Date.now()) {
    throw demoError('The free trial has ended.', 'TRIAL_EXPIRED');
  }
  return tenant;
}

export function returnedQty(state, saleId, lineIndex) {
  return state.returns
    .filter((item) => item.saleId === saleId)
    .flatMap((item) => item.lines)
    .filter((line) => line.lineIndex === lineIndex)
    .reduce((sum, line) => sum + line.qty, 0);
}

export { creditedPaise, eligibleSoldQty };

export function refundedPaise(state, saleId) {
  return state.refunds
    .filter((item) => item.saleId === saleId && item.status !== 'FAILED')
    .reduce((sum, item) => sum + item.amountPaise, 0);
}

function touchProduct(product) {
  return { ...product, stock: totalStock(product), status: stockStatus({ ...product, stock: totalStock(product) }) };
}

export function applyDemoAction(state, action) {
  switch (action.type) {
    case 'session.note':
      return state;
    case 'user.signup':
      return signup(state, action);
    case 'user.password':
      return setPassword(state, action);
    case 'user.profile':
      return updateProfile(state, action);
    case 'invitation.accept':
      return acceptInvitation(state, action);
    case 'business.create':
      return createBusiness(state, action);
    case 'tenant.update':
      return updateTenant(state, action);
    case 'tenant.suspend':
      return setTenantStatus(state, action, 'SUSPENDED');
    case 'tenant.reactivate':
      return setTenantStatus(state, action, 'ACTIVE');
    case 'preference.set':
      return {
        ...state,
        users: state.users.map((user) => user.id === action.userId ? { ...user, preferredTenantId: action.tenantId } : user),
      };
    case 'product.save':
      return saveProduct(state, action);
    case 'product.delete':
      return { ...state, products: state.products.filter((item) => item.id !== action.id) };
    case 'category.save':
      return saveNamed(state, 'categories', action);
    case 'category.delete': {
      const remove = new Set([action.id]);
      let grew = true;
      while (grew) {
        grew = false;
        state.categories.forEach((category) => {
          if (category.parentId && remove.has(category.parentId) && !remove.has(category.id)) {
            remove.add(category.id);
            grew = true;
          }
        });
      }
      return { ...state, categories: state.categories.filter((category) => !remove.has(category.id)) };
    }
    case 'brand.save':
      return saveNamed(state, 'brands', action);
    case 'brand.delete':
      return { ...state, brands: state.brands.filter((item) => item.id !== action.id) };
    case 'stock.adjust':
      return adjustStock(state, action);
    case 'stock.transfer':
      return transferStock(state, action);
    case 'purchase.create':
      return createPurchase(state, action);
    case 'supplier.save':
      return saveNamed(state, 'suppliers', action);
    case 'customer.save':
      return saveCustomer(state, { ...action, tenantId: action.tenantId || action.record?.tenantId });
    case 'loyalty.configure':
      return configureLoyalty(state, action);
    case 'exchange.create':
      return createExchange(state, action);
    case 'purchase.return':
      return createPurchaseReturn(state, action);
    case 'credit.issue':
      return issueStoreCredit(state, action);
    case 'customer.delete':
      return { ...state, customers: state.customers.filter((item) => item.id !== action.id) };
    case 'branch.save':
      return saveBranch(state, action);
    case 'register.save':
      return saveRegister(state, action);
    case 'register.delete':
      return { ...state, registers: state.registers.filter((item) => item.id !== action.id) };
    case 'register.open':
      return openRegister(state, action);
    case 'register.close':
      return closeRegister(state, action);
    case 'register.cash':
      return moveRegisterCash(state, action);
    case 'expense.save':
      return saveExpense(state, action);
    case 'staff.invite':
      return inviteStaff(state, action);
    case 'staff.update':
      return updateStaff(state, action);
    case 'sale.create':
      return createSale(state, action);
    case 'sale.hold':
      return { ...state, heldBills: [...state.heldBills.filter((item) => item.id !== action.bill.id), action.bill] };
    case 'sale.hold.delete':
      return { ...state, heldBills: state.heldBills.filter((item) => item.id !== action.id) };
    case 'return.create':
      return createReturn(state, action);
    case 'refund.create':
      return createRefund(state, action);
    case 'plan.save':
      return savePlan(state, action);
    case 'subscription.assign':
      return assignSubscription(state, action);
    case 'ticket.save':
      return saveNamed(state, 'tickets', action);
    case 'ticket.update':
      return {
        ...state,
        tickets: state.tickets.map((item) => item.id === action.id ? { ...item, ...action.patch } : item),
      };
    case 'audit.add':
      return { ...state, audit: [action.entry, ...state.audit].slice(0, 400) };
    case 'platform.settings':
      return { ...state, platformSettings: { ...state.platformSettings, ...action.patch } };
    case 'reset.tokens':
      return { ...state, resetTokens: [...state.resetTokens, action.token] };
    default:
      throw demoError(`Unknown demo action ${action.type}`);
  }
}

function audit(state, entry) {
  return {
    ...state,
    audit: [{ id: uid('aud'), createdAt: new Date().toISOString(), ...entry }, ...state.audit].slice(0, 400),
  };
}

function signup(state, action) {
  const email = String(action.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw demoError('Enter a valid email address.');
  if (state.users.some((user) => user.email === email)) throw demoError('An account with that email already exists.');
  if (!action.password || action.password.length < 8) throw demoError('Use at least 8 characters.');
  const fullName = String(action.fullName || '').trim();
  let firstName = String(action.firstName || '').trim();
  let lastName = String(action.lastName || '').trim();
  if (fullName) {
    const parts = fullName.split(/\s+/);
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  }
  if (!firstName) throw demoError('Enter your full name.');
  const phone = String(action.phone || '').trim();
  if (phone && !/^[0-9+\-\s()]{8,16}$/.test(phone)) throw demoError('Enter a valid mobile number.');
  const user = {
    id: uid('usr'),
    email,
    password: action.password,
    firstName,
    lastName,
    phone,
    status: 'ACTIVE',
    preferredTenantId: null,
    platformRole: null,
  };
  return audit({ ...state, users: [...state.users, user] }, {
    actor: user.email,
    action: 'account.signup',
    entityType: 'user',
    entityId: user.id,
    summary: `${user.firstName} created a demo account`,
  });
}

function updateProfile(state, action) {
  const user = state.users.find((item) => item.id === action.userId);
  if (!user) throw demoError('Account was not found.');
  const firstName = String(action.firstName ?? user.firstName ?? '').trim();
  const lastName = String(action.lastName ?? user.lastName ?? '').trim();
  if (!firstName) throw demoError('Enter your name.');
  const phone = String(action.phone ?? user.phone ?? '').trim();
  if (phone && !/^[0-9+\-\s()]{8,16}$/.test(phone)) throw demoError('Enter a valid mobile number.');
  let avatarDataUrl = user.avatarDataUrl || '';
  if (action.avatarDataUrl === null) {
    avatarDataUrl = '';
  } else if (typeof action.avatarDataUrl === 'string') {
    if (action.avatarDataUrl && !/^data:image\/(png|jpeg|webp);base64,/.test(action.avatarDataUrl)) {
      throw demoError('Use a PNG, JPG, or WebP image.');
    }
    if (action.avatarDataUrl.length > 700_000) {
      throw demoError('That image is too large for demo storage. Use a file under 512 KB.');
    }
    avatarDataUrl = action.avatarDataUrl;
  }
  const tenants = state.tenants;
  const next = audit({
    ...state,
    users: state.users.map((item) => (
      item.id === user.id
        ? { ...item, firstName, lastName, phone, avatarDataUrl }
        : item
    )),
  }, {
    actor: user.email,
    action: 'account.profile',
    entityType: 'user',
    entityId: user.id,
    summary: 'Personal profile updated in this browser',
  });
  if (next.tenants !== tenants) throw demoError('Profile updates must not change business records.');
  return next;
}

function setPassword(state, action) {
  const token = state.resetTokens.find((item) => item.token === action.token && !item.usedAt);
  if (!token) throw demoError('This reset link is invalid or already used.');
  return {
    ...state,
    users: state.users.map((user) => user.email === token.email ? { ...user, password: action.password } : user),
    resetTokens: state.resetTokens.map((item) => item.token === action.token ? { ...item, usedAt: new Date().toISOString() } : item),
  };
}

function acceptInvitation(state, action) {
  const invitation = state.invitations.find((item) => item.token === action.token && item.status === 'PENDING');
  if (!invitation) throw demoError('This invitation is no longer available.');
  let users = state.users;
  let user = users.find((item) => item.email === invitation.email);
  if (!user) {
    user = {
      id: uid('usr'),
      email: invitation.email,
      password: action.password || 'Demo@12345',
      firstName: action.firstName || invitation.firstName || 'Invited',
      lastName: action.lastName || invitation.lastName || 'Staff',
      status: 'ACTIVE',
      preferredTenantId: invitation.tenantId,
    };
    users = [...users, user];
  }
  const membership = {
    id: uid('mem'),
    userId: user.id,
    tenantId: invitation.tenantId,
    role: invitation.role,
    branchIds: invitation.branchIds ?? [],
    status: 'ACTIVE',
    shift: 'billing',
    rating: 4.5,
  };
  return audit({
    ...state,
    users,
    memberships: [...state.memberships, membership],
    invitations: state.invitations.map((item) => item.id === invitation.id ? { ...item, status: 'ACCEPTED' } : item),
  }, {
    tenantId: invitation.tenantId,
    actor: user.email,
    action: 'staff.accepted',
    entityType: 'invitation',
    entityId: invitation.id,
    summary: `${user.email} accepted an invitation as ${invitation.role}`,
  });
}

function createBusiness(state, action) {
  const tenantId = uid('ten');
  const slug = action.slug || action.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (state.tenants.some((item) => item.slug === slug)) throw demoError('That business name is already in use in this demo.');
  const plan = planOf(state, action.planCode || 'FREE');
  if (!plan) throw demoError('Choose a plan.');
  const branchId = uid('br');
  const tenant = {
    id: tenantId,
    slug,
    name: action.name.trim(),
    legalName: action.legalName?.trim() || action.name.trim(),
    type: action.businessType || 'retail',
    logoDataUrl: action.logoDataUrl || null,
    primaryColor: action.primaryColor || '#6B238F',
    secondaryColor: action.secondaryColor || '#EEE4F5',
    currency: 'INR',
    gstin: action.gstin || '',
    phone: action.phone || '',
    email: action.email || '',
    address: action.address || '',
    city: action.city || '',
    invoiceName: action.name.trim(),
    receiptFooter: 'Thank you for shopping with us. This is a demo receipt.',
    taxInclusive: false,
    status: 'ACTIVE',
    ownerUserId: action.userId,
  };
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + (plan.trialDays || 0));
  const subscription = {
    id: uid('sub'),
    tenantId,
    planCode: plan.code,
    status: plan.trialDays > 0 && action.planCode !== 'FREE' ? 'TRIALING' : 'ACTIVE',
    trialEndsAt: plan.trialDays > 0 ? trialEnds.toISOString() : null,
    renewsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    history: [{ at: new Date().toISOString(), type: 'ASSIGNED', planCode: plan.code, note: 'Selected during onboarding' }],
  };
  return audit({
    ...state,
    tenants: [...state.tenants, tenant],
    subscriptions: [...state.subscriptions, subscription],
    branches: [...state.branches, {
      id: branchId,
      tenantId,
      name: action.branchName || 'Main Branch',
      code: 'MAIN',
      address: action.address || '',
      city: action.city || '',
      isDefault: true,
      phone: action.phone || '',
    }],
    registers: [...state.registers, {
      id: uid('reg'),
      tenantId,
      branchId,
      name: 'Register 01',
      code: 'REG-001',
      isActive: true,
      status: 'Closed',
      cashierId: null,
      openingCashPaise: 0,
      currentCashPaise: 0,
      openedAt: null,
      allowCash: true,
      allowCard: true,
      allowUpi: true,
    }],
    memberships: [...state.memberships, {
      id: uid('mem'),
      userId: action.userId,
      tenantId,
      role: 'OWNER',
      branchIds: [branchId],
      status: 'ACTIVE',
      shift: 'floor',
      rating: 5,
    }],
    invoiceSeq: { ...state.invoiceSeq, [tenantId]: 1000 },
  }, {
    tenantId,
    actor: action.userId,
    action: 'tenant.created',
    entityType: 'tenant',
    entityId: tenantId,
    summary: `Created ${tenant.name} on the ${plan.name} plan`,
  });
}

function updateTenant(state, action) {
  return audit({
    ...state,
    tenants: state.tenants.map((tenant) => tenant.id === action.tenantId ? { ...tenant, ...action.patch } : tenant),
  }, {
    tenantId: action.tenantId,
    actor: action.actor || 'user',
    action: 'tenant.updated',
    entityType: 'tenant',
    entityId: action.tenantId,
    summary: 'Business profile updated',
  });
}

function setTenantStatus(state, action, status) {
  return audit({
    ...state,
    tenants: state.tenants.map((tenant) => tenant.id === action.tenantId ? { ...tenant, status } : tenant),
  }, {
    tenantId: action.tenantId,
    actor: action.actor || 'platform',
    action: status === 'SUSPENDED' ? 'tenant.suspended' : 'tenant.reactivated',
    entityType: 'tenant',
    entityId: action.tenantId,
    summary: status === 'SUSPENDED' ? 'Business suspended' : 'Business reactivated',
  });
}

function saveNamed(state, key, action) {
  const record = { ...action.record };
  if (!record.id) record.id = uid(key.slice(0, 3));
  if (!record.tenantId) throw demoError('Missing business.');
  const list = state[key];
  const exists = list.some((item) => item.id === record.id);
  return { ...state, [key]: exists ? list.map((item) => item.id === record.id ? { ...item, ...record } : item) : [...list, record] };
}

function saveProduct(state, action) {
  const product = { ...action.product, tenantId: action.tenantId };
  if (!product.name?.trim()) throw demoError('Product name is required.');
  if (!product.sku?.trim()) throw demoError('SKU is required.');
  const siblings = state.products.filter((item) => item.tenantId === action.tenantId && item.id !== product.id);
  if (siblings.some((item) => item.sku.toLowerCase() === product.sku.toLowerCase())) throw demoError('SKU already exists in this business.');
  if (!product.barcode) product.barcode = nextBarcode(state, action.tenantId);
  if (siblings.some((item) => item.barcode === product.barcode)) throw demoError('Barcode already exists in this business.');
  if (!product.stockByBranch) {
    const branch = state.branches.find((item) => item.tenantId === action.tenantId && item.isDefault) || state.branches.find((item) => item.tenantId === action.tenantId);
    product.stockByBranch = { [branch?.id || 'unassigned']: Number(product.stock) || 0 };
  }
  product.lowStock = Number(product.lowStock ?? 5);
  product.price = Number(product.price) || 0;
  product.costPrice = Number(product.costPrice ?? 0);
  product.taxRate = Number(product.taxRate ?? 0);
  const next = touchProduct(product);
  const exists = state.products.some((item) => item.id === next.id);
  if (!next.id) next.id = uid('prd');
  return audit({
    ...state,
    products: exists ? state.products.map((item) => item.id === next.id ? next : item) : [...state.products, next],
  }, {
    tenantId: action.tenantId,
    actor: action.actor || 'user',
    action: exists ? 'product.updated' : 'product.created',
    entityType: 'product',
    entityId: next.id,
    summary: next.name,
  });
}

function nextBarcode(state, tenantId) {
  const used = new Set(state.products.filter((item) => item.tenantId === tenantId).map((item) => item.barcode));
  return nextInternalBarcode(used);
}

function withStock(state, productId, branchId, delta) {
  return state.products.map((product) => {
    if (product.id !== productId) return product;
    const current = branchStock(product, branchId);
    const nextQty = current + delta;
    if (nextQty < 0 && !product.allowNegative) throw demoError(`Not enough stock for ${product.name}.`);
    const stockByBranch = { ...product.stockByBranch, [branchId]: nextQty };
    return touchProduct({ ...product, stockByBranch });
  });
}

function adjustStock(state, action) {
  assertActiveTenant(state, action.tenantId);
  const delta = Math.round(Number(action.delta));
  if (!delta) throw demoError('Enter a quantity.');
  return audit({
    ...state,
    products: withStock(state, action.productId, action.branchId, delta),
    stockMoves: [...state.stockMoves, {
      id: uid('mov'),
      tenantId: action.tenantId,
      productId: action.productId,
      branchId: action.branchId,
      type: 'ADJUSTMENT',
      delta,
      reason: action.reason || 'Manual adjustment',
      createdAt: new Date().toISOString(),
    }],
  }, {
    tenantId: action.tenantId,
    actor: action.actor || 'user',
    action: 'stock.adjusted',
    entityType: 'product',
    entityId: action.productId,
    summary: `${delta > 0 ? '+' : ''}${delta} units`,
  });
}

function transferStock(state, action) {
  const qty = Math.round(Number(action.qty));
  if (qty <= 0) throw demoError('Transfer quantity must be positive.');
  if (action.fromBranchId === action.toBranchId) throw demoError('Choose two different branches.');
  let products = withStock(state, action.productId, action.fromBranchId, -qty);
  products = withStock({ ...state, products }, action.productId, action.toBranchId, qty);
  return audit({
    ...state,
    products,
    stockMoves: [...state.stockMoves, {
      id: uid('mov'),
      tenantId: action.tenantId,
      productId: action.productId,
      type: 'TRANSFER',
      delta: qty,
      fromBranchId: action.fromBranchId,
      toBranchId: action.toBranchId,
      reason: action.reason || 'Branch transfer',
      createdAt: new Date().toISOString(),
    }],
  }, {
    tenantId: action.tenantId,
    actor: action.actor || 'user',
    action: 'stock.transferred',
    entityType: 'product',
    entityId: action.productId,
    summary: `Transferred ${qty} units`,
  });
}

function createPurchase(state, action) {
  assertActiveTenant(state, action.tenantId);
  let products = state.products;
  for (const line of action.lines) {
    products = withStock({ ...state, products }, line.productId, action.branchId, Math.round(line.qty));
  }
  const purchase = {
    id: uid('pur'),
    tenantId: action.tenantId,
    supplierId: action.supplierId,
    branchId: action.branchId,
    lines: action.lines,
    note: action.note || '',
    createdAt: new Date().toISOString(),
  };
  return audit({ ...state, products, purchases: [purchase, ...state.purchases] }, {
    tenantId: action.tenantId,
    actor: action.actor || 'user',
    action: 'purchase.created',
    entityType: 'purchase',
    entityId: purchase.id,
    summary: 'Purchase received into stock',
  });
}

function saveBranch(state, action) {
  const isNew = !action.branch.id;
  if (isNew) assertLimit(state, action.tenantId, 'branches');
  const branch = { ...action.branch, id: action.branch.id || uid('br'), tenantId: action.tenantId };
  if (!branch.name?.trim()) throw demoError('Branch name is required.');
  const list = state.branches;
  return audit({
    ...state,
    branches: list.some((item) => item.id === branch.id)
      ? list.map((item) => item.id === branch.id ? { ...item, ...branch } : item)
      : [...list, branch],
  }, {
    tenantId: action.tenantId,
    actor: action.actor || 'user',
    action: isNew ? 'branch.created' : 'branch.updated',
    entityType: 'branch',
    entityId: branch.id,
    summary: branch.name,
  });
}

function saveRegister(state, action) {
  const isNew = !action.register.id;
  if (isNew) assertLimit(state, action.tenantId, 'registers');
  const register = {
    status: 'Closed',
    isActive: true,
    openingCashPaise: 0,
    currentCashPaise: 0,
    openedAt: null,
    allowCash: true,
    allowCard: true,
    allowUpi: true,
    ...action.register,
    id: action.register.id || uid('reg'),
    tenantId: action.tenantId,
  };
  if (!register.name?.trim() || !register.code?.trim()) throw demoError('Register name and code are required.');
  const list = state.registers;
  return {
    ...state,
    registers: list.some((item) => item.id === register.id)
      ? list.map((item) => item.id === register.id ? { ...item, ...register } : item)
      : [...list, register],
  };
}

function openRegister(state, action) {
  const current = state.registers.find((register) => register.id === action.id);
  if (!current) throw demoError('Register was not found.');
  if (current.status === 'Open') throw demoError('This register already has an open session.');
  const openingCashPaise = Math.round(action.openingCashPaise || 0);
  if (openingCashPaise < 0) throw demoError('Opening cash cannot be negative.');
  const sessionId = uid('ses');
  const openedAt = new Date().toISOString();
  const session = {
    id: sessionId,
    tenantId: current.tenantId,
    branchId: current.branchId,
    registerId: current.id,
    cashierId: action.cashierId || null,
    status: 'Open',
    openingCashPaise,
    openedAt,
  };
  return {
    ...state,
    registerSessions: [...(state.registerSessions || []), session],
    registers: state.registers.map((register) => register.id === action.id ? {
      ...register,
      status: 'Open',
      sessionId,
      openingCashPaise,
      currentCashPaise: openingCashPaise,
      cashierId: action.cashierId || register.cashierId,
      openedAt,
    } : register),
  };
}

function closeRegister(state, action) {
  const current = state.registers.find((register) => register.id === action.id);
  if (!current || current.status !== 'Open') throw demoError('This register is not open.');
  const counted = Math.round(action.closingCashPaise);
  if (!Number.isFinite(counted) || counted < 0) throw demoError('Enter the counted cash.');
  const drawer = expectedDrawerPaise({
    openingCashPaise: current.openingCashPaise,
    openedAt: current.openedAt,
    registerId: current.id,
    sales: state.sales,
    refunds: state.refunds,
    cashMoves: state.cashMoves || [],
  });
  const variance = counted - drawer.expectedPaise;
  const reason = String(action.reason || '').trim();
  if (variance !== 0 && !reason) throw demoError('Enter a reason for the cash difference.');
  const closedAt = new Date().toISOString();
  const summary = {
    status: 'Closed',
    closedAt,
    closingCashPaise: counted,
    expectedCashPaise: drawer.expectedPaise,
    differencePaise: variance,
    reason,
    cashSalesPaise: drawer.cashSalesPaise,
    cashRefundsPaise: drawer.cashRefundsPaise,
    cashInPaise: drawer.cashInPaise,
    cashOutPaise: drawer.cashOutPaise,
    methodTotals: drawer.methodTotals,
  };
  const sessions = state.registerSessions || [];
  const sessionId = current.sessionId;
  const nextSessions = sessionId && sessions.some((item) => item.id === sessionId)
    ? sessions.map((item) => item.id === sessionId ? { ...item, ...summary } : item)
    : [...sessions, { id: sessionId || uid('ses'), tenantId: current.tenantId, branchId: current.branchId, registerId: current.id, cashierId: current.cashierId, openingCashPaise: current.openingCashPaise, openedAt: current.openedAt, ...summary }];
  return {
    ...state,
    registerSessions: nextSessions,
    registers: state.registers.map((register) => register.id === action.id ? {
      ...register,
      status: 'Closed',
      sessionId: null,
      currentCashPaise: counted,
      closedAt,
      expectedCashPaise: drawer.expectedPaise,
      differencePaise: variance,
      closeReason: reason,
    } : register),
  };
}

function moveRegisterCash(state, action) {
  const register = state.registers.find((item) => item.id === action.registerId && item.tenantId === action.tenantId);
  if (!register || register.status !== 'Open') throw demoError('Open the register before moving cash.');
  const amountPaise = Math.round(action.amountPaise || 0);
  const direction = action.direction === 'out' ? 'out' : 'in';
  const reason = String(action.reason || '').trim();
  if (amountPaise <= 0) throw demoError('Enter a cash amount greater than zero.');
  if (!reason) throw demoError('Enter a reason for this cash movement.');
  const drawer = expectedDrawerPaise({
    openingCashPaise: register.openingCashPaise,
    openedAt: register.openedAt,
    registerId: register.id,
    sales: state.sales,
    refunds: state.refunds,
    cashMoves: state.cashMoves || [],
  });
  if (direction === 'out' && amountPaise > drawer.expectedPaise) throw demoError('That cash out is more than the expected cash in the drawer.');
  const move = {
    id: uid('csh'),
    tenantId: action.tenantId,
    branchId: register.branchId,
    registerId: register.id,
    sessionId: register.sessionId || null,
    direction,
    amountPaise,
    reason,
    actorId: action.actorId || null,
    expenseId: action.expenseId || null,
    createdAt: new Date().toISOString(),
  };
  const expectedPaise = drawer.expectedPaise + (direction === 'in' ? amountPaise : -amountPaise);
  return {
    ...state,
    cashMoves: [...(state.cashMoves || []), move],
    registers: state.registers.map((item) => item.id === register.id ? { ...item, currentCashPaise: expectedPaise } : item),
  };
}

const EXPENSE_METHODS = new Set(['cash', 'upi', 'card']);

function saveExpense(state, action) {
  const amountPaise = Math.round(action.amountPaise || 0);
  const category = String(action.category || '').trim();
  const description = String(action.description || '').trim();
  const method = action.method || 'cash';
  if (amountPaise <= 0) throw demoError('Enter an expense amount.');
  if (!category || !description) throw demoError('Category and description are required.');
  if (!EXPENSE_METHODS.has(method)) throw demoError('Choose cash, UPI, or card for this expense.');
  const expenseId = uid('exp');
  let next = state;
  if (method === 'cash') {
    if (!action.registerId) throw demoError('Choose the open register that paid this cash expense.');
    next = moveRegisterCash(state, {
      tenantId: action.tenantId,
      registerId: action.registerId,
      amountPaise,
      direction: 'out',
      reason: `Expense · ${category}: ${description}`,
      actorId: action.actorId,
      expenseId,
    });
  }
  const expense = {
    id: expenseId,
    tenantId: action.tenantId,
    branchId: action.branchId,
    registerId: method === 'cash' ? action.registerId : null,
    category,
    description,
    amountPaise,
    method,
    cashMoveId: method === 'cash' ? next.cashMoves[next.cashMoves.length - 1].id : null,
    createdAt: new Date().toISOString(),
    actorId: action.actorId || null,
  };
  return { ...next, expenses: [...(next.expenses || []), expense] };
}

function inviteStaff(state, action) {
  assertLimit(state, action.tenantId, 'users');
  const privileged = action.role === 'OWNER' || action.role === 'BUSINESS_ADMIN' || action.role === 'SUPER_ADMIN';
  const staffActor = action.actorRole === 'BRANCH_MANAGER' || action.actorRole === 'CASHIER' || action.actorRole === 'INVENTORY_STAFF';
  if (action.role === 'SUPER_ADMIN' || (privileged && staffActor)) {
    throw demoError('A branch team member cannot grant Owner/Admin or platform access.');
  }
  const email = action.email.trim().toLowerCase();
  const existingUser = state.users.find((user) => user.email === email);
  if (existingUser && state.memberships.some((item) => item.userId === existingUser.id && item.tenantId === action.tenantId && item.status === 'ACTIVE')) {
    throw demoError('That person is already on this business.');
  }
  if (action.assignNow && existingUser) {
    return audit({
      ...state,
      memberships: [...state.memberships, {
        id: uid('mem'),
        userId: existingUser.id,
        tenantId: action.tenantId,
        role: action.role,
        branchIds: action.branchIds ?? [],
        status: 'ACTIVE',
        shift: 'billing',
        rating: 4.5,
      }],
    }, {
      tenantId: action.tenantId,
      actor: action.actor || 'owner',
      action: 'staff.added',
      entityType: 'membership',
      summary: `${email} added as ${action.role}`,
    });
  }
  const invitation = {
    id: uid('inv'),
    tenantId: action.tenantId,
    email,
    role: action.role,
    branchIds: action.branchIds ?? [],
    token: uid('invite'),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  return audit({ ...state, invitations: [...state.invitations, invitation] }, {
    tenantId: action.tenantId,
    actor: action.actor || 'owner',
    action: 'staff.invited',
    entityType: 'invitation',
    entityId: invitation.id,
    summary: `Invited ${email} as ${action.role}`,
  });
}

function updateStaff(state, action) {
  return {
    ...state,
    memberships: state.memberships.map((item) => item.id === action.id ? { ...item, ...action.patch } : item),
  };
}

function createSale(state, action) {
  assertActiveTenant(state, action.tenantId);
  assertLimit(state, action.tenantId, 'transactionsPerMonth');
  if (!action.lines?.length) throw demoError('Add at least one product.');
  const priced = action.lines.map((line) => {
    const product = state.products.find((item) => item.id === line.productId && item.tenantId === action.tenantId);
    if (!product) throw demoError('A product in the cart is no longer available.');
    if (branchStock(product, action.branchId) < line.qty) throw demoError(`Not enough stock for ${product.name} at this branch.`);
    return {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      qty: Math.round(line.qty),
      unitPricePaise: rupeePrice(product),
      discountPaise: Math.round(line.discountPaise || 0),
      taxRate: product.taxRate || 0,
    };
  });
  const pointValue = loyaltyDiscountPaise(loyaltyProgram(state, action.tenantId), Math.round(Number(action.loyaltyPoints) || 0));
  const quote = quoteCart(priced, (action.billDiscountPaise || 0) + pointValue);
  const loyalty = applySaleLoyalty(state, action, quote);
  const payments = [...(action.payments || [])];
  if (loyalty.storeCreditPaise > 0) {
    payments.push({
      method: 'store_credit',
      amountPaise: loyalty.storeCreditPaise,
      status: 'SIMULATED',
      label: 'Store credit applied. Not a bank payment.',
    });
  }
  const paid = payments.reduce((sum, payment) => sum + Math.round(payment.amountPaise || 0), 0);
  if (paid < quote.totalPaise) throw demoError('Payment does not cover the bill.');
  const register = state.registers.find((item) => item.id === action.registerId);
  if (action.registerId && (!register || register.status !== 'Open')) throw demoError('Open the register before saving a sale.');
  let products = state.products;
  for (const line of quote.lines) {
    products = withStock({ ...state, products }, line.productId, action.branchId, -line.qty);
  }
  const seq = (state.invoiceSeq[action.tenantId] || 1000) + 1;
  const tenant = tenantOf(state, action.tenantId);
  const sale = {
    id: uid('sal'),
    tenantId: action.tenantId,
    branchId: action.branchId,
    registerId: action.registerId,
    cashierId: action.cashierId,
    customerId: action.customerId || null,
    invoiceNo: `${tenant.slug.slice(0, 3).toUpperCase()}-${seq}`,
    createdAt: new Date().toISOString(),
    lines: quote.lines,
    subtotalPaise: quote.subtotalPaise,
    discountPaise: quote.discountPaise,
    taxPaise: quote.taxPaise,
    totalPaise: quote.totalPaise,
    payments: payments.map((payment) => ({
      ...payment,
      amountPaise: Math.round(payment.amountPaise),
      status: 'SIMULATED',
      label: payment.method === 'store_credit' ? 'Store credit applied. Not a bank payment.' : 'Simulated payment — not verified by a gateway',
    })),
    loyaltyPointsRedeemed: loyalty.pointsUsed,
    loyaltyPointsEarned: loyalty.pointsEarned,
    loyaltyDiscountPaise: loyalty.loyaltyDiscountPaise,
    storeCreditPaise: loyalty.storeCreditPaise,
    changePaise: paid - quote.totalPaise,
    status: 'PAID',
  };
  const balanced = commitSaleBalances({ ...state, products }, action, sale, loyalty);
  const registers = state.registers.map((register) => {
    if (register.id !== action.registerId) return register;
    const cash = payments.filter((payment) => payment.method === 'cash').reduce((sum, payment) => sum + Math.round(payment.amountPaise), 0);
    return { ...register, currentCashPaise: (register.currentCashPaise || 0) + cash - sale.changePaise };
  });
  return audit({
    ...balanced,
    products,
    registers,
    sales: [sale, ...state.sales],
    invoiceSeq: { ...state.invoiceSeq, [action.tenantId]: seq },
    heldBills: state.heldBills.filter((item) => item.id !== action.heldBillId),
  }, {
    tenantId: action.tenantId,
    actor: action.cashierId,
    action: 'sale.completed',
    entityType: 'sale',
    entityId: sale.id,
    summary: `${sale.invoiceNo} · simulated payment`,
  });
}

function rupeePrice(product) {
  return Math.round(Number(product.price) * 100);
}

function createReturn(state, action) {
  const sale = state.sales.find((item) => item.id === action.saleId && item.tenantId === action.tenantId);
  if (!sale) throw demoError('Original sale was not found.');
  if (!action.lines?.length) throw demoError('Select an item to return.');
  const lines = action.lines.map((line) => {
    const original = sale.lines[line.lineIndex];
    if (!original) throw demoError('That line is not on the invoice.');
    const already = original.qty - eligibleSoldQty(state, sale, line.lineIndex);
    const qty = Math.round(line.qty);
    if (qty <= 0 || qty + already > original.qty) throw demoError(`Return quantity for ${original.name} exceeds the quantity sold.`);
    const amountPaise = Math.round((original.totalPaise * qty) / original.qty);
    return { lineIndex: line.lineIndex, qty, restock: Boolean(line.restock), amountPaise, name: original.name, productId: original.productId };
  });
  let products = state.products;
  if (action.lines.some((line) => line.restock)) {
    for (const line of lines) {
      if (line.restock) products = withStock({ ...state, products }, line.productId, sale.branchId, line.qty);
    }
  }
  const amountPaise = lines.reduce((sum, line) => sum + line.amountPaise, 0);
  const reversed = reverseLoyaltyOnReturn({ ...state, products }, sale, amountPaise);
  const record = {
    id: uid('ret'),
    tenantId: action.tenantId,
    saleId: sale.id,
    invoiceNo: sale.invoiceNo,
    lines,
    reason: action.reason || 'Customer return',
    amountPaise,
    loyaltyPointsReversed: reversed.loyaltyPointsReversed,
    loyaltyPointsRestored: reversed.loyaltyPointsRestored,
    createdAt: new Date().toISOString(),
  };
  return audit({ ...reversed.state, products, returns: [record, ...state.returns] }, {
    tenantId: action.tenantId,
    actor: action.actor || 'user',
    action: 'return.created',
    entityType: 'return',
    entityId: record.id,
    summary: `Return against ${sale.invoiceNo}`,
  });
}

function createRefund(state, action) {
  const sale = state.sales.find((item) => item.id === action.saleId && item.tenantId === action.tenantId);
  if (!sale) throw demoError('Original sale was not found.');
  const returned = state.returns.filter((item) => item.saleId === sale.id).reduce((sum, item) => sum + item.amountPaise, 0);
  const already = refundedPaise(state, sale.id) + creditedPaise(state, sale.id);
  const amountPaise = Math.round(action.amountPaise);
  if (amountPaise <= 0) throw demoError('Enter a refund amount.');
  if (amountPaise + already > returned) throw demoError('Refund cannot exceed the value of returned items.');
  if (amountPaise + already > sale.totalPaise) throw demoError('Refund cannot exceed the original sale.');
  const refund = {
    id: uid('rfd'),
    tenantId: action.tenantId,
    saleId: sale.id,
    returnId: action.returnId || null,
    invoiceNo: sale.invoiceNo,
    amountPaise,
    method: action.method || 'cash',
    status: 'SIMULATED',
    createdAt: new Date().toISOString(),
    note: 'Simulated refund — no money was transferred.',
  };
  const cashRefund = refund.method === 'cash';
  const registers = cashRefund
    ? state.registers.map((register) => {
      if (register.id !== sale.registerId || register.status !== 'Open') return register;
      return { ...register, currentCashPaise: Math.max(0, (register.currentCashPaise || 0) - amountPaise) };
    })
    : state.registers;
  return audit({ ...state, registers, refunds: [refund, ...state.refunds] }, {
    tenantId: action.tenantId,
    actor: action.actor || 'user',
    action: 'refund.created',
    entityType: 'refund',
    entityId: refund.id,
    summary: `Simulated refund for ${sale.invoiceNo}`,
  });
}

function savePlan(state, action) {
  const plan = { ...action.plan, code: action.plan.code.toUpperCase() };
  const exists = state.plans.some((item) => item.code === plan.code);
  return audit({
    ...state,
    plans: exists ? state.plans.map((item) => item.code === plan.code ? { ...item, ...plan } : item) : [...state.plans, plan],
  }, {
    actor: action.actor || 'platform',
    action: 'plan.saved',
    entityType: 'plan',
    entityId: plan.code,
    summary: plan.name,
  });
}

function assignSubscription(state, action) {
  const plan = planOf(state, action.planCode);
  if (!plan) throw demoError('Plan was not found.');
  const current = subscriptionFor(state, action.tenantId);
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + (action.extendTrialDays || plan.trialDays || 0));
  const next = {
    id: current?.id || uid('sub'),
    tenantId: action.tenantId,
    planCode: plan.code,
    status: action.status || (action.extendTrialDays ? 'TRIALING' : 'ACTIVE'),
    trialEndsAt: action.status === 'TRIALING' || action.extendTrialDays ? trialEnds.toISOString() : current?.trialEndsAt ?? null,
    renewsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    history: [{ at: new Date().toISOString(), type: action.eventType || 'PLAN_CHANGED', planCode: plan.code, note: action.note || 'Demo subscription change' }, ...(current?.history ?? [])],
  };
  return audit({
    ...state,
    subscriptions: current
      ? state.subscriptions.map((item) => item.tenantId === action.tenantId ? next : item)
      : [...state.subscriptions, next],
  }, {
    tenantId: action.tenantId,
    actor: action.actor || 'platform',
    action: 'subscription.changed',
    entityType: 'subscription',
    entityId: next.id,
    summary: `${plan.name} · ${next.status}`,
  });
}
