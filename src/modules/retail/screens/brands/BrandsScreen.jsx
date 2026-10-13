import { useMemo, useState } from 'react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/tables/Table';
import { EmptyState } from '@shared/feedback/EmptyState';
import { ConfirmationDialog } from '@shared/dialogs/ConfirmationDialog';
import { useProducts } from '@modules/retail/store/ProductsContext.jsx';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { CatalogShortcuts } from '@modules/retail/components/catalog/CatalogShortcuts.jsx';

/**
 * Brands screen — names used on products in the active business.
 */
export function BrandsScreen() {
  const { products } = useProducts();
  const { state, dispatch } = useDemo();
  const { tenant } = useTenant();
  const { can } = useAuth();
  const canManage = can('products.manage');
  const brands = state.brands.filter((brand) => brand.tenantId === tenant?.id);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const rows = useMemo(
    () => brands.map((brand) => ({
      ...brand,
      products: products.filter((product) => product.brand?.toLowerCase() === brand.name.toLowerCase()).length,
    })),
    [brands, products],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((brand) => brand.name.toLowerCase().includes(q));
  }, [rows, query]);

  const saveBrand = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Brand name is required.');
      return;
    }
    const duplicate = brands.some((brand) => brand.id !== editingId && brand.name.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      setError('That brand already exists in this business.');
      return;
    }
    dispatch({
      type: 'brand.save',
      record: { id: editingId || undefined, tenantId: tenant.id, name: trimmed },
    });
    setName('');
    setEditingId(null);
    setError('');
  };

  const startEdit = (brand) => {
    setEditingId(brand.id);
    setName(brand.name);
    setError('');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    dispatch({ type: 'brand.delete', id: deleteTarget.id });
    if (editingId === deleteTarget.id) {
      setEditingId(null);
      setName('');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Catalog</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-content">Brands</h2>
          <p className="mt-1 text-sm text-content-muted">
            {brands.length} brand{brands.length === 1 ? '' : 's'} in this business.
          </p>
        </div>
        <CatalogShortcuts items={[
          { to: '/retail/products', label: 'View products' },
          { to: '/retail/categories', label: 'Categories' },
        ]} />
      </header>

      {canManage && (
        <form
          className="premium-card grid gap-3 p-4 sm:grid-cols-[minmax(0,20rem)_auto] sm:items-end"
          onSubmit={(event) => {
            event.preventDefault();
            saveBrand();
          }}
        >
          <Input
            label={editingId ? 'Edit brand' : 'Brand name'}
            value={name}
            onChange={(event) => { setName(event.target.value); setError(''); }}
            placeholder="Brand name"
            error={error}
          />
          <div className="flex gap-2">
            <Button type="submit">{editingId ? 'Save brand' : 'Add brand'}</Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={() => { setEditingId(null); setName(''); setError(''); }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      <div className="max-w-sm">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search brands"
          aria-label="Search brands"
        />
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={brands.length === 0 ? 'No brands yet' : 'No brands match'}
          description={brands.length === 0
            ? 'Add brands to make your product catalog easier to manage.'
            : 'Try a different name.'}
        />
      ) : (
        <>
          <ul className="space-y-3 md:hidden">
            {visible.map((brand) => (
              <li key={brand.id} className="premium-card flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{brand.name}</p>
                  <p className="text-xs text-content-muted">{brand.products} product{brand.products === 1 ? '' : 's'}</p>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(brand)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(brand)}>Delete</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="hidden md:block">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Brand</TableHeader>
                  <TableHeader>Products</TableHeader>
                  {canManage && <TableHeader className="text-right">Actions</TableHeader>}
                </TableRow>
              </TableHead>
              <TableBody>
                {visible.map((brand) => (
                  <TableRow key={brand.id} className="hover:bg-canvas">
                    <TableCell className="font-medium">{brand.name}</TableCell>
                    <TableCell>{brand.products}</TableCell>
                    {canManage && (
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(brand)}>Edit</Button>
                          <Button size="sm" variant="ghost" className="text-danger" onClick={() => setDeleteTarget(brand)}>Delete</Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete brand"
        message={deleteTarget
          ? `Delete "${deleteTarget.name}"?${deleteTarget.products > 0 ? ` ${deleteTarget.products} product${deleteTarget.products === 1 ? '' : 's'} still use this name. Those products are not changed.` : ''} This cannot be undone.`
          : ''}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
