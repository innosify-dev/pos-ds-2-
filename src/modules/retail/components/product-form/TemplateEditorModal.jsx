import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from '@shared/dialogs/Modal';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { LabelElement } from './LabelGraphics.jsx';
import { canvasSize, elementTypes, newElement, paperSizes } from './labelTemplate.js';
import { cn } from '@utils/cn';

const fonts = ['Poppins', 'Inter', 'Arial', 'Georgia'];
const zooms = [50, 75, 100, 125, 150];
const BASE_PX_PER_MM = 3.4;

const paletteIcons = {
  text: <path d="M6 5h12M12 5v14M9 19h6" strokeLinecap="round" />,
  brand: <path d="m12 3 2.5 5.5L20 9.5l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-1z" strokeLinejoin="round" />,
  qr: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17.5 17.5h3v3h-3z" /></>,
  barcode: <path d="M5 5v14M9 5v14M12.5 5v14M16 5v14M20 5v14" strokeLinecap="round" />,
  line: <path d="M4 12h16" strokeLinecap="round" />,
  rectangle: <rect x="5" y="6" width="14" height="12" rx="1" />,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m5 18 5-5 3 3 3-3 3 3" strokeLinecap="round" strokeLinejoin="round" /></>,
};

function ToolButton({ title, onClick, disabled, active, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-lg border p-1.5',
        active
          ? 'border-accent bg-accent-muted text-accent'
          : 'border-border text-content-muted hover:bg-surface-muted hover:text-content',
        'disabled:opacity-40'
      )}
    >
      {children}
    </button>
  );
}

const smallIcon = 'h-4 w-4';

/**
 * Label template editor — canvas, layers, alignment, text props, settings.
 */
export function TemplateEditorModal({ open, onClose, template: initial, onSave, combo, productName }) {
  const [draft, setDraft] = useState(initial);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [grid, setGrid] = useState(true);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const dragRef = useRef(null);

  useEffect(() => {
    if (open) {
      setDraft(initial);
      setSelectedId(null);
      setPast([]);
      setFuture([]);
      setZoom(100);
    }
  }, [open, initial]);

  const canvas = useMemo(() => canvasSize(draft), [draft]);
  const pxPerMm = (BASE_PX_PER_MM * zoom) / 100;
  const selected = draft.elements.find((el) => el.id === selectedId) ?? null;

  const commit = (next) => {
    setPast((p) => [...p.slice(-49), draft]);
    setFuture([]);
    setDraft(next);
  };

  const updateElements = (fn) => commit({ ...draft, elements: fn(draft.elements) });
  const updateSelected = (patch) =>
    updateElements((els) => els.map((el) => (el.id === selectedId ? { ...el, ...patch } : el)));

  const undo = () => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [draft, ...f]);
    setDraft(prev);
  };
  const redo = () => {
    if (future.length === 0) return;
    const [next, ...rest] = future;
    setFuture(rest);
    setPast((p) => [...p, draft]);
    setDraft(next);
  };

  const addElement = (type) => {
    const el = newElement(type);
    if (type === 'text') {
      el.x = Math.max(2, (canvas.width - el.w) / 2);
      el.y = Math.max(2, (canvas.height - el.h) / 2);
    }
    commit({ ...draft, elements: [...draft.elements, el] });
    setSelectedId(el.id);
  };

  const deleteSelected = () => {
    if (!selected) return;
    updateElements((els) => els.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const moveLayer = (dir) => {
    const i = draft.elements.findIndex((el) => el.id === selectedId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= draft.elements.length) return;
    const els = [...draft.elements];
    [els[i], els[j]] = [els[j], els[i]];
    commit({ ...draft, elements: els });
  };

  const alignSelected = (mode) => {
    if (!selected) return;
    const patch = {};
    if (mode === 'left') patch.x = 2;
    if (mode === 'centerX') patch.x = Math.max(0, (canvas.width - selected.w) / 2);
    if (mode === 'right') patch.x = Math.max(0, canvas.width - selected.w - 2);
    if (mode === 'top') patch.y = 2;
    if (mode === 'middle') patch.y = Math.max(0, (canvas.height - selected.h) / 2);
    if (mode === 'bottom') patch.y = Math.max(0, canvas.height - selected.h - 2);
    updateSelected(patch);
  };

  const distribute = (mode) => {
    const els = draft.elements;
    if (els.length < 2) return;
    let next = [...els];
    if (mode === 'h') {
      const xs = els.map((e) => e.x).sort((a, b) => a - b);
      const step = els.length === 1 ? 0 : (xs[xs.length - 1] - xs[0]) / (els.length - 1);
      const order = [...els].sort((a, b) => a.x - b.x);
      next = order.map((e, i) => ({ ...e, x: Math.round((xs[0] + step * i) * 10) / 10 }));
      const byId = new Map(next.map((e) => [e.id, e]));
      next = els.map((e) => byId.get(e.id));
    } else if (mode === 'v') {
      const ys = els.map((e) => e.y).sort((a, b) => a - b);
      const step = (ys[ys.length - 1] - ys[0]) / (els.length - 1 || 1);
      const order = [...els].sort((a, b) => a.y - b.y);
      const placed = order.map((e, i) => ({ ...e, y: Math.round((ys[0] + step * i) * 10) / 10 }));
      const byId = new Map(placed.map((e) => [e.id, e]));
      next = els.map((e) => byId.get(e.id));
    } else {
      next = els.map((e) => ({
        ...e,
        x: Math.max(0, Math.round(((canvas.width - e.w) / 2) * 10) / 10),
      }));
    }
    commit({ ...draft, elements: next });
  };

  // Drag selected element on canvas (mm coordinates).
  const onElementPointerDown = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = draft.elements.find((x) => x.id === id);
    if (!el) return;
    dragRef.current = {
      id,
      snapshot: draft.elements,
      startX: e.clientX,
      startY: e.clientY,
      origX: el.x,
      origY: el.y,
    };
    const onMove = (ev) => {
      const d = dragRef.current;
      if (!d) return;
      const dxMm = (ev.clientX - d.startX) / pxPerMm;
      const dyMm = (ev.clientY - d.startY) / pxPerMm;
      setDraft((cur) => ({
        ...cur,
        elements: cur.elements.map((x) =>
          x.id === d.id
            ? {
                ...x,
                x: Math.round(Math.min(Math.max(0, d.origX + dxMm), Math.max(0, canvas.width - x.w)) * 10) / 10,
                y: Math.round(Math.min(Math.max(0, d.origY + dyMm), Math.max(0, canvas.height - x.h)) * 10) / 10,
              }
            : x
        ),
      }));
    };
    const onUp = () => {
      const d = dragRef.current;
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (d) {
        setPast((p) => [...p.slice(-49), { ...draft, elements: d.snapshot }]);
        setFuture([]);
      }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const applyPaperSize = (label) => {
    const found = paperSizes.find((p) => p.label === label);
    if (!found?.width) {
      setDraft((d) => ({ ...d, paperLabel: label }));
      return;
    }
    commit({ ...draft, paperLabel: label, width: found.width, height: found.height });
  };

  if (!open) return null;

  const textable = selected && ['text', 'productName', 'price'].includes(selected.type);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="full"
      className="max-w-6xl"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(draft); onClose(); }}>Save Template</Button>
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-muted text-accent">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
          </svg>
        </span>
        <div className="flex-1">
          <h2 className="text-base font-bold text-content">Label Template Editor</h2>
          <p className="text-xs text-content-muted">Design and customize your label template</p>
        </div>
        <Button size="sm" onClick={() => { onSave(draft); onClose(); }}>Save Template</Button>
        <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 text-content-muted hover:bg-surface-muted hover:text-content">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <ToolButton title="Undo" onClick={undo} disabled={past.length === 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={smallIcon}><path d="M8 6 4 10l4 4M4 10h9a6 6 0 0 1 0 12h-2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </ToolButton>
        <ToolButton title="Redo" onClick={redo} disabled={future.length === 0}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={smallIcon}><path d="m16 6 4 4-4 4M20 10h-9a6 6 0 0 0 0 12h2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </ToolButton>
        <Select value={String(zoom)} onChange={(e) => setZoom(Number(e.target.value))} className="h-8 w-24" aria-label="Zoom">
          {zooms.map((z) => (
            <option key={z} value={z}>{z}%</option>
          ))}
        </Select>
        <ToolButton title="Zoom out" onClick={() => setZoom((z) => Math.max(50, z - 25))} disabled={zoom <= 50}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={smallIcon}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M8.5 11h5" strokeLinecap="round" /></svg>
        </ToolButton>
        <ToolButton title="Zoom in" onClick={() => setZoom((z) => Math.min(150, z + 25))} disabled={zoom >= 150}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={smallIcon}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M11 8.5v5M8.5 11h5" strokeLinecap="round" /></svg>
        </ToolButton>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-content-muted">
          Grid
          <button
            type="button"
            role="switch"
            aria-checked={grid}
            aria-label="Toggle grid"
            onClick={() => setGrid((g) => !g)}
            className={cn('relative h-5 w-9 rounded-full transition-colors', grid ? 'bg-accent' : 'bg-border-strong/50')}
          >
            <span className={cn('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all', grid ? 'left-[18px]' : 'left-0.5')} />
          </button>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
        {/* Left: palette + template settings + text props */}
        <div className="space-y-3 xl:col-span-3">
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-semibold text-content">Add Elements</p>
            <div className="space-y-1.5">
              {elementTypes.map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addElement(type)}
                  className="flex w-full items-center gap-2.5 rounded-lg border border-border px-3 py-2 text-xs text-content hover:border-accent hover:bg-accent-muted/40"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 text-content-muted">
                    {paletteIcons[type]}
                  </svg>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-semibold text-content">Template Settings</p>
            <div className="space-y-2.5">
              <Input label="Template Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <Select label="Paper Size" value={draft.paperLabel} onChange={(e) => applyPaperSize(e.target.value)}>
                {paperSizes.map((p) => (
                  <option key={p.label} value={p.label}>{p.label}</option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input label="Width (mm)" type="number" min="10" value={draft.width} onChange={(e) => setDraft({ ...draft, width: Number(e.target.value) || 0, paperLabel: 'Custom Size' })} />
                <Input label="Height (mm)" type="number" min="10" value={draft.height} onChange={(e) => setDraft({ ...draft, height: Number(e.target.value) || 0, paperLabel: 'Custom Size' })} />
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-medium text-content">Orientation</span>
                <div className="grid grid-cols-2 gap-2">
                  {['portrait', 'landscape'].map((o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => commit({ ...draft, orientation: o })}
                      className={cn('rounded-lg border px-3 py-2 text-xs font-medium capitalize', draft.orientation === o ? 'border-accent bg-accent-muted text-accent' : 'border-border text-content-muted hover:text-content')}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-semibold text-content">Text Properties</p>
            {textable ? (
              <div className="space-y-2.5">
                <Select label="Font" value={selected.font || 'Poppins'} onChange={(e) => updateSelected({ font: e.target.value })}>
                  {fonts.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </Select>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <span className="mb-1.5 block text-sm font-medium text-content">Size</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="6"
                        max="72"
                        value={selected.fontSize ?? 14}
                        onChange={(e) => updateSelected({ fontSize: Number(e.target.value) })}
                        className="h-9 w-full rounded border border-border bg-surface px-2 text-sm text-content focus:border-accent focus:outline-none"
                        aria-label="Font size"
                      />
                      <ToolButton title="Bold" active={selected.bold} onClick={() => updateSelected({ bold: !selected.bold })}>
                        <span className="px-0.5 text-sm font-bold">B</span>
                      </ToolButton>
                      <ToolButton title="Italic" active={selected.italic} onClick={() => updateSelected({ italic: !selected.italic })}>
                        <span className="px-0.5 text-sm italic">I</span>
                      </ToolButton>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {[
                    ['left', 'M5 6h14M5 11h10M5 16h14M5 21h10'],
                    ['center', 'M4 6h16M7 11h10M4 16h16M7 21h10'],
                    ['right', 'M5 6h14M9 11h10M5 16h14M9 21h10'],
                  ].map(([align, d]) => (
                    <ToolButton key={align} title={`Align ${align}`} active={(selected.align || 'left') === align} onClick={() => updateSelected({ align })}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={smallIcon}><path d={d} strokeLinecap="round" /></svg>
                    </ToolButton>
                  ))}
                  <input
                    type="color"
                    value={selected.color || '#0f172a'}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                    aria-label="Text color"
                    className="h-8 w-9 cursor-pointer rounded border border-border bg-surface p-0.5"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input label="X" type="number" value={Math.round(selected.x * 10) / 10} onChange={(e) => updateSelected({ x: Number(e.target.value) || 0 })} />
                  <Input label="Y" type="number" value={Math.round(selected.y * 10) / 10} onChange={(e) => updateSelected({ y: Number(e.target.value) || 0 })} />
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-content-muted">Select a text element to edit its properties.</p>
            )}
            {selected && !textable && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input label="X (mm)" type="number" value={Math.round(selected.x * 10) / 10} onChange={(e) => updateSelected({ x: Number(e.target.value) || 0 })} />
                <Input label="Y (mm)" type="number" value={Math.round(selected.y * 10) / 10} onChange={(e) => updateSelected({ y: Number(e.target.value) || 0 })} />
                <Input label="W (mm)" type="number" value={Math.round(selected.w * 10) / 10} onChange={(e) => updateSelected({ w: Math.max(2, Number(e.target.value) || 2) })} />
                <Input label="H (mm)" type="number" value={Math.round(selected.h * 10) / 10} onChange={(e) => updateSelected({ h: Math.max(2, Number(e.target.value) || 2) })} />
              </div>
            )}
            <Button variant="outline" size="sm" className="mt-3 w-full !text-danger" disabled={!selected} onClick={deleteSelected}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13" />
              </svg>
              Delete Element
            </Button>
          </div>
        </div>

        {/* Center: canvas */}
        <div className="xl:col-span-6">
          <div className="overflow-auto rounded-xl border border-border bg-surface-elevated/50 p-4">
            <div className="mx-auto w-fit">
              <div className="mb-1 ml-5 flex justify-between text-[9px] text-content-muted" style={{ width: `${canvas.width * pxPerMm}px` }}>
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].filter((t) => t <= canvas.width).map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="flex gap-1">
                <div className="flex flex-col justify-between py-1 text-[9px] text-content-muted" style={{ height: `${canvas.height * pxPerMm}px` }}>
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].filter((t) => t <= canvas.height).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <div
                  className="relative rounded-sm bg-white shadow"
                  style={{
                    width: `${canvas.width * pxPerMm}px`,
                    height: `${canvas.height * pxPerMm}px`,
                    backgroundImage: grid
                      ? 'linear-gradient(to right, rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(124,58,237,0.08) 1px, transparent 1px)'
                      : undefined,
                    backgroundSize: grid ? `${5 * pxPerMm}px ${5 * pxPerMm}px` : undefined,
                  }}
                  onPointerDown={() => setSelectedId(null)}
                >
                  {draft.elements.map((el) => (
                    <div
                      key={el.id}
                      onPointerDown={(e) => onElementPointerDown(e, el.id)}
                      className={cn('absolute cursor-move overflow-hidden', selectedId === el.id && 'outline outline-2 outline-accent')}
                      style={{ left: `${el.x * pxPerMm}px`, top: `${el.y * pxPerMm}px`, width: `${el.w * pxPerMm}px`, height: `${el.h * pxPerMm}px` }}
                    >
                      <LabelElement element={el} combo={combo} productName={productName} />
                      {selectedId === el.id && (
                        <>
                          {['-top-1 -left-1', '-top-1 -right-1', '-bottom-1 -left-1', '-bottom-1 -right-1'].map((pos) => (
                            <span key={pos} className={cn('absolute h-2 w-2 rounded-[2px] bg-accent', pos)} />
                          ))}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-xs font-semibold text-content">Template Preview (Real Size)</p>
              <div className="flex justify-center overflow-auto rounded-lg bg-surface-elevated/60 p-3">
                <div className="relative shrink-0 bg-white shadow" style={{ width: `${canvas.width * 3.78}px`, height: `${canvas.height * 3.78}px` }}>
                  {draft.elements.map((el) => (
                    <div key={el.id} className="absolute overflow-hidden" style={{ left: `${el.x * 3.78}px`, top: `${el.y * 3.78}px`, width: `${el.w * 3.78}px`, height: `${el.h * 3.78}px` }}>
                      <LabelElement element={el} combo={combo} productName={productName} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="mb-2 text-xs font-semibold text-content">Select Template Size (Common)</p>
              <div className="space-y-1.5">
                {paperSizes.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPaperSize(p.label)}
                    className={cn('w-full rounded-lg border px-3 py-2 text-left text-xs', draft.paperLabel === p.label ? 'border-accent bg-accent-muted font-medium text-accent' : 'border-border text-content hover:border-border-strong')}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: layers + alignment */}
        <div className="space-y-3 xl:col-span-3">
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-semibold text-content">Layers</p>
            <ul className="space-y-1">
              {[...draft.elements].reverse().map((el) => (
                <li key={el.id}>
                  <div
                    className={cn('flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-xs', selectedId === el.id ? 'border-accent bg-accent-muted/50 text-accent' : 'border-border text-content hover:border-border-strong')}
                    onClick={() => setSelectedId(el.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-content-muted">
                      <circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" />
                    </svg>
                    <span className="flex-1 truncate">{el.name}</span>
                    <button type="button" aria-label={`Move ${el.name} up`} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); moveLayer(1); }} className="rounded p-0.5 text-content-muted hover:text-content">▲</button>
                    <button type="button" aria-label={`Move ${el.name} down`} onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); moveLayer(-1); }} className="rounded p-0.5 text-content-muted hover:text-content">▼</button>
                  </div>
                </li>
              ))}
              {draft.elements.length === 0 && (
                <li className="py-4 text-center text-[11px] text-content-muted">No elements — add some from the palette.</li>
              )}
            </ul>
          </div>

          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs font-semibold text-content">Alignment</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ['left', 'M5 5v14M5 12h14', 'Align left'],
                ['centerX', 'M12 5v14M7 12h10', 'Align center'],
                ['right', 'M19 5v14M5 12h14', 'Align right'],
                ['top', 'M5 5h14M12 5v14', 'Align top'],
                ['middle', 'M5 12h14M12 7v10', 'Align middle'],
                ['bottom', 'M5 19h14M12 5v14', 'Align bottom'],
              ].map(([mode, d, title]) => (
                <ToolButton key={mode} title={title} onClick={() => alignSelected(mode)} disabled={!selected}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn(smallIcon, 'mx-auto')}><path d={d} strokeLinecap="round" /></svg>
                </ToolButton>
              ))}
            </div>
            <p className="mb-2 mt-3 text-xs font-semibold text-content">Distribute</p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                ['h', 'M6 5v14M12 5v14M18 5v14', 'Distribute horizontally'],
                ['v', 'M5 6h14M5 12h14M5 18h14', 'Distribute vertically'],
                ['c', 'M4 12h16M12 4v16', 'Center all'],
              ].map(([mode, d, title]) => (
                <ToolButton key={mode} title={title} onClick={() => distribute(mode)} disabled={draft.elements.length < 2}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={cn(smallIcon, 'mx-auto')}><path d={d} strokeLinecap="round" /></svg>
                </ToolButton>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
