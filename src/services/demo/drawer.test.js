import { describe, expect, it } from 'vitest';
import { cashTenderPaise, expectedDrawerPaise } from './drawer.js';

const openedAt = '2026-10-13T09:00:00.000Z';

describe('register drawer', () => {
  it('counts only the cash part of a split tender and ignores UPI and card', () => {
    expect(cashTenderPaise({
      payments: [{ method: 'upi', amountPaise: 6000 }, { method: 'cash', amountPaise: 5000 }],
      changePaise: 1000,
    })).toBe(4000);
    expect(cashTenderPaise({ payments: [{ method: 'card', amountPaise: 8000 }], changePaise: 0 })).toBe(0);
  });

  it('builds expected cash once for sales, refunds, and cash movements', () => {
    const drawer = expectedDrawerPaise({
      openingCashPaise: 100000,
      openedAt,
      registerId: 'r1',
      sales: [
        { id: 's1', registerId: 'r1', createdAt: '2026-10-13T10:00:00.000Z', payments: [{ method: 'cash', amountPaise: 20000 }], changePaise: 0 },
        { id: 's2', registerId: 'r1', createdAt: '2026-10-13T11:00:00.000Z', payments: [{ method: 'upi', amountPaise: 15000 }], changePaise: 0 },
        { id: 's3', registerId: 'r1', createdAt: '2026-10-13T12:00:00.000Z', payments: [{ method: 'cash', amountPaise: 4000 }, { method: 'debit', amountPaise: 6000 }], changePaise: 0 },
        { id: 'other', registerId: 'r2', createdAt: '2026-10-13T12:00:00.000Z', payments: [{ method: 'cash', amountPaise: 99999 }], changePaise: 0 },
      ],
      refunds: [
        { saleId: 's1', method: 'cash', amountPaise: 5000, createdAt: '2026-10-13T13:00:00.000Z' },
        { saleId: 's2', method: 'upi', amountPaise: 15000, createdAt: '2026-10-13T13:00:00.000Z' },
      ],
      cashMoves: [
        { registerId: 'r1', direction: 'in', amountPaise: 3000, createdAt: '2026-10-13T09:30:00.000Z' },
        { registerId: 'r1', direction: 'out', amountPaise: 2000, createdAt: '2026-10-13T14:00:00.000Z', expenseId: 'ex1' },
      ],
    });
    expect(drawer.cashSalesPaise).toBe(24000);
    expect(drawer.cashRefundsPaise).toBe(5000);
    expect(drawer.expectedPaise).toBe(100000 + 24000 + 3000 - 5000 - 2000);
    expect(drawer.methodTotals.upi).toBe(15000);
    expect(drawer.methodTotals.debit).toBe(6000);
  });
});
