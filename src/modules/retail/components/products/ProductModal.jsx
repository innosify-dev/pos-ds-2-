import { Modal, ModalFooter } from '@shared/dialogs/Modal';
import { formatPrice } from '@modules/retail/data/products.data.js';
import { StatusPill } from './ProductsToolbar.jsx';

/**
 * Read-only product details dialog.
 * Add / edit live on the product form routes (screens/product-form/).
 */
export function ProductModal({ open, product, onClose }) {
  if (!open || !product) return null;

  const details = product.details ?? {};

  const rows = [
    ['Product', product.name],
    ['SKU', product.sku],
    ['Category', product.category],
    ['Brand', product.brand],
    ['Price', formatPrice(product.price)],
    ['Stock', String(product.stock)],
    ['Created', product.createdDate],
    ['HSN', details.hsn || '—'],
    ['Unit', details.unit || '—'],
    ['Saree Type', details.sareeType || '—'],
    ['Fabric', details.fabric || '—'],
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Product Details"
      size="lg"
      footer={<ModalFooter onCancel={onClose} cancelLabel="Close" />}
    >
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-content-muted">{k}</dt>
            <dd className="mt-0.5 font-medium text-content">{v}</dd>
          </div>
        ))}
        <div>
          <dt className="text-xs text-content-muted">Status</dt>
          <dd className="mt-1"><StatusPill status={product.status} /></dd>
        </div>
        <div>
          <dt className="text-xs text-content-muted">Returnable</dt>
          <dd className="mt-0.5 font-medium text-content">{product.returnable ? 'Yes' : 'No'}</dd>
        </div>
      </dl>
      {product.description || details.description ? (
        <p className="mt-4 text-sm text-content-muted">{details.description}</p>
      ) : null}
    </Modal>
  );
}
