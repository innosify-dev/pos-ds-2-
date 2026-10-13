import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { ConfirmationDialog } from '@shared/dialogs/ConfirmationDialog';
import {
  buildCategoryTree,
  collectSubtreeIds,
  flattenCategoryTree,
} from '@modules/retail/data/categories.data.js';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { CatalogShortcuts } from '@modules/retail/components/catalog/CatalogShortcuts.jsx';
import {
  CategoryList,
  CategoryModal,
  CategoryTree,
} from '@modules/retail/components/categories';

/**
 * Categories screen — organize products into categories and subcategories.
 */
export function CategoriesScreen() {
  const { state, dispatch } = useDemo();
  const { tenant } = useTenant();
  const { can } = useAuth();
  const canManage = can('products.manage');
  const categories = state.categories
    .filter((category) => category.tenantId === tenant?.id)
    .map((category, order) => ({
      ...category,
      order,
      productCount: state.products.filter((product) => product.tenantId === tenant?.id && product.category === category.name).length,
    }));
  const [expandedIds, setExpandedIds] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    setExpandedIds(categories.map((category) => category.id));
    setSelectedId((current) => (categories.some((category) => category.id === current) ? current : categories[0]?.id || ''));
  }, [tenant?.id]);
  const [modal, setModal] = useState({ open: false, mode: 'create', category: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const rows = useMemo(() => flattenCategoryTree(tree), [tree]);
  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => row.name.toLowerCase().includes(q));
  }, [rows, query]);

  const toggleNode = (id) =>
    setExpandedIds((ids) => (ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]));

  const excludeIds = useMemo(() => {
    if (modal.mode !== 'edit' || !modal.category) return [];
    return collectSubtreeIds(categories, modal.category.id);
  }, [modal, categories]);

  const handleSave = ({ name, parentId, status }) => {
    dispatch({
      type: 'category.save',
      record: {
        id: modal.mode === 'edit' ? modal.category?.id : undefined,
        tenantId: tenant.id,
        name,
        parentId: parentId || null,
        status,
      },
    });
    if (parentId && !expandedIds.includes(parentId)) setExpandedIds((ids) => [...ids, parentId]);
    setModal({ open: false, mode: 'create', category: null });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    dispatch({ type: 'category.delete', id: deleteTarget.id });
    setDeleteTarget(null);
  };

  const deleteCount = deleteTarget ? collectSubtreeIds(categories, deleteTarget.id).length - 1 : 0;
  const linkedProducts = deleteTarget?.productCount || 0;

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-4 sm:p-6">
      <nav aria-label="Breadcrumb" className="text-xs text-content-muted">
        <Link to="/retail/products" className="hover:text-accent">Products</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-content">Categories</span>
      </nav>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Catalog</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-content">Categories</h2>
          <p className="mt-1 text-sm text-content-muted">
            {categories.length} categor{categories.length === 1 ? 'y' : 'ies'} in this business.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          {canManage && (
            <Button onClick={() => setModal({ open: true, mode: 'create', category: null })}>
              Add Category
            </Button>
          )}
          <CatalogShortcuts items={[
            { to: '/retail/products', label: 'View products' },
            { to: '/retail/brands', label: 'Brands' },
          ]} />
        </div>
      </header>

      <div className="max-w-sm">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search categories"
          aria-label="Search categories"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="premium-card p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-content">Hierarchy</h3>
          <CategoryTree
            nodes={tree}
            expandedIds={expandedIds}
            selectedId={selectedId}
            onToggle={toggleNode}
            onSelect={setSelectedId}
          />
        </div>
        <div className="premium-card p-4 lg:col-span-3">
          <h3 className="mb-1 text-sm font-semibold text-content">All categories</h3>
          <CategoryList
            rows={visibleRows}
            canManage={canManage}
            onAddSub={(row) => setModal({ open: true, mode: 'sub', category: row })}
            onEdit={(row) => setModal({ open: true, mode: 'edit', category: row })}
            onDelete={setDeleteTarget}
            emptyTitle={categories.length === 0 ? 'No categories yet' : 'No categories match'}
            emptyDescription={categories.length === 0
              ? 'Organize your catalog by creating your first category.'
              : 'Try a different name.'}
          />
        </div>
      </div>

      <CategoryModal
        open={modal.open}
        mode={modal.mode}
        category={modal.category}
        tree={tree}
        excludeIds={excludeIds}
        onClose={() => setModal({ open: false, mode: 'create', category: null })}
        onSave={handleSave}
      />

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete category"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"${deleteCount > 0 ? ` and ${deleteCount} subcategor${deleteCount === 1 ? 'y' : 'ies'}` : ''}?${linkedProducts > 0 ? ` ${linkedProducts} product${linkedProducts === 1 ? '' : 's'} still use this category name.` : ''} This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
