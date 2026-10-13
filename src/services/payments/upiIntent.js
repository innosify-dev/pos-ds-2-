/**
 * Dynamic UPI payment intent.
 * A URI and QR ask the customer's app to pay. They are not payment confirmation.
 * Merchant VPA and display name must come from the business profile. Never invent them.
 */

export function isValidVpa(value) {
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(String(value || '').trim());
}

export function merchantUpiConfig(tenant) {
  const vpa = String(tenant?.upiVpa || '').trim();
  const name = String(tenant?.upiPayeeName || '').trim();
  if (!isValidVpa(vpa) || name.length < 2 || name.length > 50) return null;
  return { vpa, name };
}

export function upiPaymentUri({ vpa, name, amountPaise, reference, note }) {
  if (!isValidVpa(vpa)) return null;
  const payee = String(name || '').trim();
  if (payee.length < 2) return null;
  const paise = Math.round(Number(amountPaise) || 0);
  if (paise <= 0) return null;
  const amount = (paise / 100).toFixed(2);
  const params = [
    ['pa', vpa.trim()],
    ['pn', payee.slice(0, 50)],
    ['am', amount],
    ['cu', 'INR'],
  ];
  const tr = String(reference || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 35);
  if (tr) params.push(['tr', tr]);
  const tn = String(note || '').trim().slice(0, 50);
  if (tn) params.push(['tn', tn]);
  const query = params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  return `upi://pay?${query}`;
}
