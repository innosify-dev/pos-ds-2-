import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { qrPayload } from '@services/barcode/codes.js';
import { cn } from '@utils/cn';

export function formatLabelPrice(value) {
  const n = Number(value);
  if (value === '' || value == null || Number.isNaN(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BrandMark({ className }) {
  const { tenant } = useTenant();
  return (
    <div className={cn('flex items-center justify-center gap-[1mm]', className)}>
      {tenant?.logoDataUrl ? <img src={tenant.logoDataUrl} alt="" className="h-[4mm] w-[4mm] object-contain" /> : null}
      <p className="truncate text-center text-[2.4mm] font-semibold text-content">
        {tenant?.name || 'Business'}
      </p>
    </div>
  );
}

/** Standards-compliant Code 128. Renders nothing decorative when the value is missing or invalid. */
export function ProductCode128({ value, className, hideLabel = false }) {
  const code = String(value || '').trim();
  const svgRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = svgRef.current;
    if (!node || !code) return undefined;
    try {
      JsBarcode(node, code, {
        format: 'CODE128',
        displayValue: false,
        margin: 8,
        height: 48,
        width: 1.6,
        background: '#ffffff',
        lineColor: '#111827',
      });
      setFailed(false);
    } catch {
      node.replaceChildren();
      setFailed(true);
    }
    return undefined;
  }, [code]);

  if (!code) {
    return <p className="text-center text-[2.2mm] text-content-muted">No barcode assigned</p>;
  }

  return (
    <div className={cn('flex h-full w-full flex-col items-center justify-center bg-white', className)}>
      {failed ? (
        <p className="text-center text-[2.2mm] text-content-muted">This value cannot be encoded as Code 128.</p>
      ) : (
        <svg ref={svgRef} className="h-full max-h-full w-full" role="img" aria-label={`Code 128 ${code}`} />
      )}
      {!hideLabel && <p className="mt-0.5 text-center tracking-widest text-content" style={{ fontSize: '2.4mm' }}>{code}</p>}
    </div>
  );
}

function productQrSvg(payload) {
  const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
  const cells = qr.modules.size;
  const margin = 2;
  const size = cells + margin * 2;
  let marks = '';
  for (let row = 0; row < cells; row += 1) {
    for (let col = 0; col < cells; col += 1) {
      if (qr.modules.get(row, col)) marks += `<rect x="${col + margin}" y="${row + margin}" width="1" height="1"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#ffffff"/><g fill="#111827">${marks}</g></svg>`;
}

/** Product lookup QR. The payload is the scan code only. */
export function ProductQr({ value, className }) {
  const payload = qrPayload(value);
  let svg = '';
  if (payload) {
    try {
      svg = productQrSvg(payload);
    } catch {
      svg = '';
    }
  }

  if (!payload) return <p className="text-center text-[2.2mm] text-content-muted">No QR payload</p>;
  if (!svg) return <p className="text-center text-[2.2mm] text-content-muted">QR could not be created</p>;
  return (
    <div
      className={cn('flex h-full w-full items-center justify-center bg-white [&_svg]:h-full [&_svg]:w-full', className)}
      role="img"
      aria-label={`Product QR ${payload}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** Existing call sites. These now render real codes for the supplied value. */
export function FakeQr({ seed, className }) {
  return <ProductQr value={seed} className={className} />;
}

export function FakeBarcode({ seed, className, hideLabel }) {
  return <ProductCode128 value={seed} className={className} hideLabel={hideLabel} />;
}

function scanCode(combo) {
  return String(combo?.barcode || '').trim();
}

/**
 * Render a single label template element with live product data.
 * Geometry (mm) is applied by the caller.
 */
export function LabelElement({ element, combo, productName }) {
  const sku = combo?.sku ?? '';
  const code = scanCode(combo);
  const selling = combo?.selling ?? combo?.price ?? '';
  const mrp = Number(combo?.mrp);
  const showMrp = Number.isFinite(mrp) && mrp > 0;
  const title = [productName || 'Product', combo?.variantName].filter(Boolean).join(' · ');

  switch (element.type) {
    case 'brand':
      return <BrandMark className="text-center" />;
    case 'productName':
      return (
        <p
          className="text-center text-content"
          style={{
            fontFamily: element.font || 'inherit',
            fontSize: element.fontSize ? `${element.fontSize * 0.35}mm` : '2.8mm',
            fontWeight: element.bold ? 700 : 600,
            fontStyle: element.italic ? 'italic' : 'normal',
            textAlign: element.align || 'center',
          }}
        >
          {title}
        </p>
      );
    case 'text':
      return (
        <p
          style={{
            fontFamily: element.font || 'inherit',
            fontSize: element.fontSize ? `${element.fontSize * 0.35}mm` : undefined,
            fontWeight: element.bold ? 700 : 400,
            fontStyle: element.italic ? 'italic' : 'normal',
            textAlign: element.align || 'left',
            color: element.color || 'inherit',
          }}
          className="text-content"
        >
          {element.text || 'Text'}
        </p>
      );
    case 'qr':
      return (
        <div className="flex h-full w-full justify-center">
          <ProductQr value={code} className="h-full w-full" />
        </div>
      );
    case 'barcode':
      return (
        <div className="flex h-full w-full flex-col items-center">
          <ProductCode128 value={code} className="min-h-0 flex-1" hideLabel />
          <p className="text-center tracking-widest text-content" style={{ fontSize: '2.4mm' }}>{code || 'No barcode'}</p>
        </div>
      );
    case 'price':
      return (
        <p
          className="text-center font-bold text-content"
          style={{
            fontFamily: element.font || 'inherit',
            fontSize: element.fontSize ? `${element.fontSize * 0.35}mm` : '3.2mm',
          }}
        >
          {formatLabelPrice(selling)}
          {showMrp ? <span className="mt-0.5 block text-[2.2mm] font-medium">MRP {formatLabelPrice(mrp)}</span> : null}
        </p>
      );
    case 'sku':
      return <p className="text-center tracking-widest text-content" style={{ fontSize: '2.4mm' }}>{sku || '—'}</p>;
    case 'line':
      return <div className="h-px w-full bg-content" />;
    case 'rectangle':
      return <div className="h-full w-full rounded-sm border-2 border-content" />;
    case 'image':
      return (
        <div className="flex h-full w-full items-center justify-center rounded-sm bg-surface-muted text-content-muted">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-1/2 w-1/2">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m5 18 5-5 3 3 3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      );
    default:
      return null;
  }
}
