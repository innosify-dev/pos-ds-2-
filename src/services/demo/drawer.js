/**
 * Drawer math for one open register session.
 * Amounts are integer paise. Only cash tenders affect the drawer.
 * A split sale contributes its cash lines only. Change is subtracted once.
 * Cash-paid expenses must be stored as cash-out movements, not subtracted again.
 */

export function cashTenderPaise(sale) {
  const cash = (sale?.payments || [])
    .filter((payment) => payment.method === 'cash')
    .reduce((sum, payment) => sum + Math.round(payment.amountPaise || 0), 0);
  return cash - Math.round(sale?.changePaise || 0);
}

export function methodTotalsPaise(sales) {
  const totals = {};
  (sales || []).forEach((sale) => {
    (sale.payments || []).forEach((payment) => {
      const method = payment.method || 'other';
      totals[method] = (totals[method] || 0) + Math.round(payment.amountPaise || 0);
    });
    const change = Math.round(sale.changePaise || 0);
    if (change > 0) totals.cash = (totals.cash || 0) - change;
  });
  return totals;
}

function onOrAfter(iso, startMs) {
  if (!startMs) return true;
  return new Date(iso).getTime() >= startMs;
}

export function expectedDrawerPaise({
  openingCashPaise = 0,
  openedAt,
  registerId,
  sales = [],
  refunds = [],
  cashMoves = [],
}) {
  const start = openedAt ? new Date(openedAt).getTime() : 0;
  const sessionSales = sales.filter((sale) => sale.registerId === registerId && onOrAfter(sale.createdAt, start));
  const cashSales = sessionSales.reduce((sum, sale) => sum + cashTenderPaise(sale), 0);
  const saleById = new Map(sales.map((sale) => [sale.id, sale]));
  const cashRefunds = refunds.filter((refund) => {
    if (refund.method !== 'cash' || !onOrAfter(refund.createdAt, start)) return false;
    return saleById.get(refund.saleId)?.registerId === registerId;
  }).reduce((sum, refund) => sum + Math.round(refund.amountPaise || 0), 0);
  const moves = cashMoves.filter((move) => move.registerId === registerId && onOrAfter(move.createdAt, start));
  const cashIn = moves.filter((move) => move.direction === 'in').reduce((sum, move) => sum + Math.round(move.amountPaise || 0), 0);
  const cashOut = moves.filter((move) => move.direction === 'out').reduce((sum, move) => sum + Math.round(move.amountPaise || 0), 0);
  return {
    openingCashPaise: Math.round(openingCashPaise || 0),
    cashSalesPaise: cashSales,
    cashRefundsPaise: cashRefunds,
    cashInPaise: cashIn,
    cashOutPaise: cashOut,
    expectedPaise: Math.round(openingCashPaise || 0) + cashSales + cashIn - cashRefunds - cashOut,
    methodTotals: methodTotalsPaise(sessionSales),
    sales: sessionSales,
    moves,
  };
}
