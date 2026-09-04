import { useState } from 'react';
import { Button } from '@shared/ui/Button';
import { BrandMark, FakeBarcode, FakeQr, formatLabelPrice } from './LabelGraphics.jsx';
import { loadTemplate, saveTemplateToStorage } from './labelTemplate.js';
import { PrintPreviewModal } from './PrintPreviewModal.jsx';
import { TemplateEditorModal } from './TemplateEditorModal.jsx';

/**
 * QR code & barcode label preview with variant carousel.
 * Owns the label template (persisted to localStorage) shared by the
 * print preview and template editor dialogs.
 */
export function LabelPreview({ combos, index, onIndex, productName }) {
  const [template, setTemplate] = useState(loadTemplate);
  const [printOpen, setPrintOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  const total = combos.length;
  const current = total > 0 ? combos[Math.min(index, total - 1)] : null;

  const go = (dir) => {
    if (total === 0) return;
    onIndex((Math.min(index, total - 1) + dir + total) % total);
  };

  const handleSaveTemplate = (next) => {
    setTemplate(next);
    saveTemplateToStorage(next);
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-content">4B. QR Code &amp; Barcode</h3>
        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="text-xs font-medium text-accent hover:underline"
        >
          Customize
        </button>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous variant"
          onClick={() => go(-1)}
          disabled={total === 0}
          className="rounded-lg border border-border p-1.5 text-content hover:bg-surface-muted disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-xs text-content-muted">
          Variant {total === 0 ? 0 : Math.min(index, total - 1) + 1} of {total}
        </span>
        <button
          type="button"
          aria-label="Next variant"
          onClick={() => go(1)}
          disabled={total === 0}
          className="rounded-lg border border-border p-1.5 text-content hover:bg-surface-muted disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {current ? (
        <div className="flex flex-col items-center rounded-xl border border-border px-4 py-5 text-center">
          <p className="text-[11px] text-content-muted">Variant</p>
          <p className="text-sm font-semibold text-content">{current.name}</p>
          <p className="mt-1 text-[11px] text-content-muted">SKU</p>
          <p className="text-xs font-semibold tracking-wide text-content">{current.sku}</p>
          <div className="my-3 flex flex-col items-center gap-1 rounded-lg border border-border px-6 py-4">
            <BrandMark />
            <p className="text-[11px] text-content">{productName || 'Product'}</p>
            <FakeQr seed={current.sku} />
            <p className="mt-2 text-base font-bold text-content">{formatLabelPrice(current.selling)}</p>
            <FakeBarcode seed={current.sku} />
          </div>
          <div className="flex w-full gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setEditorOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" />
                <path d="m13.5 6.5 3 3" />
              </svg>
              Edit Label
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setPrintOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M7 8V3.5h10V8M7 17H4.5v-7h15v7H17M7 14.5h10v6H7z" strokeLinejoin="round" />
              </svg>
              Print
            </Button>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-xs text-content-muted">
          Add variant values to preview labels.
        </p>
      )}

      <PrintPreviewModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        combos={combos}
        index={index}
        onIndex={onIndex}
        productName={productName}
        template={template}
      />

      <TemplateEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        template={template}
        onSave={handleSaveTemplate}
        combo={current}
        productName={productName}
      />
    </section>
  );
}
