import { useEffect, useState } from 'react';
import { Modal } from '@shared/dialogs/Modal';
import { Button } from '@shared/ui/Button';
import { Select } from '@shared/ui/Select';
import { LabelElement } from './LabelGraphics.jsx';
import { paperSizes, canvasSize } from './labelTemplate.js';
import { cn } from '@utils/cn';

const printers = ['Zebra ZD420', 'Honeywell PC42t', 'TSC TE200', 'Generic Thermal Printer'];
const qualities = ['203 DPI', '300 DPI', '600 DPI'];

const defaultSettings = {
  paperLabel: '50mm x 70mm',
  printer: 'Zebra ZD420',
  orientation: 'portrait',
  quality: '203 DPI',
  copies: 1,
  labels: 10,
  printBorder: true,
  cuttingMarks: false,
  layout: 'single',
  rows: 2,
  cols: 2,
};

function Stepper({ value, onChange, min = 1, max = 999, label }) {
  return (
    <div className="flex items-center rounded-lg border border-border">
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => onChange(Math.max(min, value - 1))} className="px-2.5 py-1.5 text-content-muted hover:text-content">−</button>
      <span className="min-w-8 text-center text-sm font-medium text-content">{value}</span>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => onChange(Math.min(max, value + 1))} className="px-2.5 py-1.5 text-content-muted hover:text-content">+</button>
    </div>
  );
}

function TemplateLabel({ template, combo, productName, pxPerMm = 3.1, printBorder }) {
  const { width, height } = canvasSize(template);
  return (
    <div
      className={cn('relative bg-white', printBorder && 'border border-border-strong')}
      style={{ width: `${width * pxPerMm}px`, height: `${height * pxPerMm}px` }}
    >
      {template.elements.map((el) => (
        <div key={el.id} className="absolute overflow-hidden" style={{ left: `${el.x * pxPerMm}px`, top: `${el.y * pxPerMm}px`, width: `${el.w * pxPerMm}px`, height: `${el.h * pxPerMm}px` }}>
          <LabelElement element={el} combo={combo} productName={productName} />
        </div>
      ))}
    </div>
  );
}

const layouts = [
  { id: 'single', title: 'Single Label', hint: 'One label per page' },
  { id: 'multiple', title: 'Multiple Labels (Auto)', hint: 'Best fit for paper size' },
  { id: 'custom', title: 'Custom Rows & Columns', hint: 'Specify rows and columns' },
];

/**
 * Print preview dialog — variant, paper, copies, layout, and summary.
 */
export function PrintPreviewModal({ open, onClose, combos, index, onIndex, productName, template }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [viewMode, setViewMode] = useState('single');

  useEffect(() => {
    if (open) {
      setSettings((s) => ({ ...s, paperLabel: `${template.width}mm x ${template.height}mm`, orientation: template.orientation }));
    }
  }, [open, template]);

  if (!open) return null;

  const total = combos.length;
  const safeIndex = total === 0 ? 0 : Math.min(index, total - 1);
  const combo = total === 0 ? null : combos[safeIndex];
  const set = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  const go = (dir) => total > 0 && onIndex((safeIndex + dir + total) % total);

  const perPage = settings.layout === 'single' ? 1 : settings.layout === 'multiple' ? 4 : Math.max(1, settings.rows * settings.cols);
  const totalLabels = settings.copies * settings.labels;
  const totalPages = Math.max(1, Math.ceil(settings.labels / perPage));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="full"
      className="max-w-6xl"
      footer={
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M7 8V3.5h10V8M7 17H4.5v-7h15v7H17M7 14.5h10v6H7z" strokeLinejoin="round" />
            </svg>
            Print
          </Button>
        </div>
      }
    >
      <div className="-mx-1 -mt-1 mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted text-accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
              <path d="M7 8V3.5h10V8M7 17H4.5v-7h15v7H17M7 14.5h10v6H7z" strokeLinejoin="round" />
            </svg>
          </span>
          <div>
            <h2 className="text-base font-bold text-content">Print Preview</h2>
            <p className="text-xs text-content-muted">Review your label before printing</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-content-muted hover:bg-surface-muted hover:text-content">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <p className="mb-1 text-[11px] font-medium text-content-muted">Select Variant</p>
              <div className="flex items-center gap-1.5">
                <span className="rounded-lg border border-border px-3 py-1.5 text-xs text-content">
                  {total === 0 ? '0 of 0' : `${safeIndex + 1} of ${total}`}
                </span>
                <button type="button" aria-label="Previous variant" onClick={() => go(-1)} className="rounded-lg border border-border p-1.5 text-content hover:bg-surface-muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="m15 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <button type="button" aria-label="Next variant" onClick={() => go(1)} className="rounded-lg border border-border p-1.5 text-content hover:bg-surface-muted">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
            <div className="ml-auto">
              <p className="mb-1 text-[11px] font-medium text-content-muted">View Mode</p>
              <div className="flex gap-1.5">
                {['single', 'grid'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-label={`${m} view`}
                    onClick={() => setViewMode(m)}
                    className={cn('rounded-lg border p-2', viewMode === m ? 'border-accent bg-accent-muted text-accent' : 'border-border text-content-muted hover:text-content')}
                  >
                    {m === 'single' ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="6" y="4" width="12" height="16" rx="1.5" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4"><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center rounded-xl border border-border bg-surface-elevated/60 p-4">
            {combo ? (
              viewMode === 'single' ? (
                <TemplateLabel template={template} combo={combo} productName={productName} printBorder={settings.printBorder} />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map((i) => (
                    <TemplateLabel key={i} template={template} combo={combo} productName={productName} pxPerMm={1.5} printBorder={settings.printBorder} />
                  ))}
                </div>
              )
            ) : (
              <p className="py-10 text-xs text-content-muted">No variants to preview.</p>
            )}
            <p className="mt-2 text-center text-[11px] text-content-muted">Actual size preview<br />{template.width}mm x {template.height}mm</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-xs font-semibold text-content">Print Layout</p>
              <div className="space-y-2">
                {layouts.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => set('layout', l.id)}
                    className={cn('flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left', settings.layout === l.id ? 'border-accent bg-accent-muted/40' : 'border-border hover:border-border-strong')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-4 w-4 shrink-0 text-accent"><rect x="5" y="4" width="14" height="16" rx="1.5" /><path d="M9 9h6M9 13h6" /></svg>
                    <span>
                      <span className="block text-xs font-medium text-content">{l.title}</span>
                      <span className="block text-[11px] text-content-muted">{l.hint}</span>
                    </span>
                  </button>
                ))}
                {settings.layout === 'custom' && (
                  <div className="flex items-center gap-2 pl-1 text-xs text-content">
                    Rows <Stepper value={settings.rows} onChange={(v) => set('rows', v)} label="rows" />
                    Cols <Stepper value={settings.cols} onChange={(v) => set('cols', v)} label="columns" />
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-xs font-semibold text-content">Print Summary</p>
              <dl className="space-y-1.5 text-xs">
                {[
                  ['Variant', combo?.name ?? '—'],
                  ['SKU', combo?.sku ?? '—'],
                  ['Paper Size', settings.paperLabel],
                  ['Copies per Label', String(settings.copies)],
                  ['Number of Labels', String(settings.labels)],
                  ['Total Pages', String(totalPages)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3">
                    <dt className="text-content-muted">{k}</dt>
                    <dd className="font-medium text-content">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border p-4 lg:col-span-2">
          <p className="mb-3 text-xs font-semibold text-content">Print Settings</p>
          <div className="space-y-3">
            <Select label="Paper Size" value={settings.paperLabel} onChange={(e) => set('paperLabel', e.target.value)}>
              {paperSizes.filter((p) => p.width).map((p) => (
                <option key={p.label} value={p.label}>{p.label}</option>
              ))}
            </Select>
            <Select label="Printer" value={settings.printer} onChange={(e) => set('printer', e.target.value)}>
              {printers.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
            <div>
              <span className="mb-1.5 block text-sm font-medium text-content">Orientation</span>
              <div className="grid grid-cols-2 gap-2">
                {['portrait', 'landscape'].map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => set('orientation', o)}
                    className={cn('rounded-lg border px-3 py-2 text-xs font-medium capitalize', settings.orientation === o ? 'border-accent bg-accent-muted text-accent' : 'border-border text-content-muted hover:text-content')}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <Select label="Print Quality" value={settings.quality} onChange={(e) => set('quality', e.target.value)}>
              {qualities.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </Select>
            <div className="flex items-center justify-between">
              <span className="text-sm text-content">Copies Per Label</span>
              <Stepper value={settings.copies} onChange={(v) => set('copies', v)} label="copies" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-content">Number of Labels</span>
              <Stepper value={settings.labels} onChange={(v) => set('labels', v)} label="labels" />
            </div>
            <p className="text-center text-[11px] text-content-muted">Total Labels: {totalLabels}</p>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-accent">
              <input type="checkbox" checked={settings.printBorder} onChange={(e) => set('printBorder', e.target.checked)} className="h-4 w-4 accent-brand" />
              Print Border
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-[13px] text-content">
              <input type="checkbox" checked={settings.cuttingMarks} onChange={(e) => set('cuttingMarks', e.target.checked)} className="h-4 w-4 accent-brand" />
              Cutting Marks
            </label>
            <Button variant="outline" size="sm" className="w-full" onClick={() => setSettings(defaultSettings)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <path d="M4 10a8 8 0 1 1 2 6M4 10V4m0 6h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reset
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
