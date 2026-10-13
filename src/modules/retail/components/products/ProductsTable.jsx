import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/tables/Table';
import { EmptyState } from '@shared/feedback/EmptyState';
import { formatInr } from '@modules/retail/data/products.data.js';
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
        'rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40',
        tone === 'danger'
          ? 'text-content-muted hover:bg-danger-muted hover:text-danger'
          : 'text-content-muted hover:bg-accent-muted hover:text-accent',
      )}
    >
      {children}
    </button>
  );
}

function ProductMark({ product }) {
  const src = product.image || product.imageUrl || product.details?.image;
  if (src) {
    return <img src={src} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />;
  }
  const letters = product.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'PR';
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-[11px] font-semibold text-accent">
      {letters}
    </span>
  );
}

function stockLabel(product) {
  const qty = Number(product.stock) || 0;
  const low = Number(product.lowStock);
  if (qty <= 0) return 'Out of stock';
  if (Number.isFinite(low) && low > 0 && qty <= low) return 'Low stock';
  return 'In stock';
}

const iconCls = 'h-4 w-4';

function RowActions({ product, canManage, onView, onEdit, onDuplicate, onDelete, onPrint }) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      {canManage && onPrint && (
        <ActionButton title="Barcode and label" onClick={() => onPrint(product)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
            <path d="M4 7v10M7 7v10M10 7v10M14 7v10M18 7v10M21 7v10" strokeLinecap="round" />
          </svg>
        </ActionButton>
      )}
      <ActionButton title="View" onClick={() => onView(product)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
          <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </ActionButton>
      {canManage && (
        <>
          <ActionButton title="Edit" onClick={() => onEdit(product)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
              <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z" />
              <path d="m13.5 6.5 3 3" />
            </svg>
          </ActionButton>
          <ActionButton title="Duplicate" onClick={() => onDuplicate(product)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
          </ActionButton>
          <ActionButton title="Delete" tone="danger" onClick={() => onDelete(product)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconCls}>
              <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l1 13h9l1-13" />
            </svg>
          </ActionButton>
        </>
      )}
    </div>
  );
}

/**
 * Products table — presentational; selection + row actions bubble up.
 * On narrow screens the same rows render as cards.
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
  onPrint,
  onAddProduct,
  canManage = true,
  emptyTitle,
  emptyDescription,
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={canManage ? 'Add Product' : undefined}
        onAction={canManage ? onAddProduct : undefined}
      />
    );
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {rows.map((product) => (
          <li key={product.id} className="premium-card p-3">
            <div className="flex items-start gap-3">
              {canManage && (
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product.id)}
                  onChange={() => onToggleRow(product.id)}
                  aria-label={`Select ${product.name}`}
                  className="mt-3 h-4 w-4 accent-brand"
                />
              )}
              <ProductMark product={product} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-content">{product.name}</p>
                <p className="mt-0.5 text-xs text-content-muted">{product.sku}{product.barcode ? ` · ${product.barcode}` : ''}</p>
                <p className="mt-1 text-xs text-content-muted">{product.category || '—'} · {product.brand || '—'}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold tabular-nums">{formatInr(product.price)}</span>
              <StatusPill status={stockLabel(product)} />
              <StatusPill status={product.status} />
              <span className="text-xs text-content-muted">{product.stock} in stock</span>
              <div className="ml-auto">
                <RowActions product={product} canManage={canManage} onView={onView} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onPrint={onPrint} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">
        <Table>
          <TableHead>
            <TableRow>
              {canManage && (
                <TableHeader className="w-10 px-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={onToggleAll}
                    aria-label="Select all products on this page"
                    className="h-4 w-4 accent-brand"
                  />
                </TableHeader>
              )}
              <TableHeader>Product</TableHeader>
              <TableHeader>SKU</TableHeader>
              <TableHeader>Category</TableHeader>
              <TableHeader>Brand</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader>Stock</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((product) => (
              <TableRow key={product.id} className="hover:bg-canvas">
                {canManage && (
                  <TableCell className="px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(product.id)}
                      onChange={() => onToggleRow(product.id)}
                      aria-label={`Select ${product.name}`}
                      className="h-4 w-4 accent-brand"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ProductMark product={product} />
                    <span className="max-w-[16rem] text-sm font-medium leading-snug">{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm">{product.sku}</div>
                  {product.barcode && <div className="text-xs text-content-muted">{product.barcode}</div>}
                </TableCell>
                <TableCell className="whitespace-nowrap">{product.category || '—'}</TableCell>
                <TableCell className="whitespace-nowrap">{product.brand || '—'}</TableCell>
                <TableCell className="whitespace-nowrap font-medium tabular-nums">{formatInr(product.price)}</TableCell>
                <TableCell>
                  <div className="font-medium tabular-nums">{product.stock}</div>
                  <div className="mt-1"><StatusPill status={stockLabel(product)} /></div>
                </TableCell>
                <TableCell>
                  <StatusPill status={product.status} />
                </TableCell>
                <TableCell>
                  <RowActions product={product} canManage={canManage} onView={onView} onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} onPrint={onPrint} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
