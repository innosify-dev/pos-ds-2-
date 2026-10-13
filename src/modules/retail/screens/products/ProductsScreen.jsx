import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { ConfirmationDialog } from '@shared/dialogs/ConfirmationDialog';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useProducts } from '@modules/retail/store/ProductsContext.jsx';
import { CatalogShortcuts } from '@modules/retail/components/catalog/CatalogShortcuts.jsx';
import {
  ProductModal,
  ProductsPagination,
  ProductsTable,
  ProductsToolbar,
} from '@modules/retail/components/products';

/**
 * Products screen — manage products for the active business.
 * List state comes from ProductsProvider; add/edit live on form routes.
 */
export function ProductsScreen() {
  const { products, deleteProduct, duplicateProduct } = useProducts();
  const { can } = useAuth();
  const canManage = can('products.manage');
  const canStock = can('inventory.manage');
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products],
  );
  const brands = useMemo(
    () => [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = products.filter((product) => {
      if (statusFilter && product.status !== statusFilter) return false;
      if (categoryFilter && product.category !== categoryFilter) return false;
      if (brandFilter && product.brand !== brandFilter) return false;
      if (q && !`${product.name} ${product.sku} ${product.barcode || ''} ${product.category} ${product.brand || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === 'name') rows.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'price') rows.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'stock') rows.sort((a, b) => Number(a.stock) - Number(b.stock));
    return rows;
  }, [products, query, statusFilter, categoryFilter, brandFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * perPage, safePage * perPage);
  const allOnPageSelected = pageRows.length > 0 && pageRows.every((product) => selectedIds.includes(product.id));

  const resetPage = () => setPage(1);
  const hasActiveFilters = statusFilter !== '' || categoryFilter !== '' || brandFilter !== '' || sort !== '' || query.trim() !== '';
  const catalogEmpty = products.length === 0;

  const toggleRow = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));

  const toggleAllOnPage = () =>
    setSelectedIds((ids) =>
      allOnPageSelected ? ids.filter((id) => !pageRows.some((product) => product.id === id)) : [...new Set([...ids, ...pageRows.map((product) => product.id)])],
    );

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

  const shortcuts = [
    { to: '/retail/categories', label: 'Categories' },
    { to: '/retail/brands', label: 'Brands' },
    ...(canStock ? [{ to: '/retail/inventory', label: 'View stock' }] : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Catalog</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-content">Products</h2>
          <p className="mt-1 text-sm text-content-muted">
            {products.length} product{products.length === 1 ? '' : 's'} in this business.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          {canManage && (
            <Button onClick={() => navigate('new')}>Add Product</Button>
          )}
          <CatalogShortcuts items={shortcuts} />
        </div>
      </header>

      <section className="space-y-4">
        <div className="premium-card p-4 sm:p-5">
        <ProductsToolbar
          query={query}
          onQueryChange={(value) => { setQuery(value); resetPage(); }}
          total={products.length}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((open) => !open)}
          statusFilter={statusFilter}
          onStatusChange={(value) => { setStatusFilter(value); resetPage(); }}
          categoryFilter={categoryFilter}
          onCategoryChange={(value) => { setCategoryFilter(value); resetPage(); }}
          categories={categories}
          brandFilter={brandFilter}
          onBrandChange={(value) => { setBrandFilter(value); resetPage(); }}
          brands={brands}
          sort={sort}
          onSortChange={(value) => { setSort(value); resetPage(); }}
          onClearFilters={() => { setStatusFilter(''); setCategoryFilter(''); setBrandFilter(''); setSort(''); setQuery(''); resetPage(); }}
          hasActiveFilters={hasActiveFilters}
        />
        </div>

        {canManage && selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-accent-muted px-3 py-2 text-xs text-accent">
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
          onEdit={(product) => navigate(`${product.id}/edit`)}
          onDuplicate={duplicateProduct}
          onDelete={setDeleteTarget}
          onAddProduct={() => navigate('new')}
          canManage={canManage}
          emptyTitle={catalogEmpty ? 'No products yet' : 'No products match'}
          emptyDescription={catalogEmpty
            ? 'Add your first product to start building your catalog.'
            : 'Try a different search, or clear the filters.'}
        />

        <ProductsPagination
          perPage={perPage}
          onPerPageChange={(count) => { setPerPage(count); resetPage(); }}
          page={safePage}
          pageCount={pageCount}
          rangeLabel={`Showing ${from}–${to} of ${filtered.length} products`}
          onPageChange={setPage}
        />
      </section>

      <ProductModal
        open={Boolean(viewProduct)}
        product={viewProduct}
        canManage={canManage}
        onClose={() => setViewProduct(null)}
        onEdit={(product) => {
          setViewProduct(null);
          navigate(`${product.id}/edit`);
        }}
      />

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete product"
        message={deleteTarget ? `Delete "${deleteTarget.name}"? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
