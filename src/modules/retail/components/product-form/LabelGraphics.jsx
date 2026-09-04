import { useMemo } from 'react';
import { cn } from '@utils/cn';

/** Deterministic pseudo-random bits from a string seed. */
function bits(seed, count) {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  const out = [];
  let x = h >>> 0 || 1;
  for (let i = 0; i < count; i += 1) {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    out.push((x >>> 0) % 2);
  }
  return out;
}

export function FakeQr({ seed, className }) {
  const n = 21;
  const cells = useMemo(() => bits(`qr:${seed}`, n * n), [seed]);
  const finder = (r0, c0) => {
    const rects = [];
    for (let r = 0; r < 7; r += 1) {
      for (let c = 0; c < 7; c += 1) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (edge || core) rects.push(<rect key={`${r}-${c}`} x={c0 + c} y={r0 + r} width="1" height="1" />);
      }
    }
    return rects;
  };
  const inFinder = (r, c) =>
    (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className={cn('h-28 w-28 text-content', className)} shapeRendering="crispEdges" aria-label="QR code preview">
      {cells.map((b, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        if (!b || inFinder(r, c)) return null;
        return <rect key={i} x={c} y={r} width="1" height="1" fill="currentColor" />;
      })}
      <g fill="currentColor">
        {finder(0, 0)}
        {finder(0, n - 7)}
        {finder(n - 7, 0)}
      </g>
    </svg>
  );
}

export function FakeBarcode({ seed, className, hideLabel }) {
  const bars = useMemo(() => bits(`bar:${seed}`, 60), [seed]);
  return (
    <div aria-label="Barcode preview">
      <svg viewBox="0 0 120 36" className={cn('h-9 w-36 text-content', className)} shapeRendering="crispEdges">
        {bars.map((b, i) => (
          <rect key={i} x={i * 2} y="0" width={b ? 2 : 1} height="30" fill="currentColor" />
        ))}
      </svg>
      {!hideLabel && <p className="mt-1 text-center text-[10px] tracking-widest text-content-muted">{seed}</p>}
    </div>
  );
}

export function formatLabelPrice(value) {
  const n = Number(value);
  if (value === '' || Number.isNaN(n)) return '—';
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BrandMark({ className }) {
  return (
    <p className={cn('font-serif text-lg font-bold italic text-danger', className)}>Nalli</p>
  );
}

/**
 * Render a single label template element with live variant data.
 * Geometry (mm) is applied by the caller.
 */
export function LabelElement({ element, combo, productName }) {
  const sku = combo?.sku ?? 'SKU';
  const selling = combo?.selling ?? '';

  switch (element.type) {
    case 'brand':
      return <BrandMark className="text-center" />;
    case 'productName':
      return (
        <p
          className="text-center text-content"
          style={{
            fontFamily: element.font || 'inherit',
            fontSize: element.fontSize ? `${element.fontSize * 0.35}mm` : undefined,
            fontWeight: element.bold ? 700 : 400,
            fontStyle: element.italic ? 'italic' : 'normal',
            textAlign: element.align || 'center',
          }}
        >
          {productName || 'Product'}
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
        <div className="flex justify-center">
          <FakeQr seed={sku} className="h-full w-full" />
        </div>
      );
    case 'barcode':
      return (
        <div className="flex flex-col items-center">
          <FakeBarcode seed={sku} className="h-full w-full" hideLabel />
          <p className="mt-0.5 text-center tracking-widest text-content" style={{ fontSize: '2.6mm' }}>{sku}</p>
        </div>
      );
    case 'price':
      return (
        <p
          className="text-center font-bold text-content"
          style={{
            fontFamily: element.font || 'inherit',
            fontSize: element.fontSize ? `${element.fontSize * 0.35}mm` : undefined,
          }}
        >
          {formatLabelPrice(selling)}
        </p>
      );
    case 'sku':
      return <p className="text-center tracking-widest text-content" style={{ fontSize: '2.6mm' }}>{sku}</p>;
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
