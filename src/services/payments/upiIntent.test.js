import QRCode from 'qrcode';
import { describe, expect, it } from 'vitest';
import { quoteCart } from '../demo/money.js';
import { isValidVpa, merchantUpiConfig, upiPaymentUri } from './upiIntent.js';

describe('UPI payment intent', () => {
  it('rejects missing or invalid merchant details', () => {
    expect(merchantUpiConfig({})).toBe(null);
    expect(merchantUpiConfig({ upiVpa: 'not-a-vpa', upiPayeeName: 'Takshi Silks' })).toBe(null);
    expect(isValidVpa('shop@okaxis')).toBe(true);
    expect(upiPaymentUri({ vpa: 'shop@okaxis', name: 'A', amountPaise: 100 })).toBe(null);
  });

  it('encodes the quoted payable amount and regenerates when that amount changes', async () => {
    const quote = quoteCart([
      { qty: 1, unitPricePaise: 280000, discountPaise: 0, taxRate: 6 },
    ], 0);
    expect(quote.totalPaise).toBe(296800);
    const uri = upiPaymentUri({
      vpa: 'takshi@okaxis',
      name: 'Takshi Silks',
      amountPaise: quote.totalPaise,
      reference: 'B1A296800',
      note: 'Bill',
    });
    expect(uri.startsWith('upi://pay?')).toBe(true);
    expect(uri).toContain('am=2968.00');
    expect(uri).toContain('pa=takshi%40okaxis');
    expect(uri).toContain('tr=B1A296800');
    const changed = upiPaymentUri({
      vpa: 'takshi@okaxis',
      name: 'Takshi Silks',
      amountPaise: quote.totalPaise + 100,
      reference: 'B2A296900',
    });
    expect(changed).not.toBe(uri);
    expect(changed).toContain('am=2969.00');
    const svg = await QRCode.toString(uri, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
    expect(svg).toContain('<svg');
    expect(svg).not.toContain('upi://pay');
  });
});
