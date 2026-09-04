import { useEffect, useRef, useState } from 'react';
import { Badge } from '@shared/display/Badge';
import { cn } from '@utils/cn';

function RowMenu({ onAddSub, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open ]);

  const item =
    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Category actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1.5 text-content-muted hover:bg-surface-muted hover:text-content"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="5" cy="12" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="19" cy="12" r="1.6" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 w-44 rounded-xl border border-border bg-surface py-1.5 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className={cn(item, 'text-accent hover:bg-accent-muted')}
            onClick={() => { setOpen(false); onAddSub(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 8.5v7M8.5 12h7" strokeLinecap="round" />
            </svg>
            Add Subcategory
          </button>
          <button
            type="button"
            role="menuitem"
            className={cn(item, 'text-content hover:bg-surface-muted')}
            onClick={() => { setOpen(false); onEdit(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" />
              <path d="m13.5 6.5 3 3" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            className={cn(item, 'text-danger hover:bg-danger-muted')}
            onClick={() => { setOpen(false); onDelete(); }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Flat category summary list (tree order) with per-row actions menu.
 */
export function CategoryList({ rows, onAddSub, onEdit, onDelete }) {
  return (
    <ul className="divide-y divide-border/60">
      {rows.map((row) => (
        <li key={row.id} className="flex items-center gap-3 py-2.5">
          <span
            className="min-w-0 flex-1 truncate text-[13px] text-content"
            style={{ paddingLeft: `${row.depth * 1.1}rem` }}
          >
            {row.name}
          </span>
          <span className="whitespace-nowrap text-xs text-content-muted">
            {row.productCount} products
          </span>
          <Badge variant={row.status === 'Active' ? 'success' : 'danger'} className="whitespace-nowrap">
            {row.status}
          </Badge>
          <RowMenu
            onAddSub={() => onAddSub(row)}
            onEdit={() => onEdit(row)}
            onDelete={() => onDelete(row)}
          />
        </li>
      ))}
    </ul>
  );
}
