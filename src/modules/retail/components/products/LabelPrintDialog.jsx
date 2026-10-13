import { useEffect, useState } from 'react';
import { Modal } from '@shared/dialogs/Modal';
import { Button } from '@shared/ui/Button';
import { Select } from '@shared/ui/Select';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { BrandMark, ProductCode128, ProductQr, formatLabelPrice } from '@modules/retail/components/product-form/LabelGraphics.jsx';
import { LabelPrintSheet } from '@modules/retail/components/product-form/LabelPrintSheet.jsx';
import { TemplateLabel } from '@modules/retail/components/product-form/PrintPreviewModal.jsx';
import { loadTemplate } from '@modules/retail/components/product-form/labelTemplate.js';

const MAX_LABELS = 200;

const presets = [
  { id: '40x30', label: '40 × 30 mm', width: 40, height: 30 },
  { id: '50x25', label: '50 × 25 mm', width: 50, height: 25 },
  { id: '50x30', label: '50 × 30 mm', width: 50, height: 30 },
  { id: '60x40', label: '60 × 40 mm', width: 60, height: 40 },
  { id: '50x70', label: '50 × 70 mm', width: 50, height: 70 },
  { id: '40x60', label: '40 × 60 mm', width: 40, height: 60 },
  { id: '60x90', label: '60 × 90 mm', width: 60, height: 90 },
];

function unitsFor(product) {
  const combos = Array.isArray(product.details?.combos) ? product.details.combos : [];
  if (combos.length === 0) {
    return [{
      key: product.id,
      name: product.name,
      variantName: '',
      sku: product.sku,
      barcode: String(product.barcode || '').trim(),
      selling: product.price,
      mrp: product.mrp ?? product.details?.mrp,
    }];
  }
  return combos.map((combo, index) => ({
    key: combo.key || combo.sku || `${product.id}-${index}`,
    name: product.name,
    variantName: combo.name || '',
    sku: combo.sku || product.sku,
    barcode: String(combo.barcode || product.barcode || '').trim(),
    selling: combo.selling === '' || combo.selling == null ? product.price : combo.selling,
    mrp: combo.mrp,
  }));
}

function CompactLabel({ unit, width, height, show, border }) {
  return (
    <div
      className={border ? 'flex flex-col overflow-hidden border border-neutral-800 bg-white p-[1.5mm] text-black' : 'flex flex-col overflow-hidden bg-white p-[1.5mm] text-black'}
      style={{ width: `${width}mm`, height: `${height}mm` }}
    >
      {show.business && <BrandMark />}
      {show.name && (
        <p className="truncate text-center font-semibold" style={{ fontSize: '2.6mm' }}>
          {[unit.name, unit.variantName].filter(Boolean).join(' · ')}
        </p>
      )}
      <div className="flex min-h-0 flex-1 items-stretch gap-[1mm]">
        {show.barcode && <ProductCode128 value={unit.barcode} className="min-w-0 flex-1" hideLabel />}
        {show.qr && <ProductQr value={unit.barcode} className="aspect-square h-full max-w-[40%]" />}
      </div>
      {show.barcode && <p className="text-center tracking-widest" style={{ fontSize: '2.2mm' }}>{unit.barcode || 'No barcode'}</p>}
      <div className="flex items-center justify-between gap-1" style={{ fontSize: '2.3mm' }}>
        {show.sku ? <span className="truncate">{unit.sku}</span> : <span />}
        {show.price ? <span className="font-bold">{formatLabelPrice(unit.selling)}</span> : null}
      </div>
      {show.price && Number(unit.mrp) > 0 ? (
        <p className="text-right" style={{ fontSize: '2mm' }}>MRP {formatLabelPrice(unit.mrp)}</p>
      ) : null}
    </div>
  );
}

/**
 * Preview and browser-print labels for one or more catalog products.
 */
export function LabelPrintDialog({ open, products, onClose, onGenerate }) {
  const { tenant } = useTenant();
  const [presetId, setPresetId] = useState('50x30');
  const [page, setPage] = useState('label');
  const [layout, setLayout] = useState('compact');
  const [copies, setCopies] = useState({});
  const [printJob, setPrintJob] = useState(null);
  const [show, setShow] = useState({
    business: true,
    name: true,
    sku: true,
    price: true,
    barcode: true,
    qr: true,
  });
  const template = loadTemplate(tenant?.id);
  const preset = presets.find((item) => item.id === presetId) || presets[2];

  const productKey = products.map((product) => product.id).join('|');
  useEffect(() => {
    if (!open) return;
    setCopies((current) => Object.fromEntries(products.map((product) => [product.id, current[product.id] || 1])));
    setPrintJob(null);
    // Reset copies only when the selected product set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productKey]);

  if (!open) return null;

  const jobs = products.flatMap((product) => {
    const count = Math.max(1, Number(copies[product.id]) || 1);
    return unitsFor(product).flatMap((unit) => (
      Array.from({ length: count }, (_, copy) => ({ ...unit, copy, jobKey: `${product.id}-${unit.key}-${copy}` }))
    ));
  }).slice(0, MAX_LABELS);
  const missing = products.filter((product) => !String(product.barcode || '').trim());
  const canPrint = jobs.length > 0 && jobs.every((job) => job.barcode);

  const renderLabel = (unit) => (
    layout === 'template' ? (
      <TemplateLabel
        template={template}
        combo={unit}
        productName={unit.variantName ? `${unit.name}` : unit.name}
        widthMm={preset.width}
        heightMm={preset.height}
        printBorder
      />
    ) : (
      <CompactLabel unit={unit} width={preset.width} height={preset.height} show={show} border />
    )
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Barcode & labels"
      size="xl"
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-content-muted">Opens the browser print dialog. Cancel there if you do not want to print.</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button
              disabled={!canPrint}
              onClick={() => {
                if (jobs.length > 24 && !window.confirm(`Print ${jobs.length} labels?`)) return;
                setPrintJob({
                  id: Date.now(),
                  page,
                  width: preset.width,
                  height: preset.height,
                });
              }}
            >
              Print {jobs.length} label{jobs.length === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="space-y-3">
          <Select label="Label size" value={presetId} onChange={(event) => setPresetId(event.target.value)}>
            {presets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </Select>
          <Select label="Page" value={page} onChange={(event) => setPage(event.target.value)}>
            <option value="label">One label per page</option>
            <option value="a4">A4 sheet</option>
          </Select>
          <Select label="Layout" value={layout} onChange={(event) => setLayout(event.target.value)}>
            <option value="compact">Compact label</option>
            <option value="template">Saved template</option>
          </Select>
          {layout === 'compact' && (
            <fieldset className="space-y-1 text-xs text-content">
              <legend className="mb-1 text-sm font-medium">Show on label</legend>
              {Object.entries({ business: 'Business name', name: 'Product name', sku: 'SKU', price: 'Selling price', barcode: 'Barcode', qr: 'Product QR' }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={show[key]}
                    onChange={(event) => setShow((current) => ({ ...current, [key]: event.target.checked }))}
                    className="h-4 w-4 accent-brand"
                  />
                  {label}
                </label>
              ))}
            </fieldset>
          )}
        </div>
        <div className="space-y-3">
          {missing.length > 0 && (
            <div className="rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-content">
              <p>{missing.length} selected product{missing.length === 1 ? '' : 's'} still need an internal code. Existing barcodes are left unchanged.</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => missing.forEach((product) => onGenerate?.(product))}>
                Generate internal Code 128
              </Button>
            </div>
          )}
          <ul className="max-h-40 space-y-2 overflow-auto">
            {products.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium">{product.name}</span>
                  <span className="block text-xs text-content-muted">{product.barcode || 'No barcode'} · {product.sku}</span>
                </span>
                <label className="flex items-center gap-2 text-xs text-content-muted">
                  Copies
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={copies[product.id] ?? 1}
                    onChange={(event) => setCopies((current) => ({ ...current, [product.id]: Math.max(1, Math.min(99, Number(event.target.value) || 1)) }))}
                    className="w-16 rounded border border-border bg-surface px-2 py-1 text-sm text-content"
                    aria-label={`Copies for ${product.name}`}
                  />
                </label>
              </li>
            ))}
          </ul>
          <div className="max-h-[420px] overflow-auto rounded-xl border border-border bg-canvas p-4">
            <div className="flex flex-wrap justify-center gap-3">
              {jobs.slice(0, 8).map((unit) => (
                <div key={unit.jobKey} className="origin-top scale-90">{renderLabel(unit)}</div>
              ))}
            </div>
            <p className="mt-3 text-center text-[11px] text-content-muted">
              {jobs.length} label{jobs.length === 1 ? '' : 's'} at {preset.width}mm × {preset.height}mm
              {page === 'a4' ? ' on A4' : ''}.
              {products.flatMap((product) => unitsFor(product)).length * 1 > jobs.length ? ' Extra copies were limited to 200 labels.' : ''}
              {jobs.length > 8 ? ' Preview shows the first eight.' : ''}
            </p>
          </div>
        </div>
      </div>
      <LabelPrintSheet job={printJob} onDone={() => setPrintJob(null)}>
        <div className={page === 'a4' ? 'label-sheet w-[194mm]' : 'label-sheet'}>
          {jobs.map((unit, position) => (
            <div key={unit.jobKey} className={page === 'label' && position < jobs.length - 1 ? 'label-sheet-break' : ''}>
              {renderLabel(unit)}
            </div>
          ))}
        </div>
      </LabelPrintSheet>
    </Modal>
  );
}
