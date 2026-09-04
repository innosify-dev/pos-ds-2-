import { useEffect, useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/tables/Table';
import { Badge } from '@shared/display/Badge';
import { formatCash } from '@modules/retail/data/registers.data.js';
import { cn } from '@utils/cn';

function OutlineButton({ children, tone, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
        tone === 'amber' && 'border-warning/40 text-warning hover:bg-warning-muted',
        tone === 'green' && 'border-success/40 text-success hover:bg-success-muted',
        tone === 'accent' && 'border-accent/30 text-accent hover:bg-accent-muted'
      )}
    >
      {children}
    </button>
  );
}

function RowMenu({ onEdit, onDelete }) {
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

  const item = 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Register actions"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1.5 text-content-muted hover:bg-surface-muted hover:text-content"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <circle cx="12" cy="5" r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full z-20 w-36 rounded-xl border border-border bg-surface py-1.5 shadow-lg">
          <button type="button" role="menuitem" className={cn(item, 'text-content hover:bg-surface-muted')} onClick={() => { setOpen(false); onEdit(); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
              <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" />
              <path d="m13.5 6.5 3 3" />
            </svg>
            Edit
          </button>
          <button type="button" role="menuitem" className={cn(item, 'text-danger hover:bg-danger-muted')} onClick={() => { setOpen(false); onDelete(); }}>
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

const eyeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/**
 * Registers table — presentational; session actions bubble up.
 */
export function RegistersTable({ rows, onViewDetails, onToggleSession, onEdit, onDelete }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader className="px-3">Register</TableHeader>
          <TableHeader className="px-3">Store</TableHeader>
          <TableHeader className="px-3">Assigned Cashier</TableHeader>
          <TableHeader className="px-3">Status</TableHeader>
          <TableHeader className="px-3">Opening Cash</TableHeader>
          <TableHeader className="px-3">Current Cash</TableHeader>
          <TableHeader className="px-3">Today&apos;s Sales</TableHeader>
          <TableHeader className="px-3">Opened At</TableHeader>
          <TableHeader className="px-3 text-right">Actions</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => {
          const isOpen = r.status === 'Open';
          return (
            <TableRow key={r.id}>
              <TableCell className="whitespace-nowrap px-3 text-[13px] font-medium">{r.name}</TableCell>
              <TableCell className="whitespace-nowrap px-3 text-[13px]">{r.store}</TableCell>
              <TableCell className="whitespace-nowrap px-3 text-[13px]">{r.cashier ?? 'Unassigned'}</TableCell>
              <TableCell className="px-3">
                <Badge variant={isOpen ? 'success' : 'default'} className="whitespace-nowrap">
                  {r.status}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap px-3 text-[13px]">{formatCash(r.openingCash)}</TableCell>
              <TableCell className="whitespace-nowrap px-3 text-[13px]">{formatCash(r.currentCash)}</TableCell>
              <TableCell className="whitespace-nowrap px-3 text-[13px]">{formatCash(r.todaysSales)}</TableCell>
              <TableCell className="whitespace-nowrap px-3 text-[13px]">{r.openedAt ?? '—'}</TableCell>
              <TableCell className="px-3">
                <div className="flex items-center justify-end gap-1.5">
                  <OutlineButton tone="accent" title="View Details" onClick={() => onViewDetails(r)}>
                    {eyeIcon} View Details
                  </OutlineButton>
                  {isOpen ? (
                    <OutlineButton tone="amber" title="Close register" onClick={() => onToggleSession(r)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M9 9.5h6M9 12.5h6" strokeLinecap="round" />
                      </svg>
                      Close
                    </OutlineButton>
                  ) : (
                    <OutlineButton tone="green" title="Open register" onClick={() => onToggleSession(r)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5">
                        <circle cx="12" cy="12" r="8.5" />
                        <path d="M12 8.5v7M8.5 12h7" strokeLinecap="round" />
                      </svg>
                      Open
                    </OutlineButton>
                  )}
                  <RowMenu onEdit={() => onEdit(r)} onDelete={() => onDelete(r)} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
