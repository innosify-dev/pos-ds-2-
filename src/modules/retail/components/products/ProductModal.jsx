import { Modal } from '@shared/dialogs/Modal';
import { Button } from '@shared/ui/Button';
import { formatInr } from '@modules/retail/data/products.data.js';
import { StatusPill } from './ProductsToolbar.jsx';

function stockLabel(product) {
  const qty = Number(product.stock) || 0;
  const low = Number(product.lowStock);
  if (qty <= 0) return 'Out of stock';
  if (Number.isFinite(low) && low > 0 && qty <= low) return 'Low stock';
  return 'In stock';
}

/**
 * Read-only product details dialog.
 * Add / edit live on the product form routes.
 */
export function ProductModal({ open, product, onClose, onEdit, canManage }) {
  if (!open || !product) return null;

  const details = product.details ?? {};
  const src = product.image || product.imageUrl || details.image;
  const letters = product.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'PR';

  const rows = [
    ['SKU', product.sku],
    ['Barcode', product.barcode || '—'],
    ['Category', product.category || '—'],
    ['Brand', product.brand || '—'],
    ['Selling price', formatInr(product.price)],
    ['Cost price', product.costPrice != null ? formatInr(product.costPrice) : '—'],
    ['GST', product.taxRate != null ? `${product.taxRate}%` : details.tax?.category || '—'],
    ['Stock', String(product.stock)],
    ['Low-stock threshold', product.lowStock != null ? String(product.lowStock) : '—'],
    ['Unit', details.unit || product.unit || '—'],
    ['HSN', details.hsn || product.hsn || '—'],
    ['Created', product.createdDate || '—'],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Product details"
      size="lg"
      footer={(
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canManage && onEdit && <Button onClick={() => onEdit(product)}>Edit product</Button>}
        </div>
      )}
    >
      <div className="flex items-start gap-4">
        {src ? (
          <img src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-xl bg-accent-muted text-lg font-semibold text-accent">
            {letters}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-content">{product.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusPill status={product.status} />
            <StatusPill status={stockLabel(product)} />
          </div>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-content-muted">{label}</dt>
            <dd className="mt-0.5 font-medium text-content">{value}</dd>
          </div>
        ))}
        <div>
          <dt className="text-xs text-content-muted">Returnable</dt>
          <dd className="mt-0.5 font-medium text-content">{product.returnable ? 'Yes' : 'No'}</dd>
        </div>
      </dl>
      {details.description ? (
        <p className="mt-4 text-sm text-content-muted">{details.description}</p>
      ) : null}
    </Modal>
  );
}
