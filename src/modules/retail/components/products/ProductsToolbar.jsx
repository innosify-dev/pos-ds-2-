import { Badge } from '@shared/display/Badge';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { Button } from '@shared/ui/Button';
import { productStatuses } from '@modules/retail/data/products.data.js';

/**
 * Products toolbar — search, total count, and filter panel toggle.
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
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-52 flex-1 sm:max-w-xs">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <Input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search products by name, SKU, HSN..."
              className="pl-9"
              aria-label="Search products"
            />
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-content">
            Total Products <span className="font-semibold">{total}</span>
          </span>
          <Button variant={showFilters || hasActiveFilters ? 'primary' : 'outline'} size="sm" onClick={onToggleFilters}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            Filter
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface-elevated p-3">
          <div className="w-44">
            <Select label="Status" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
              <option value="">All statuses</option>
              {productStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div className="w-44">
            <Select label="Category" value={categoryFilter} onChange={(e) => onCategoryChange(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              Clear
            </Button>
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
    'In Stock': 'warning',
    'Low Stock': 'warning',
    'Out of Stock': 'danger',
    Draft: 'default',
  };
  return <Badge variant={variants[status] ?? 'default'} className="whitespace-nowrap">{status}</Badge>;
}
