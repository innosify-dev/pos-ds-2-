import { describe, expect, it } from 'vitest';
import { applyDemoAction } from './engine.js';
import { quoteCart } from './money.js';
import { hasPermission, landingPath, permissionForPath } from './permissions.js';
import { createSeed, ensureRequiredAccounts } from './seed.js';
import { evaluateLogin } from './store.js';

const seed = () => createSeed(new Date('2026-10-13T10:00:00.000Z'));

describe('quoteCart', () => {
  it('keeps money in integer paise and applies tax after the bill discount', () => {
    const quote = quoteCart([
      { qty: 2, unitPricePaise: 10000, discountPaise: 0, taxRate: 5 },
    ], 1000);
    expect(quote.subtotalPaise).toBe(20000);
    expect(quote.discountPaise).toBe(1000);
    expect(quote.taxPaise).toBe(950);
    expect(quote.totalPaise).toBe(19950);
  });
});

describe('sales, returns, and tenant isolation', () => {
  it('deducts stock, rejects overselling, and keeps catalogs separate', () => {
    const state = seed();
    const before = state.products.find((item) => item.id === 'p-cotton').stockByBranch['b-takshi-main'];
    const sold = applyDemoAction(state, {
      type: 'sale.create',
      tenantId: 't-takshi',
      branchId: 'b-takshi-main',
      registerId: 'r-takshi-1',
      cashierId: 'u-cashier',
      lines: [{ productId: 'p-cotton', qty: 1, discountPaise: 0 }],
      payments: [{ method: 'cash', amountPaise: 296800 }],
    });
    const product = sold.products.find((item) => item.id === 'p-cotton');
    expect(product.stockByBranch['b-takshi-main']).toBe(before - 1);
    expect(sold.sales[0].invoiceNo).toMatch(/^TAK-/);
    expect(sold.sales[0].payments[0].status).toBe('SIMULATED');
    expect(sold.products.filter((item) => item.tenantId === 't-fresh').some((item) => item.id === 'p-cotton')).toBe(false);

    expect(() => applyDemoAction(sold, {
      type: 'sale.create',
      tenantId: 't-takshi',
      branchId: 'b-takshi-main',
      registerId: 'r-takshi-1',
      cashierId: 'u-cashier',
      lines: [{ productId: 'p-cotton', qty: 99, discountPaise: 0 }],
      payments: [{ method: 'cash', amountPaise: 99999999 }],
    })).toThrow(/Not enough stock/);
  });

  it('rejects a return larger than the sold quantity and a refund larger than the return', () => {
    const state = seed();
    const sold = applyDemoAction(state, {
      type: 'sale.create',
      tenantId: 't-fresh',
      branchId: 'b-fresh',
      registerId: state.registers.find((item) => item.tenantId === 't-fresh').id,
      cashierId: 'u-fresh',
      lines: [{ productId: 'p-rice', qty: 1, discountPaise: 0 }],
      payments: [{ method: 'cash', amountPaise: 33600 }],
    });
    const sale = sold.sales[0];
    expect(() => applyDemoAction(sold, {
      type: 'return.create',
      tenantId: 't-fresh',
      saleId: sale.id,
      lines: [{ lineIndex: 0, qty: 2, restock: true }],
    })).toThrow(/exceeds the quantity sold/);

    const returned = applyDemoAction(sold, {
      type: 'return.create',
      tenantId: 't-fresh',
      saleId: sale.id,
      lines: [{ lineIndex: 0, qty: 1, restock: true }],
    });
    const restocked = returned.products.find((item) => item.id === 'p-rice').stockByBranch['b-fresh'];
    const original = state.products.find((item) => item.id === 'p-rice').stockByBranch['b-fresh'];
    expect(restocked).toBe(original);
    expect(() => applyDemoAction(returned, {
      type: 'refund.create',
      tenantId: 't-fresh',
      saleId: sale.id,
      returnId: returned.returns[0].id,
      amountPaise: returned.returns[0].amountPaise + 1,
      method: 'cash',
    })).toThrow(/Refund cannot exceed/);
  });
});

describe('personal profile', () => {
  it('updates one account without changing other users or business names', () => {
    const state = seed();
    const beforeTenants = state.tenants.map((tenant) => tenant.name);
    const next = applyDemoAction(state, {
      type: 'user.profile',
      userId: 'u-multi',
      firstName: 'Meera',
      lastName: 'Iyer-Nair',
      phone: '+91 90000 11111',
      avatarDataUrl: null,
    });
    const updated = next.users.find((user) => user.id === 'u-multi');
    expect(updated.lastName).toBe('Iyer-Nair');
    expect(updated.phone).toBe('+91 90000 11111');
    expect(updated.email).toBe('owner@demo.multibiz.test');
    expect(next.users.find((user) => user.id === 'u-takshi').firstName).toBe('Lakshmi');
    expect(next.tenants.map((tenant) => tenant.name)).toEqual(beforeTenants);
    expect(next.memberships).toEqual(state.memberships);
  });

  it('rejects a profile photo that is not an image data URL', () => {
    const state = seed();
    expect(() => applyDemoAction(state, {
      type: 'user.profile',
      userId: 'u-cashier',
      firstName: 'Priya',
      lastName: 'Sharma',
      avatarDataUrl: 'https://example.test/photo.png',
    })).toThrow(/PNG, JPG, or WebP/);
  });
});

describe('plan limits and roles', () => {
  it('blocks a new register when the plan limit is already reached', () => {
    let state = seed();
    state = applyDemoAction(state, {
      type: 'subscription.assign',
      tenantId: 't-takshi',
      planCode: 'FREE',
      status: 'ACTIVE',
      actor: 'platform',
    });
    expect(() => applyDemoAction(state, {
      type: 'register.save',
      tenantId: 't-takshi',
      register: { name: 'Extra', code: 'REG-999', branchId: 'b-takshi-main' },
    })).toThrow(/PLAN_LIMIT|plan limit/);
  });

  it('sends cashiers to billing and denies settings', () => {
    expect(landingPath({ memberships: [{ status: 'ACTIVE', tenantId: 't-takshi', role: 'CASHIER' }], role: 'CASHIER' })).toBe('/retail/counter');
    expect(landingPath({
      memberships: [
        { status: 'ACTIVE', tenantId: 't-takshi' },
        { status: 'ACTIVE', tenantId: 't-fresh' },
      ],
      role: 'OWNER',
    })).toBe('/app/businesses');
    expect(hasPermission('CASHIER', permissionForPath('/retail/settings'))).toBe(false);
    expect(hasPermission('CASHIER', permissionForPath('/retail/pos'))).toBe(true);
    expect(hasPermission('CASHIER', permissionForPath('/retail/counter'))).toBe(true);
    expect(hasPermission('CASHIER', permissionForPath('/retail/stockroom'))).toBe(false);
    expect(hasPermission('INVENTORY_STAFF', permissionForPath('/retail/stockroom'))).toBe(true);
    expect(hasPermission('INVENTORY_STAFF', permissionForPath('/retail/counter'))).toBe(false);
    expect(hasPermission('INVENTORY_STAFF', permissionForPath('/retail/products/new'))).toBe(true);
    expect(landingPath({ memberships: [{ status: 'ACTIVE', tenantId: 't-takshi', role: 'INVENTORY_STAFF' }], role: 'INVENTORY_STAFF' })).toBe('/retail/stockroom');
    expect(landingPath({ memberships: [{ status: 'ACTIVE', tenantId: 't-takshi', role: 'BRANCH_MANAGER' }], role: 'BRANCH_MANAGER' })).toBe('/retail/dashboard');
    expect(landingPath({ memberships: [], role: 'OWNER' })).toBe('/app/businesses/new');
  });
});

describe('customer accounts', () => {
  it('creates a signup with no business and rejects invalid or duplicate emails', () => {
    const state = seed();
    expect(() => applyDemoAction(state, { type: 'user.signup', fullName: 'Asha Rao', email: 'not-an-email', password: 'Demo@12345' })).toThrow(/valid email/);
    expect(() => applyDemoAction(state, { type: 'user.signup', fullName: 'Asha Rao', email: 'asha@example.test', password: 'short' })).toThrow(/8 characters/);
    expect(() => applyDemoAction(state, { type: 'user.signup', fullName: 'Asha Rao', email: 'owner@demo.takshi.test', password: 'Demo@12345' })).toThrow(/already exists/);

    const created = applyDemoAction(state, { type: 'user.signup', fullName: 'Asha Rao', email: 'asha@example.test', phone: '9876543210', password: 'Demo@12345' });
    const user = created.users.find((item) => item.email === 'asha@example.test');
    expect(user.firstName).toBe('Asha');
    expect(user.lastName).toBe('Rao');
    expect(user.phone).toBe('9876543210');
    expect(user.platformRole).toBe(null);
    expect(created.memberships.some((item) => item.userId === user.id)).toBe(false);
    expect(created.tenants).toHaveLength(state.tenants.length);
  });

  it('lets the same owner add another business and keeps staff on their own logins', () => {
    const state = seed();
    const owner = state.users.find((item) => item.email === 'owner@demo.takshi.test');
    const expanded = applyDemoAction(state, { type: 'business.create', userId: owner.id, name: 'Second Atelier', planCode: 'FREE' });
    const owned = expanded.memberships.filter((item) => item.userId === owner.id && item.status === 'ACTIVE');
    expect(owned).toHaveLength(2);
    expect(owned.every((item) => item.role === 'OWNER')).toBe(true);
    expect(landingPath({ memberships: owned, role: 'OWNER' })).toBe('/app/businesses');
    expect(expanded.tenants.find((item) => item.name === 'Takshi Silks').ownerUserId).toBe('u-takshi');
    expect(expanded.products.filter((item) => item.tenantId === 't-fresh')).toHaveLength(state.products.filter((item) => item.tenantId === 't-fresh').length);

    const login = evaluateLogin(state, { email: 'owner@demo.takshi.test', password: 'Demo@12345', scope: 'tenant' });
    expect(login.ok).toBe(true);
    expect(login.memberships).toHaveLength(1);
    expect(evaluateLogin(state, { email: 'cashier@demo.takshi.test', password: 'Demo@12345', scope: 'tenant' }).memberships[0].role).toBe('CASHIER');
    expect(evaluateLogin(state, { email: 'inventory@demo.takshi.test', password: 'Demo@12345', scope: 'tenant' }).memberships[0].role).toBe('INVENTORY_STAFF');
    expect(evaluateLogin(state, { email: 'manager@demo.takshi.test', password: 'Demo@12345', scope: 'tenant' }).memberships[0].branchIds).toEqual(['b-takshi-main']);
    expect(evaluateLogin(state, { email: 'superadmin@demo.innosify.test', password: 'Demo@12345', scope: 'tenant' }).ok).toBe(false);
    expect(evaluateLogin(state, { email: 'owner@demo.takshi.test', password: 'Demo@12345', scope: 'platform' }).ok).toBe(false);
  });

  it('keeps the demo catalog internally consistent', () => {
    const state = seed();
    const fresh = state.products.filter((item) => item.tenantId === 't-fresh');
    expect(fresh.length).toBeGreaterThanOrEqual(20);
    const barcodes = state.products.map((item) => item.barcode);
    expect(new Set(barcodes).size).toBe(barcodes.length);
    state.sales.forEach((entry) => {
      entry.lines.forEach((line) => {
        const product = state.products.find((item) => item.id === line.productId);
        expect(product?.tenantId).toBe(entry.tenantId);
      });
    });
    state.purchases.forEach((entry) => {
      expect(state.suppliers.some((supplier) => supplier.id === entry.supplierId && supplier.tenantId === entry.tenantId)).toBe(true);
      entry.lines.forEach((line) => {
        expect(state.products.some((item) => item.id === line.productId && item.tenantId === entry.tenantId)).toBe(true);
      });
    });
    expect(state.products.some((item) => item.tenantId === 't-takshi' && item.barcode === '8902000000036')).toBe(false);
    const kept = state.products.find((item) => item.tenantId === 't-takshi');
    const assigned = applyDemoAction(state, {
      type: 'product.save',
      tenantId: 't-takshi',
      product: { name: 'Internal code sample', sku: 'INN-SAMPLE', price: 100 },
    });
    const created = assigned.products.find((item) => item.sku === 'INN-SAMPLE');
    expect(created.barcode).toMatch(/^INN\d{8}$/);
    expect(assigned.products.find((item) => item.id === kept.id).barcode).toBe(kept.barcode);
    expect(() => applyDemoAction(assigned, {
      type: 'product.save',
      tenantId: 't-takshi',
      product: { name: 'Duplicate code', sku: 'INN-SAMPLE-2', barcode: created.barcode, price: 1 },
    })).toThrow(/Barcode already exists/);
  });

  it('stops a branch head from granting owner or platform access and restores missing seed accounts', () => {
    const state = seed();
    expect(() => applyDemoAction(state, { type: 'staff.invite', tenantId: 't-takshi', email: 'new.person@example.test', role: 'SUPER_ADMIN' })).toThrow(/cannot grant/);
    expect(() => applyDemoAction(state, { type: 'staff.invite', tenantId: 't-takshi', email: 'new.person@example.test', role: 'OWNER', actorRole: 'BRANCH_MANAGER' })).toThrow(/cannot grant/);
    expect(ensureRequiredAccounts(state)).toBe(state);
    const stripped = {
      ...state,
      users: state.users.filter((item) => item.id !== 'u-cashier'),
      memberships: state.memberships.filter((item) => item.userId !== 'u-cashier'),
    };
    const restored = ensureRequiredAccounts(stripped);
    expect(restored.users.filter((item) => item.email === 'cashier@demo.takshi.test')).toHaveLength(1);
    expect(restored.users.filter((item) => item.email === 'owner@demo.takshi.test')).toHaveLength(1);
    expect(restored.tenants).toBe(state.tenants);
  });

  it('keeps one cash expense movement and blocks a second register session', () => {
    const state = seed();
    expect(() => applyDemoAction(state, { type: 'register.open', id: 'r-takshi-1', openingCashPaise: 1000 })).toThrow(/already has an open session/);
    const withExpense = applyDemoAction(state, {
      type: 'expense.save',
      tenantId: 't-takshi',
      branchId: 'b-takshi-main',
      registerId: 'r-takshi-1',
      category: 'Packaging',
      description: 'Bags',
      amountPaise: 5000,
      method: 'cash',
    });
    expect(withExpense.expenses).toHaveLength(1);
    expect(withExpense.cashMoves.filter((move) => move.expenseId === withExpense.expenses[0].id)).toHaveLength(1);
    expect(() => applyDemoAction(withExpense, { type: 'register.close', id: 'r-takshi-1', closingCashPaise: 0 })).toThrow(/reason/);
    expect(() => applyDemoAction(state, {
      type: 'sale.create',
      tenantId: 't-takshi',
      branchId: 'b-takshi-city',
      registerId: 'r-takshi-3',
      cashierId: 'u-cashier',
      lines: [{ productId: 'p-cotton', qty: 1 }],
      payments: [{ method: 'cash', amountPaise: 296800 }],
    })).toThrow(/Open the register/);
  });
});
