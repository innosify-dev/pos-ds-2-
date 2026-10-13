import { useRef, useState } from 'react';
import { cn } from '@utils/cn';

function Thumb({ src, label, onRemove, size }) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg border border-border bg-surface-elevated', size)}>
      {src ? (
        <img src={src} alt={label} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-muted to-surface-muted text-xs font-bold text-accent">
          {label.charAt(0)}
        </div>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-content-muted shadow hover:text-danger"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3 w-3">
            <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * Product images gallery — main image + up to 10 gallery images.
 * Files are previewed via local object URLs (no backend yet).
 */
export function ImagesGallery({ productName, main, gallery, onMain, onAdd, onRemove }) {
  const mainRef = useRef(null);
  const galleryRef = useRef(null);
  const [notice, setNotice] = useState('');

  const acceptFile = (file) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Use a JPG, PNG, or WebP image.';
    if (file.size > 2 * 1024 * 1024) return 'Each image must be 2 MB or smaller.';
    return '';
  };

  const pick = (event, handler) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    const problem = files.map(acceptFile).find(Boolean);
    if (problem) {
      setNotice(problem);
      return;
    }
    setNotice('');
    handler(files);
  };

  return (
    <section className="premium-card p-5">
      <h3 className="mb-1 text-sm font-semibold text-content">Media</h3>
      <p className="mb-4 text-xs text-content-muted">Preview only. Images stay in this form and are not stored with the product.</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-content">Main image</p>
          <Thumb src={main} label={productName || 'Product'} size="aspect-[4/5] w-full" />
          <input
            ref={mainRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => pick(e, (files) => files[0] && onMain(files[0]))}
          />
          <button
            type="button"
            onClick={() => mainRef.current?.click()}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-accent/40 px-3 py-2 text-xs font-medium text-accent hover:bg-accent-muted"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3M12 4v11M8 8.5 12 4.5 16 8.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Change Image
          </button>
          <p className="mt-1.5 text-[11px] text-content-muted">JPG, PNG, or WebP. Up to 2 MB.</p>
          {notice && <p role="alert" className="mt-2 text-xs text-danger">{notice}</p>}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-content">More Images (up to 10)</p>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              disabled={gallery.length >= 10}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border-strong text-content-muted hover:border-accent hover:text-accent disabled:opacity-40"
            >
              <span className="text-lg leading-none">+</span>
              <span className="text-[11px]">Add Image</span>
            </button>
            {gallery.map((src, i) => (
              <Thumb key={`${i}-${src}`} src={src} label={`Image ${i + 1}`} size="aspect-square w-full" onRemove={() => onRemove(i)} />
            ))}
          </div>
          <input
            ref={galleryRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => pick(e, onAdd)}
          />
        </div>
      </div>
    </section>
  );
}
