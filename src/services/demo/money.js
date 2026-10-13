/** Integer money helpers. Amounts are stored in paise (1 rupee = 100 paise). */

export function rupeesToPaise(rupees) {
  const value = Number(rupees);
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100);
}

export function paiseToRupees(paise) {
  return (Number(paise) || 0) / 100;
}

export function formatPaise(paise, currency = 'INR') {
  const amount = paiseToRupees(paise);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
}

export function formatRupees(rupees, currency = 'INR') {
  return formatPaise(rupeesToPaise(rupees), currency);
}

/**
 * Quote a cart. All outputs are integers in paise.
 * Line discounts apply first. The bill discount is spread across pre-tax line amounts.
 */
export function quoteCart(rawLines, billDiscountPaise = 0) {
  const prepared = rawLines.map((line) => {
    const qty = Math.max(0, Math.round(Number(line.qty) || 0));
    const unitPricePaise = Math.max(0, Math.round(Number(line.unitPricePaise) || 0));
    const gross = qty * unitPricePaise;
    const lineDiscountPaise = Math.min(gross, Math.max(0, Math.round(Number(line.discountPaise) || 0)));
    const taxRate = Math.max(0, Math.round(Number(line.taxRate) || 0));
    return {
      ...line,
      qty,
      unitPricePaise,
      taxRate,
      grossPaise: gross,
      lineDiscountPaise,
      taxablePaise: gross - lineDiscountPaise,
    };
  });

  const subtotalPaise = prepared.reduce((sum, line) => sum + line.taxablePaise, 0);
  const billDiscount = Math.min(subtotalPaise, Math.max(0, Math.round(Number(billDiscountPaise) || 0)));

  let allocated = 0;
  const lines = prepared.map((line, index) => {
    const isLast = index === prepared.length - 1;
    const share = subtotalPaise === 0
      ? 0
      : isLast
        ? billDiscount - allocated
        : Math.floor((billDiscount * line.taxablePaise) / subtotalPaise);
    allocated += share;
    const taxable = line.taxablePaise - share;
    const taxPaise = Math.round((taxable * line.taxRate) / 100);
    return {
      ...line,
      billDiscountPaise: share,
      taxablePaise: taxable,
      taxPaise,
      totalPaise: taxable + taxPaise,
    };
  });

  const taxPaise = lines.reduce((sum, line) => sum + line.taxPaise, 0);
  const totalPaise = lines.reduce((sum, line) => sum + line.totalPaise, 0);
  return {
    lines,
    subtotalPaise,
    discountPaise: prepared.reduce((sum, line) => sum + line.lineDiscountPaise, 0) + billDiscount,
    billDiscountPaise: billDiscount,
    taxPaise,
    totalPaise,
  };
}
