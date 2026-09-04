import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { ConfirmationDialog } from '@shared/dialogs/ConfirmationDialog';
import {
  buildCategoryTree,
  collectSubtreeIds,
  flattenCategoryTree,
  initialCategories,
} from '@modules/retail/data/categories.data.js';
import {
  CategoryList,
  CategoryModal,
  CategoryTree,
} from '@modules/retail/components/categories';

/**
 * Categories screen — organize products into categories and subcategories.
 * Module-scoped hierarchy state lives here until the backend API lands.
 */
export function CategoriesScreen() {
  const [categories, setCategories] = useState(initialCategories);
  const [expandedIds, setExpandedIds] = useState(() => initialCategories.map((c) => c.id));
  const [selectedId, setSelectedId] = useState('c-sarees');
  const [modal, setModal] = useState({ open: false, mode: 'create', category: null });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const tree = useMemo(() => buildCategoryTree(categories), [categories]);
  const rows = useMemo(() => flattenCategoryTree(tree), [tree]);

  const toggleNode = (id) =>
    setExpandedIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]));

  const excludeIds = useMemo(() => {
    if (modal.mode !== 'edit' || !modal.category) return [];
    return collectSubtreeIds(categories, modal.category.id);
  }, [modal, categories]);

  const handleSave = ({ name, parentId, status }) => {
    if (modal.mode === 'edit' && modal.category) {
      setCategories((list) =>
        list.map((c) => (c.id === modal.category.id ? { ...c, name, parentId, status } : c))
      );
    } else {
      const siblings = categories.filter((c) => (c.parentId ?? null) === (parentId ?? null));
      const order = siblings.length;
      setCategories((list) => [
        ...list,
        {
          id: `c-${Date.now()}`,
          name,
          parentId,
          productCount: 0,
          status,
          order,
        },
      ]);
      if (parentId && !expandedIds.includes(parentId)) {
        setExpandedIds((ids) => [...ids, parentId]);
      }
    }
    setModal({ open: false, mode: 'create', category: null });
  };

  const handleDelete = (row) => setDeleteTarget(row);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    const ids = collectSubtreeIds(categories, deleteTarget.id);
    setCategories((list) => list.filter((c) => !ids.includes(c.id)));
    setExpandedIds((idsList) => idsList.filter((id) => !ids.includes(id)));
    if (ids.includes(selectedId)) setSelectedId(null);
    setDeleteTarget(null);
  };

  const deleteCount = deleteTarget ? collectSubtreeIds(categories, deleteTarget.id).length - 1 : 0;

  return (
    <div className="space-y-4 bg-surface-elevated/50 p-5">
      <nav aria-label="Breadcrumb" className="text-xs text-content-muted">
        <Link to="/retail/products" className="hover:text-accent">Products</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-accent">Categories</span>
      </nav>

      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="text-lg font-bold text-content">Categories</h2>
          <p className="mt-0.5 text-xs text-content-muted">
            Organize products into categories and subcategories
          </p>
        </div>
        <Button className="ml-auto" onClick={() => setModal({ open: true, mode: 'create', category: null })}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-2">
          <h3 className="mb-3 text-sm font-semibold text-content">Category hierarchy</h3>
          <CategoryTree
            nodes={tree}
            expandedIds={expandedIds}
            selectedId={selectedId}
            onToggle={toggleNode}
            onSelect={setSelectedId}
          />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-3">
          <CategoryList
            rows={rows}
            onAddSub={(row) => setModal({ open: true, mode: 'sub', category: row })}
            onEdit={(row) => setModal({ open: true, mode: 'edit', category: row })}
            onDelete={handleDelete}
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
        title="Delete Category"
        message={
          deleteTarget
            ? `Delete "${deleteTarget.name}"${deleteCount > 0 ? ` and ${deleteCount} subcategor${deleteCount === 1 ? 'y' : 'ies'}` : ''}? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
