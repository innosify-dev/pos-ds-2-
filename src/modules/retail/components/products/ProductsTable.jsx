import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/tables/Table';
import { EmptyState } from '@shared/feedback/EmptyState';
import { formatPrice } from '@modules/retail/data/products.data.js';
import { StatusPill } from './ProductsToolbar.jsx';
import { cn } from '@utils/cn';

function ActionButton({ title, onClick, children, tone }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        'rounded-md p-1.5 transition-colors',
        tone === 'danger'
          ? 'text-content-muted hover:bg-danger-muted hover:text-danger'
          : 'text-content-muted hover:bg-accent-muted hover:text-accent'
      )}
    >
      {children}
    </button>
  );
}

const iconCls = 'h-4 w-4';

/**
 * Products table — presentational; selection + row actions bubble up.
 */
export function ProductsTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  allOnPageSelected,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onAddProduct,
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <EmptyState
          title="No products found"
          description="Try a different search or clear the filters."
          actionLabel="Add Product"
          onAction={onAddProduct}
        />
      </div>
    );
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader className="w-10 px-2">
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={onToggleAll}
              aria-label="Select all products on this page"
              className="h-4 w-4 accent-[#7c3aed]"
            />
          </TableHeader>
          <TableHeader className="px-2">Product</TableHeader>
          <TableHeader className="px-2">SKU</TableHeader>
          <TableHeader className="px-2">Category</TableHeader>
          <TableHeader className="px-2">Brand</TableHeader>
          <TableHeader className="px-2">Price</TableHeader>
          <TableHeader className="px-2">Stock</TableHeader>
          <TableHeader className="px-2">Status</TableHeader>
          <TableHeader className="px-2">Returnable</TableHeader>
          <TableHeader className="px-2">Created Date</TableHeader>
          <TableHeader className="px-2 text-right">Action</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="px-2">
              <input
                type="checkbox"
                checked={selectedIds.includes(p.id)}
                onChange={() => onToggleRow(p.id)}
                aria-label={`Select ${p.name}`}
                className="h-4 w-4 accent-[#7c3aed]"
              />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-sm font-bold text-white',
                    p.gradient
                  )}
                >
                  {p.name.charAt(0)}
                </span>
                <span className="max-w-36 text-xs font-medium leading-snug">{p.name}</span>
              </div>
            </TableCell>
            <TableCell className="whitespace-nowrap px-2 text-[13px]">{p.sku}</TableCell>
            <TableCell className="whitespace-nowrap px-2 text-[13px]">{p.category}</TableCell>
            <TableCell className="whitespace-nowrap px-2 text-[13px]">{p.brand}</TableCell>
            <TableCell className="whitespace-nowrap px-2 text-[13px] font-medium">{formatPrice(p.price)}</TableCell>
            <TableCell className="px-2 text-[13px]">{p.stock}</TableCell>
            <TableCell className="px-2">
              <StatusPill status={p.status} />
            </TableCell>
            <TableCell className="px-2">
              <span className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-medium',
                    p.returnable ? 'bg-success-muted text-success' : 'border border-border text-content-muted'
                  )}
                >
                  Yes
                </span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-medium',
                    p.returnable ? 'border border-border text-content-muted' : 'bg-danger-muted text-danger'
                  )}
                >
                  No
                </span>
              </span>
            </TableCell>
            <TableCell className="whitespace-nowrap px-2 text-[13px]">{p.createdDate}</TableCell>
            <TableCell className="px-2">
              <div className="flex items-center justify-end gap-0.5">
                <ActionButton title="View" onClick={() => onView(p)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
                    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </ActionButton>
                <ActionButton title="Edit" onClick={() => onEdit(p)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
                    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" />
                    <path d="m13.5 6.5 3 3" />
                  </svg>
                </ActionButton>
                <ActionButton title="Duplicate" onClick={() => onDuplicate(p)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
                    <rect x="9" y="9" width="11" height="11" rx="2" />
                    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                  </svg>
                </ActionButton>
                <ActionButton title="Delete" tone="danger" onClick={() => onDelete(p)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
                    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13" />
                  </svg>
                </ActionButton>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
