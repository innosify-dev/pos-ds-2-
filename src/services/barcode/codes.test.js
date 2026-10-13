import QRCode from 'qrcode';
import { describe, expect, it } from 'vitest';
import CODE128AUTO from 'jsbarcode/src/barcodes/CODE128/CODE128_AUTO.js';
import { assignMissingBarcodes, findProductByScan, nextInternalBarcode, qrPayload, scanLookupValue } from './codes.js';

describe('product identification codes', () => {
  it('assigns a unique internal Code 128 value without touching existing codes', () => {
    const used = new Set(['8901000000011', 'INN00000001']);
    expect(nextInternalBarcode(used)).toBe('INN00000002');
    expect(used.has('8901000000011')).toBe(true);
  });

  it('encodes only the lookup value in a product QR payload', async () => {
    const payload = qrPayload('8901000000059');
    expect(payload).toBe('8901000000059');
    const svg = await QRCode.toString(payload, { type: 'svg', margin: 2, errorCorrectionLevel: 'M' });
    expect(svg).toContain('<svg');
    expect(svg).not.toContain('upi://');
  });

  it('resolves manufacturer barcodes, internal codes, SKUs, and variant codes', () => {
    const products = [
      { id: 'p1', barcode: '8901000000059', sku: 'ORG00601', details: { combos: [{ barcode: 'INN00000009', sku: 'ORG-RED' }] } },
      { id: 'p2', barcode: 'INN00000003', sku: 'PLAIN01', details: { combos: [] } },
    ];
    expect(findProductByScan(products, '8901000000059')?.id).toBe('p1');
    expect(findProductByScan(products, 'org00601')?.id).toBe('p1');
    expect(findProductByScan(products, 'INN00000009')?.id).toBe('p1');
    expect(findProductByScan(products, 'INN00000003')?.id).toBe('p2');
    expect(findProductByScan(products, 'missing')).toBe(null);
    expect(findProductByScan(products, '{"barcode":"8901000000059"}')?.id).toBe('p1');
    expect(scanLookupValue('INN00000003')).toBe('INN00000003');
  });

  it('assigns internal codes only where a barcode is missing', () => {
    const product = {
      barcode: '8901000000011',
      details: { combos: [{ sku: 'RED', barcode: '' }, { sku: 'BLUE', barcode: '8901000000099' }] },
    };
    const next = assignMissingBarcodes(product, ['8901000000011', 'INN00000001']);
    expect(next.barcode).toBe('8901000000011');
    expect(next.details.combos[0].barcode).toBe('INN00000002');
    expect(next.details.combos[1].barcode).toBe('8901000000099');
  });

  it('encodes Code 128 for an internal identifier and rejects the payment URI', () => {
    const encoded = new CODE128AUTO('INN00000002', {}).encode();
    expect(encoded.text).toBe('INN00000002');
    expect(encoded.data).toMatch(/^[01]+$/);
    expect(encoded.data.length).toBeGreaterThan(20);
  });
});
