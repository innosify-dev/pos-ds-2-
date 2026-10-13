import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { ConfirmationDialog } from '@shared/dialogs/ConfirmationDialog';
import { useDemo } from '@services/demo';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { formatInr } from '@modules/retail/data/products.data.js';
import { useToast } from '@shared/feedback/Toast.jsx';
import { StockBadge } from '@modules/retail/components/inventory/StockBadge.jsx';
import {
  branchQty,
  buildMovements,
  formatWhen,
  inventoryCost,
  movementLabel,
  stockLabel,
  visibleQty,
} from '@modules/retail/components/inventory/inventoryView.js';

const PAGE_SIZE = 8;

function Metric({ label, value, hint }) {
  return (
    <article className="premium-card p-3">
      <p className="text-xs font-medium text-content-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-content">{value}</p>
      <p className="mt-1 text-xs text-content-muted">{hint}</p>
    </article>
  );
}

export function InventoryScreen() {
  const { state, dispatch } = useDemo();
  const { tenant, branches, branch } = useTenant();
  const { can } = useAuth();
  const toast = useToast();
  const branchIds = branches.map((item) => item.id);
  const products = useMemo(
    () => state.products.filter((product) => product.tenantId === tenant?.id),
    [state.products, tenant?.id],
  );
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState(branch?.id || '');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [productId, setProductId] = useState('');
  const [adjustType, setAdjustType] = useState('add');
  const [qty, setQty] = useState('1');
  const [reason, setReason] = useState('Count correction');
  const [toBranch, setToBranch] = useState('');
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setBranchFilter(branch?.id || '');
  }, [branch?.id]);

  const scopeIds = branchFilter ? [branchFilter] : branchIds;
  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    [products],
  );
  const movements = useMemo(
    () => buildMovements(state, tenant?.id, branchIds, state.users || []),
    [state, tenant?.id, branchIds],
  );

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const next = products.map((product) => {
      const quantity = visibleQty(product, scopeIds);
      return {
        product,
        quantity,
        status: stockLabel(quantity, product.lowStock),
        lastAt: movements.find((item) => item.productId === product.id && scopeIds.some((id) => id === item.branchId || id === item.fromBranchId || id === item.toBranchId))?.createdAt,
      };
    }).filter((row) => {
      if (statusFilter && row.status !== statusFilter) return false;
      if (categoryFilter && row.product.category !== categoryFilter) return false;
      if (q && !`${row.product.name} ${row.product.sku} ${row.product.barcode || ''} ${row.product.category || ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
    next.sort((a, b) => {
      if (sort === 'qty') return a.quantity - b.quantity;
      if (sort === 'status') return a.status.localeCompare(b.status);
      return a.product.name.localeCompare(b.product.name);
    });
    return next;
  }, [products, scopeIds, query, statusFilter, categoryFilter, sort, movements]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const units = products.reduce((sum, product) => sum + visibleQty(product, branchIds), 0);
  const lowCount = products.filter((product) => stockLabel(visibleQty(product, branchIds), product.lowStock) === 'Low Stock').length;
  const outCount = products.filter((product) => visibleQty(product, branchIds) <= 0).length;
  const cost = inventoryCost(products, branchIds);
  const alerts = products
    .map((product) => ({ product, quantity: visibleQty(product, branchIds), status: stockLabel(visibleQty(product, branchIds), product.lowStock) }))
    .filter((row) => row.status !== 'In Stock')
    .slice(0, 6);
  const selected = products.find((product) => product.id === productId);
  const targetBranchId = branchFilter || branch?.id;
  const targetBranch = branches.find((item) => item.id === targetBranchId);
  const currentQty = selected ? branchQty(selected, targetBranchId) : 0;
  const signed = (adjustType === 'remove' ? -1 : 1) * Math.abs(Math.round(Number(qty) || 0));
  const resulting = currentQty + signed;

  const runAdjust = () => {
    if (busy) return;
    const amount = Math.abs(Math.round(Number(qty)));
    if (!productId || !amount) {
      setFormError('Choose a product and a quantity.');
      return;
    }
    if (!targetBranchId) {
      setFormError('Choose a branch.');
      return;
    }
    if (adjustType === 'remove' && resulting < 0 && selected && !selected.allowNegative) {
      setFormError(`Not enough stock for ${selected.name}.`);
      return;
    }
    if (adjustType === 'remove') {
      setPending({ kind: 'adjust' });
      return;
    }
    commitAdjust(amount);
  };

  const commitAdjust = (amount = Math.abs(Math.round(Number(qty)))) => {
    setBusy(true);
    setFormError('');
    const result = dispatch({
      type: 'stock.adjust',
      tenantId: tenant.id,
      productId,
      branchId: targetBranchId,
      delta: adjustType === 'remove' ? -amount : amount,
      reason: reason.trim() || 'Count correction',
    });
    setBusy(false);
    setPending(null);
    if (!result.ok) {
      setFormError(result.error);
      toast.push(result.error, 'danger');
      return;
    }
    toast.push('Stock adjusted', 'success');
  };

  const runTransfer = () => {
    const amount = Math.abs(Math.round(Number(qty)));
    if (!productId || !amount || !toBranch) {
      setFormError('Choose a product, quantity, and destination branch.');
      return;
    }
    if (toBranch === targetBranchId) {
      setFormError('Choose two different branches.');
      return;
    }
    if (selected && amount > branchQty(selected, targetBranchId) && !selected.allowNegative) {
      setFormError(`Not enough stock for ${selected.name}.`);
      return;
    }
    setFormError('');
    setPending({ kind: 'transfer', amount });
  };

  const commitTransfer = () => {
    if (busy) return;
    setBusy(true);
    const result = dispatch({
      type: 'stock.transfer',
      tenantId: tenant.id,
      productId,
      fromBranchId: targetBranchId,
      toBranchId: toBranch,
      qty: Math.abs(Math.round(Number(qty))),
      reason: reason.trim() || 'Branch transfer',
    });
    setBusy(false);
    setPending(null);
    if (!result.ok) {
      setFormError(result.error);
      toast.push(result.error, 'danger');
      return;
    }
    toast.push('Transferred', 'success');
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 p-3 sm:p-4">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-content">Stock</h2>
          <p className="text-xs text-content-muted">
            {tenant?.name || 'This business'}
            {' · '}
            {branches.length === 1 ? branches[0].name : `${branches.length} authorized branches`}
          </p>
        </div>
        {can('products.view') && (
          <Link to="/retail/products" className="text-sm font-medium text-accent">Products</Link>
        )}
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Metric label="Total products" value={products.length} hint="In this business" />
        <Metric label="Stock units" value={units.toLocaleString('en-IN')} hint="Authorized branches" />
        <Metric label="Low stock" value={lowCount} hint="Above zero, at or under the threshold" />
        <Metric label="Out of stock" value={outCount} hint="Zero at authorized branches" />
      </div>
      {cost.priced > 0 && (
        <p className="text-xs text-content-muted">
          Inventory at product cost: <span className="font-semibold text-content">{formatInr(cost.value)}</span>
          {cost.priced < cost.total ? ` · ${cost.total - cost.priced} products have no cost` : ' · using each product cost'}
        </p>
      )}

      <section className="premium-card p-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-content">Low stock</h3>
          <button type="button" className="text-xs font-medium text-accent" onClick={() => { setStatusFilter('Low Stock'); setPage(1); }}>
            Show in table
          </button>
        </div>
        {alerts.length === 0 ? (
          <p className="py-3 text-xs text-content-muted">No low-stock or out-of-stock products in this view.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {alerts.map((row) => (
              <li key={row.product.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-content">{row.product.name}</span>
                  <span className="text-xs text-content-muted">{row.product.sku} · threshold {row.product.lowStock ?? 0}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums">{row.quantity}</span>
                  <StockBadge status={row.status} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="premium-card p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            aria-label="Search stock"
            placeholder="Search name, SKU, or barcode"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setPage(1); }}
            className="h-9"
          />
          <Button type="button" size="sm" variant="outline" className="sm:hidden" onClick={() => setShowFilters((open) => !open)}>
            {showFilters ? 'Hide filters' : 'Filters'}
          </Button>
        </div>
        <div className={`${showFilters ? 'grid' : 'hidden'} mt-2 gap-2 sm:grid sm:grid-cols-3`}>
          <Select aria-label="Branch" value={branchFilter} onChange={(event) => { setBranchFilter(event.target.value); setPage(1); }}>
            {branches.length > 1 && <option value="">All authorized branches</option>}
            {branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </Select>
          <Select aria-label="Stock status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </Select>
          <Select aria-label="Category" value={categoryFilter} onChange={(event) => { setCategoryFilter(event.target.value); setPage(1); }}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </Select>
          <Select aria-label="Sort stock" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="name">Name</option>
            <option value="qty">Quantity</option>
            <option value="status">Status</option>
          </Select>
        </div>

        {pageRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-content-muted">
            {products.length === 0 ? 'This business has no products yet.' : 'No products match this search.'}
          </p>
        ) : (
          <>
            <ul className="mt-3 space-y-2 md:hidden">
              {pageRows.map((row) => (
                <li key={row.product.id} className="rounded-xl border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{row.product.name}</p>
                      <p className="text-xs text-content-muted">{row.product.sku} · {row.product.category || 'No category'}</p>
                    </div>
                    <StockBadge status={row.status} />
                  </div>
                  <p className="mt-2 text-xs text-content-muted">
                    {branchFilter ? targetBranch?.name : 'Authorized branches'} · {row.quantity} on hand · threshold {row.product.lowStock ?? 0}
                  </p>
                  <p className="text-xs text-content-muted">Last movement {formatWhen(row.lastAt)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-3 hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-content-muted">
                    <th className="py-2 pr-3 font-medium">Product</th>
                    <th className="py-2 pr-3 font-medium">SKU</th>
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 pr-3 font-medium">Branch</th>
                    <th className="py-2 pr-3 font-medium">Available</th>
                    <th className="py-2 pr-3 font-medium">Threshold</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 font-medium">Last movement</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => (
                    <tr key={row.product.id} className="border-b border-border/70">
                      <td className="py-2 pr-3">
                        {can('products.view') ? (
                          <Link className="font-medium text-accent" to={`/retail/products/${row.product.id}/edit`}>{row.product.name}</Link>
                        ) : row.product.name}
                        <div className="text-[11px] text-content-muted">{row.product.barcode || 'No barcode'}</div>
                      </td>
                      <td className="py-2 pr-3">{row.product.sku}</td>
                      <td className="py-2 pr-3">{row.product.category || '—'}</td>
                      <td className="py-2 pr-3">{branchFilter ? targetBranch?.name : branches.map((item) => `${item.name} ${branchQty(row.product, item.id)}`).join(' · ')}</td>
                      <td className="py-2 pr-3 tabular-nums">{row.quantity}</td>
                      <td className="py-2 pr-3 tabular-nums">{row.product.lowStock ?? 0}</td>
                      <td className="py-2 pr-3"><StockBadge status={row.status} /></td>
                      <td className="py-2 text-content-muted">{formatWhen(row.lastAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-content-muted">
          <span>{rows.length} products</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>Previous</Button>
            <span className="self-center">{safePage} / {pageCount}</span>
            <Button type="button" size="sm" variant="outline" disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)}>Next</Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="premium-card p-3">
          <h3 className="text-sm font-semibold text-content">Adjust stock</h3>
          <p className="mt-0.5 text-xs text-content-muted">
            Changes {targetBranch?.name || 'the selected branch'} in this browser’s demo data.
          </p>
          <div className="mt-3 grid gap-2">
            <Select label="Product" value={productId} onChange={(event) => setProductId(event.target.value)}>
              <option value="">Select a product</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Select label="Type" value={adjustType} onChange={(event) => setAdjustType(event.target.value)}>
                <option value="add">Add</option>
                <option value="remove">Remove</option>
              </Select>
              <Input label="Quantity" type="number" min="1" value={qty} onChange={(event) => setQty(event.target.value)} />
            </div>
            <Input label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
            {selected && (
              <p className="text-xs text-content-muted">
                {targetBranch?.name}: {currentQty} now, {resulting} after this change.
              </p>
            )}
            {formError && <p className="text-xs text-danger" role="alert">{formError}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" disabled={busy} onClick={runAdjust}>{busy ? 'Saving...' : 'Apply adjustment'}</Button>
              {branches.length > 1 && (
                <>
                  <Select aria-label="Transfer to" value={toBranch} onChange={(event) => setToBranch(event.target.value)}>
                    <option value="">Transfer to</option>
                    {branches.filter((item) => item.id !== targetBranchId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                  <Button type="button" size="sm" variant="outline" disabled={busy} onClick={runTransfer}>Transfer</Button>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="premium-card p-3">
          <h3 className="text-sm font-semibold text-content">Stock movement</h3>
          <p className="mt-0.5 text-xs text-content-muted">Sales, receipts, adjustments, transfers, and restocked returns already in this business.</p>
          {movements.length === 0 ? (
            <p className="py-6 text-xs text-content-muted">No stock movements yet.</p>
          ) : (
            <ul className="mt-2 max-h-80 divide-y divide-border overflow-auto">
              {movements.slice(0, 12).map((move) => (
                <li key={move.id} className="py-2 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-content">{move.productName}</span>
                    <span className="tabular-nums">{move.delta > 0 ? `+${move.delta}` : move.delta}</span>
                  </div>
                  <p className="text-content-muted">
                    {movementLabel(move.type)} · {formatWhen(move.createdAt)} · {move.reference}
                  </p>
                  <p className="text-content-muted">
                    {move.fromBranchId
                      ? `${branches.find((item) => item.id === move.fromBranchId)?.name || 'Branch'} → ${branches.find((item) => item.id === move.toBranchId)?.name || 'Branch'}`
                      : (branches.find((item) => item.id === move.branchId)?.name || 'Branch')}
                    {' · '}
                    {move.user}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmationDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        onConfirm={pending?.kind === 'transfer' ? commitTransfer : () => commitAdjust()}
        title={pending?.kind === 'transfer' ? 'Transfer stock?' : 'Remove stock?'}
        message={pending?.kind === 'transfer'
          ? `Move ${Math.abs(Math.round(Number(qty)) || 0)} units from ${targetBranch?.name || 'this branch'}.`
          : `Remove ${Math.abs(Math.round(Number(qty)) || 0)} units from ${targetBranch?.name || 'this branch'}. On hand would become ${resulting}.`}
        confirmLabel="Confirm"
        variant="danger"
        loading={busy}
      />
    </div>
  );
}
