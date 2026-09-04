import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { ConfirmationDialog } from '@shared/dialogs/ConfirmationDialog';
import { useProducts } from '@modules/retail/store/ProductsContext.jsx';
import {
  ProductModal,
  ProductsPagination,
  ProductsTable,
  ProductsToolbar,
} from '@modules/retail/components/products';

/**
 * Products screen — manage products and inventory.
 * List state comes from ProductsProvider; add/edit live on form routes.
 */
export function ProductsScreen() {
  const { products, deleteProduct, duplicateProduct } = useProducts();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter && p.status !== statusFilter) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (q && !`${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query, statusFilter, categoryFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((p) => selectedIds.includes(p.id));

  const resetPage = () => setPage(1);
  const hasActiveFilters = statusFilter !== '' || categoryFilter !== '' || query.trim() !== '';

  const toggleRow = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const toggleAllOnPage = () =>
    setSelectedIds((ids) =>
      allOnPageSelected ? ids.filter((id) => !pageRows.some((p) => p.id === id)) : [...new Set([...ids, ...pageRows.map((p) => p.id)])]
    );

  const handleDelete = (product) => setDeleteTarget(product);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    setSelectedIds((ids) => ids.filter((id) => id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const deleteSelected = () => {
    selectedIds.forEach(deleteProduct);
    setSelectedIds([]);
  };

  const from = filtered.length === 0 ? 0 : (safePage - 1) * perPage + 1;
  const to = Math.min(safePage * perPage, filtered.length);

  return (
    <div className="space-y-4 bg-surface-elevated/50 p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="text-base font-semibold text-content">Products</h2>
          <p className="mt-0.5 text-xs text-content-muted">Manage your products and inventory</p>
        </div>
        <Button
          className="ml-auto"
          onClick={() => navigate('new')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Add Product
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-4">
        <ProductsToolbar
          query={query}
          onQueryChange={(v) => { setQuery(v); resetPage(); }}
          total={products.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((s) => !s)}
          statusFilter={statusFilter}
          onStatusChange={(v) => { setStatusFilter(v); resetPage(); }}
          categoryFilter={categoryFilter}
          onCategoryChange={(v) => { setCategoryFilter(v); resetPage(); }}
          categories={categories}
          onClearFilters={() => { setStatusFilter(''); setCategoryFilter(''); setQuery(''); resetPage(); }}
          hasActiveFilters={hasActiveFilters}
        />

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-accent-muted px-3 py-2 text-xs text-accent">
            <span className="font-medium">{selectedIds.length} selected</span>
            <button type="button" onClick={deleteSelected} className="font-semibold underline">
              Delete selected
            </button>
            <button type="button" onClick={() => setSelectedIds([])} className="ml-auto underline">
              Clear
            </button>
          </div>
        )}

        <ProductsTable
          rows={pageRows}
          selectedIds={selectedIds}
          onToggleRow={toggleRow}
          onToggleAll={toggleAllOnPage}
          allOnPageSelected={allOnPageSelected}
          onView={setViewProduct}
          onEdit={(p) => navigate(`${p.id}/edit`)}
          onDuplicate={duplicateProduct}
          onDelete={handleDelete}
          onAddProduct={() => navigate('new')}
        />

        <ProductsPagination
          perPage={perPage}
          onPerPageChange={(n) => { setPerPage(n); resetPage(); }}
          page={safePage}
          pageCount={pageCount}
          rangeLabel={`Showing ${from}–${to} of ${filtered.length} products`}
          onPageChange={setPage}
        />
      </div>

      <ProductModal
        open={Boolean(viewProduct)}
        product={viewProduct}
        onClose={() => setViewProduct(null)}
      />

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
