import { describe, expect, it } from 'vitest';
import { applyDemoAction } from './engine.js';
import { createSeed } from './seed.js';

function pay(state, extra = {}) {
  const product = state.products.find((item) => item.id === 'p-cotton');
  const total = Math.round(product.price * 100 * 1.06);
  return applyDemoAction(state, {
    type: 'sale.create',
    tenantId: 't-takshi',
    branchId: 'b-takshi-main',
    registerId: 'r-takshi-1',
    cashierId: 'u-cashier',
    customerId: 'cu1',
    lines: [{ productId: 'p-cotton', qty: 1 }],
    payments: [{ method: 'cash', amountPaise: total + 5000 }],
    ...extra,
  });
}

describe('customers, exchanges, purchase returns, loyalty and store credit', () => {
  it('edits a customer without rewriting invoices or copying another business', () => {
    const state = createSeed();
    const saved = applyDemoAction(state, {
      type: 'customer.save',
      tenantId: 't-takshi',
      record: { id: 'cu1', name: 'Divya R.', phone: '9840011122', email: 'divya@example.test', city: 'Chennai', gstin: '33ABCDE1234F1Z5' },
    });
    const customer = saved.customers.find((item) => item.id === 'cu1');
    expect(customer.name).toBe('Divya R.');
    expect(customer.city).toBe('Chennai');
    expect(customer.loyaltyPoints).toBe(120);
    expect(saved.sales.find((item) => item.id === 'sal-1').customerId).toBe('cu1');
    expect(() => applyDemoAction(saved, {
      type: 'customer.save',
      tenantId: 't-takshi',
      record: { name: 'Copy', phone: '9840011122', email: 'other@example.test' },
    })).toThrow(/phone already exists/);
    expect(() => applyDemoAction(state, {
      type: 'customer.save',
      tenantId: 't-fresh',
      record: { id: 'cu1', name: 'Divya', phone: '9840011122' },
    })).toThrow(/not found/);
  });

  it('exchanges equal, higher, and partial quantities without changing the original sale', () => {
    const state = createSeed();
    const before = state.sales.find((item) => item.id === 'sal-2');
    const cottonBefore = state.products.find((item) => item.id === 'p-cotton').stockByBranch['b-takshi-main'];
    const even = applyDemoAction(state, {
      type: 'exchange.create',
      tenantId: 't-takshi',
      saleId: 'sal-2',
      clientKey: 'even-1',
      lines: [{ lineIndex: 0, qty: 1 }],
      replacements: [{ productId: 'p-cotton', qty: 1 }],
    });
    const exchange = even.exchanges[0];
    expect(exchange.differencePaise).toBe(0);
    expect(exchange.settlement).toBe('EVEN');
    expect(even.sales.find((item) => item.id === 'sal-2')).toEqual(before);
    expect(even.products.find((item) => item.id === 'p-cotton').stockByBranch['b-takshi-main']).toBe(cottonBefore);
    expect(() => applyDemoAction(even, {
      type: 'exchange.create',
      tenantId: 't-takshi',
      saleId: 'sal-2',
      clientKey: 'even-1',
      lines: [{ lineIndex: 0, qty: 1 }],
      replacements: [{ productId: 'p-cotton', qty: 1 }],
    })).toThrow(/already recorded/);

    const higher = applyDemoAction(state, {
      type: 'exchange.create',
      tenantId: 't-takshi',
      saleId: 'sal-2',
      lines: [{ lineIndex: 0, qty: 1 }],
      replacements: [{ productId: 'p-kanji', qty: 1 }],
      payments: [{ method: 'cash', amountPaise: 5000000 }],
    });
    expect(higher.exchanges[0].differencePaise).toBeGreaterThan(0);
    expect(higher.exchanges[0].settlement).toBe('CUSTOMER_PAYS');
    expect(higher.products.find((item) => item.id === 'p-cotton').stockByBranch['b-takshi-main']).toBe(cottonBefore + 1);
    expect(higher.products.find((item) => item.id === 'p-kanji').stockByBranch['b-takshi-main']).toBe(state.products.find((item) => item.id === 'p-kanji').stockByBranch['b-takshi-main'] - 1);

    const partial = applyDemoAction(higher, {
      type: 'exchange.create',
      tenantId: 't-takshi',
      saleId: 'sal-2',
      lines: [{ lineIndex: 0, qty: 1 }],
      replacements: [{ productId: 'p-soft', qty: 1 }],
      payments: [{ method: 'cash', amountPaise: 5000000 }],
    });
    expect(partial.exchanges).toHaveLength(2);
    expect(() => applyDemoAction(partial, {
      type: 'exchange.create',
      tenantId: 't-takshi',
      saleId: 'sal-2',
      lines: [{ lineIndex: 0, qty: 1 }],
      replacements: [{ productId: 'p-soft', qty: 1 }],
    })).toThrow(/exceeds/);
  });

  it('records a lower-price exchange as a simulated refund and keeps return stock single-counted', () => {
    const state = createSeed();
    const kanjiBefore = state.products.find((item) => item.id === 'p-kanji').stockByBranch['b-takshi-main'];
    const lower = applyDemoAction(state, {
      type: 'exchange.create',
      tenantId: 't-takshi',
      saleId: 'sal-1',
      lines: [{ lineIndex: 0, qty: 1 }],
      replacements: [{ productId: 'p-cotton', qty: 1 }],
      settle: 'simulated_refund',
    });
    expect(lower.exchanges[0].differencePaise).toBeLessThan(0);
    expect(lower.exchanges[0].settlement).toBe('SIMULATED_REFUND');
    expect(lower.exchanges[0].note).toMatch(/No money was transferred/);
    expect(lower.products.find((item) => item.id === 'p-kanji').stockByBranch['b-takshi-main']).toBe(kanjiBefore + 1);
    expect(() => applyDemoAction(lower, {
      type: 'return.create',
      tenantId: 't-takshi',
      saleId: 'sal-1',
      lines: [{ lineIndex: 0, qty: 1, restock: true }],
    })).toThrow(/exceeds/);
  });

  it('returns purchased goods only up to the received quantity and leaves supplier settlement pending', () => {
    const state = createSeed();
    const before = state.products.find((item) => item.id === 'p-cotton').stockByBranch['b-takshi-main'];
    const returned = applyDemoAction(state, {
      type: 'purchase.return',
      tenantId: 't-takshi',
      purchaseId: 'pur-takshi-1',
      reason: 'Damaged goods',
      clientKey: 'pr-1',
      lines: [{ lineIndex: 0, qty: 2 }],
    });
    expect(returned.purchaseReturns[0].settlement).toBe('PENDING');
    expect(returned.purchaseReturns[0].amountPaise).toBe(150000 * 2);
    expect(returned.products.find((item) => item.id === 'p-cotton').stockByBranch['b-takshi-main']).toBe(before - 2);
    expect(returned.purchases.find((item) => item.id === 'pur-takshi-1').lines[0].qty).toBe(6);
    expect(() => applyDemoAction(returned, {
      type: 'purchase.return',
      tenantId: 't-takshi',
      purchaseId: 'pur-takshi-1',
      reason: 'Excess quantity',
      lines: [{ lineIndex: 0, qty: 5 }],
    })).toThrow(/exceeds/);
    expect(() => applyDemoAction(state, {
      type: 'purchase.return',
      tenantId: 't-fresh',
      purchaseId: 'pur-takshi-1',
      reason: 'Wrong item',
      lines: [{ lineIndex: 0, qty: 1 }],
    })).toThrow(/not found/);
  });

  it('earns, redeems, and reverses loyalty only after an explicit rule', () => {
    const state = createSeed();
    expect(() => pay(state, { loyaltyPoints: 10 })).toThrow(/not configured/);
    const configured = applyDemoAction(state, {
      type: 'loyalty.configure',
      tenantId: 't-takshi',
      enabled: true,
      pointsPerSpendPaise: 10000,
      paisePerPoint: 100,
    });
    const sold = pay(configured, { loyaltyPoints: 10 });
    const sale = sold.sales[0];
    const customer = sold.customers.find((item) => item.id === 'cu1');
    expect(sale.loyaltyPointsRedeemed).toBe(10);
    expect(sale.loyaltyPointsEarned).toBeGreaterThan(0);
    expect(customer.loyaltyPoints).toBe(120 - 10 + sale.loyaltyPointsEarned);
    const returned = applyDemoAction(sold, {
      type: 'return.create',
      tenantId: 't-takshi',
      saleId: sale.id,
      lines: [{ lineIndex: 0, qty: 1, restock: true }],
    });
    const after = returned.customers.find((item) => item.id === 'cu1');
    expect(after.loyaltyPoints).toBe(customer.loyaltyPoints - sale.loyaltyPointsEarned + 10);
    const credit = applyDemoAction(returned, {
      type: 'credit.issue',
      tenantId: 't-takshi',
      saleId: sale.id,
      amountPaise: sale.totalPaise,
      clientKey: 'credit-1',
    });
    expect(credit.customers.find((item) => item.id === 'cu1').balancePaise).toBe(sale.totalPaise);
    expect(() => applyDemoAction(credit, {
      type: 'refund.create',
      tenantId: 't-takshi',
      saleId: sale.id,
      amountPaise: sale.totalPaise,
      method: 'cash',
    })).toThrow(/cannot exceed/);
    const redeemed = applyDemoAction(credit, {
      type: 'sale.create',
      tenantId: 't-takshi',
      branchId: 'b-takshi-main',
      registerId: 'r-takshi-1',
      customerId: 'cu1',
      lines: [{ productId: 'p-soft', qty: 1 }],
      storeCreditPaise: 10000,
      payments: [{ method: 'cash', amountPaise: 99999999 }],
    });
    expect(redeemed.customers.find((item) => item.id === 'cu1').balancePaise).toBe(sale.totalPaise - 10000);
    expect(redeemed.sales[0].payments.some((payment) => payment.method === 'store_credit')).toBe(true);
  });
});
