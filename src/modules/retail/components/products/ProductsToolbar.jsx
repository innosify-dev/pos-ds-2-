import { Badge } from '@shared/display/Badge';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { Button } from '@shared/ui/Button';
import { productStatuses } from '@modules/retail/data/products.data.js';

/**
 * Products toolbar — search, total count, and client-side filters.
 * Filter state lives in the screen; this is presentational.
 */
export function ProductsToolbar({
  query,
  onQueryChange,
  total,
  showFilters,
  onToggleFilters,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
  brandFilter,
  onBrandChange,
  brands,
  sort,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search by name, SKU, or barcode"
              className="pl-9"
              aria-label="Search products"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 sm:ml-auto">
          <span className="text-xs text-content-muted">
            <span className="font-semibold text-content">{total}</span> in this business
          </span>
          <Button variant={showFilters || hasActiveFilters ? 'primary' : 'outline'} size="sm" onClick={onToggleFilters} aria-expanded={showFilters}>
            Filter
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-3 rounded-xl border border-border bg-canvas p-3 sm:grid-cols-2 xl:grid-cols-4">
          <Select label="Status" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
            <option value="">All statuses</option>
            {productStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select label="Category" value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select label="Brand" value={brandFilter} onChange={(e) => onBrandChange(e.target.value)}>
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </Select>
          <Select label="Sort" value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="">Catalog order</option>
            <option value="name">Name</option>
            <option value="price">Selling price</option>
            <option value="stock">Stock</option>
          </Select>
          {hasActiveFilters && (
            <div className="sm:col-span-2 xl:col-span-4">
              <Button variant="ghost" size="sm" onClick={onClearFilters}>
                Clear filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }) {
  const variants = {
    Active: 'success',
    Inactive: 'danger',
    'In Stock': 'success',
    'In stock': 'success',
    'Low Stock': 'warning',
    'Low stock': 'warning',
    'Out of Stock': 'danger',
    'Out of stock': 'danger',
    Draft: 'default',
  };
  return <Badge variant={variants[status] ?? 'default'} className="whitespace-nowrap">{status}</Badge>;
}
