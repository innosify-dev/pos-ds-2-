/**
 * Product identification codes.
 * Internal codes are store-assigned Code 128 values. They are not GS1/EAN/GTIN.
 * Product QR encodes only this lookup value. It is not a payment QR.
 */

export const INTERNAL_BARCODE_PREFIX = 'INN';

export function qrPayload(code) {
  return String(code || '').trim();
}

export function productScanCode(product, combo) {
  const variantCode = String(combo?.barcode || '').trim();
  if (variantCode) return variantCode;
  return String(product?.barcode || '').trim();
}

/** Fill only blank product and variant barcodes. Existing manufacturer codes stay. */
export function assignMissingBarcodes(product, usedCodes) {
  const used = new Set((usedCodes || []).map((code) => String(code || '').trim()).filter(Boolean));
  const next = { ...product, details: product.details ? { ...product.details } : product.details };
  const current = String(next.barcode || '').trim();
  if (!current) {
    const code = nextInternalBarcode(used);
    used.add(code);
    next.barcode = code;
  } else {
    used.add(current);
    next.barcode = current;
  }
  const combos = Array.isArray(next.details?.combos) ? next.details.combos : null;
  if (combos) {
    next.details.combos = combos.map((combo) => {
      const existing = String(combo?.barcode || '').trim();
      if (existing) {
        used.add(existing);
        return { ...combo, barcode: existing };
      }
      const code = nextInternalBarcode(used);
      used.add(code);
      return { ...combo, barcode: code };
    });
  }
  return next;
}

export function nextInternalBarcode(used) {
  const taken = used instanceof Set ? used : new Set(used);
  let n = 1;
  let code = `${INTERNAL_BARCODE_PREFIX}${String(n).padStart(8, '0')}`;
  while (taken.has(code)) {
    n += 1;
    if (n > 99999999) {
      throw new Error('No unused internal barcode is available.');
    }
    code = `${INTERNAL_BARCODE_PREFIX}${String(n).padStart(8, '0')}`;
  }
  return code;
}

/** Keyboard-wedge text, or a small JSON object with barcode/sku/code. */
export function scanLookupValue(raw) {
  const value = String(raw || '').trim();
  if (!value.startsWith('{') || value.length > 200) return value;
  try {
    const parsed = JSON.parse(value);
    const code = parsed?.barcode || parsed?.sku || parsed?.code;
    if (typeof code === 'string' && code.trim() && code.length <= 80) return code.trim();
  } catch {
    /* treat the scan as plain text */
  }
  return value;
}

/** Match a keyboard-wedge scan against the current business catalog. */
export function findProductByScan(products, raw) {
  const value = scanLookupValue(raw);
  if (!value) return null;
  const lower = value.toLowerCase();
  return products.find((item) => {
    if (item.barcode && item.barcode === value) return true;
    if (String(item.sku || '').toLowerCase() === lower) return true;
    return (item.details?.combos || []).some((combo) => String(combo.barcode || '').trim() === value);
  }) || null;
}
