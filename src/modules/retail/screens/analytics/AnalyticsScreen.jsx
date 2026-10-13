import { useEffect, useMemo, useState } from 'react';
import { AnimatedAreaChart } from '@shared/display/AnimatedAreaChart';
import { PanelCard } from '@shared/display/PanelCard';
import { StatCard } from '@modules/retail/components/dashboard/StatCard';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { useToast } from '@shared/feedback/Toast.jsx';
import { useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { branchStock, refundedPaise } from '@services/demo/engine.js';
import { analyticsModel, userById } from '@services/demo/metrics.js';
import { formatPaise } from '@services/demo/money.js';

const TABS = [
  { id: 'sales', label: 'Sales' },
  { id: 'inventory', label: 'Inventory' },
  { id: 'purchases', label: 'Purchases' },
  { id: 'tax', label: 'Tax' },
];

const PAGE_SIZE = 8;

function csvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function moneyValue(paise) {
  return (Number(paise || 0) / 100).toFixed(2);
}

export function AnalyticsScreen() {
  const { state } = useDemo();
  const { tenant, plan, branch, branches } = useTenant();
  const toast = useToast();
  const [days, setDays] = useState(30);
  const [branchId, setBranchId] = useState(branches.length <= 1 ? branch?.id || '' : '');
  useEffect(() => {
    if (branches.length === 1) setBranchId(branches[0].id);
  }, [branches]);
  const [tab, setTab] = useState('sales');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const scopedBranch = branchId || undefined;
  const model = useMemo(
    () => analyticsModel(state, tenant?.id, days, scopedBranch),
    [state, tenant?.id, days, scopedBranch],
  );

  const names = useMemo(() => {
    const branchName = Object.fromEntries(branches.map((item) => [item.id, item.name]));
    const customerName = Object.fromEntries(state.customers.filter((item) => item.tenantId === tenant?.id).map((item) => [item.id, item.name]));
    const supplierName = Object.fromEntries(state.suppliers.filter((item) => item.tenantId === tenant?.id).map((item) => [item.id, item.name]));
    return { branchName, customerName, supplierName };
  }, [branches, state.customers, state.suppliers, tenant?.id]);

  const salesRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = (model.sales || []).filter((sale) => {
      const refunded = refundedPaise(state, sale.id) > 0;
      const saleStatus = sale.status || 'PAID';
      if (status === 'REFUND' && !refunded) return false;
      if (status && status !== 'REFUND' && saleStatus !== status) return false;
      if (!needle) return true;
      const customer = names.customerName[sale.customerId] || '';
      const cashier = userById(state, sale.cashierId);
      const cashierName = cashier ? `${cashier.firstName} ${cashier.lastName}` : '';
      return `${sale.invoiceNo} ${customer} ${cashierName}`.toLowerCase().includes(needle);
    });
    rows.sort((a, b) => {
      if (sort === 'total') return (b.totalPaise || 0) - (a.totalPaise || 0);
      if (sort === 'invoice') return String(a.invoiceNo).localeCompare(String(b.invoiceNo));
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return rows;
  }, [model.sales, query, status, sort, state, names.customerName]);

  const breakdown = useMemo(() => {
    const byMethod = new Map();
    const byProduct = new Map();
    const byCategory = new Map();
    const byBranch = new Map();
    const dayMap = new Map();
    const taxMap = new Map();
    salesRows.forEach((sale) => {
      (sale.payments || []).forEach((payment) => {
        byMethod.set(payment.method, (byMethod.get(payment.method) || 0) + (payment.amountPaise || 0));
      });
      (sale.lines || []).forEach((line) => {
        byProduct.set(line.name, (byProduct.get(line.name) || 0) + (line.totalPaise || 0));
        const product = state.products.find((item) => item.id === line.productId);
        const category = product?.category || 'Other';
        byCategory.set(category, (byCategory.get(category) || 0) + (line.totalPaise || 0));
        const rate = line.taxRate ?? 0;
        const band = taxMap.get(rate) || { rate, taxPaise: 0, taxablePaise: 0, lines: 0 };
        band.taxPaise += line.taxPaise || 0;
        band.taxablePaise += line.taxablePaise ?? Math.max(0, (line.totalPaise || 0) - (line.taxPaise || 0));
        band.lines += 1;
        taxMap.set(rate, band);
      });
      const branchName = names.branchName[sale.branchId] || 'Branch';
      byBranch.set(branchName, (byBranch.get(branchName) || 0) + (sale.totalPaise || 0));
      const date = new Date(sale.createdAt);
      const key = date.toISOString().slice(0, 10);
      const current = dayMap.get(key) || { key, label: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), amountPaise: 0 };
      current.amountPaise += sale.totalPaise || 0;
      dayMap.set(key, current);
    });
    const toRows = (map) => [...map.entries()].map(([name, amountPaise]) => ({ name, amountPaise })).sort((a, b) => b.amountPaise - a.amountPaise);
    return {
      byMethod: toRows(byMethod),
      byProduct: toRows(byProduct),
      byCategory: toRows(byCategory),
      byBranch: toRows(byBranch),
      daily: [...dayMap.values()].sort((a, b) => a.key.localeCompare(b.key)).map((day) => ({ label: day.label, value: Math.round(day.amountPaise / 100) })),
      taxBands: [...taxMap.values()].sort((a, b) => a.rate - b.rate),
    };
  }, [salesRows, state.products, names.branchName]);
  const dailySeries = breakdown.daily;
  const pageCount = Math.max(1, Math.ceil(salesRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = salesRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const filteredRevenue = salesRows.reduce((sum, sale) => sum + (sale.totalPaise || 0), 0);
  const filteredDiscount = salesRows.reduce((sum, sale) => sum + (sale.discountPaise || 0), 0);
  const filteredTax = salesRows.reduce((sum, sale) => sum + (sale.taxPaise || 0), 0);
  const average = salesRows.length ? Math.round(filteredRevenue / salesRows.length) : 0;

  if (plan?.code === 'FREE') {
    return (
      <div className="p-5">
        <h2 className="text-base font-semibold">Reports</h2>
        <p className="mt-2 max-w-xl text-sm text-content-muted">Reports are included from the Starter plan upward. This business is on Free. The limit is a demo rule, changed under Subscription.</p>
      </div>
    );
  }

  const exportCsv = () => {
    try {
      const header = ['invoice', 'date', 'branch', 'cashier', 'customer', 'payment', 'tax', 'discount', 'total', 'status'];
      const lines = salesRows.map((sale) => {
        const cashier = userById(state, sale.cashierId);
        const refunded = refundedPaise(state, sale.id);
        return [
          sale.invoiceNo,
          new Date(sale.createdAt).toLocaleString('en-IN'),
          names.branchName[sale.branchId] || '',
          cashier ? `${cashier.firstName} ${cashier.lastName}` : '',
          names.customerName[sale.customerId] || 'Walk-in',
          (sale.payments || []).map((payment) => payment.method).join(' + '),
          moneyValue(sale.taxPaise),
          moneyValue(sale.discountPaise),
          moneyValue(sale.totalPaise),
          refunded ? `${sale.status || 'PAID'} (refund ${moneyValue(refunded)})` : (sale.status || 'PAID'),
        ].map(csvCell).join(',');
      });
      const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tenant?.slug || 'reports'}-sales.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.push(lines.length ? `Exported ${lines.length} sales for ${tenant?.name}.` : 'No sales matched the filters. The file contains headings only.', lines.length ? 'success' : 'danger');
    } catch (error) {
      toast.push(error?.message || 'Export failed.', 'danger');
    }
  };

  const movements = (state.stockMoves || []).filter((move) => {
    if (move.tenantId !== tenant?.id) return false;
    if (!scopedBranch) return branches.some((item) => item.id === move.branchId || item.id === move.fromBranchId || item.id === move.toBranchId);
    return move.branchId === scopedBranch || move.fromBranchId === scopedBranch || move.toBranchId === scopedBranch;
  });
  const supplierCounts = model.purchases.reduce((map, purchase) => {
    const name = names.supplierName[purchase.supplierId] || 'Supplier';
    map.set(name, (map.get(name) || 0) + 1);
    return map;
  }, new Map());

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-content">Reports</h2>
          <p className="mt-0.5 max-w-2xl text-xs text-content-muted">
            {tenant?.name} · {scopedBranch ? names.branchName[scopedBranch] : 'All authorized branches'}. Figures come from the same demo sales, stock, and receipts as billing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="report-branch">Branch</label>
          <select
            id="report-branch"
            className="h-8 rounded-xl border border-border bg-surface px-2 text-xs"
            value={branchId}
            disabled={branches.length <= 1}
            onChange={(event) => { setBranchId(event.target.value); setPage(1); }}
          >
            {branches.length > 1 && <option value="">All authorized branches</option>}
            {branches.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          {[7, 30, 90].map((value) => (
            <Button key={value} size="sm" variant={days === value ? 'primary' : 'outline'} onClick={() => { setDays(value); setPage(1); }}>{value} days</Button>
          ))}
          <Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>
        </div>
      </header>

      <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="Report groups">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${tab === item.id ? 'bg-accent text-content-inverse' : 'text-content-muted hover:bg-surface-muted'}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'sales' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard compact label="Total sales" value={Math.round(filteredRevenue / 100)} hint="Completed invoices in this view" format={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`} />
            <StatCard compact label="Transactions" value={salesRows.length} hint="Each invoice counted once" />
            <StatCard compact label="Average bill" value={Math.round(average / 100)} hint="Total sales divided by transactions" format={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`} />
            <StatCard compact label="Discounts" value={Math.round(filteredDiscount / 100)} hint="Recorded on those invoices" format={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`} />
          </div>
            <PanelCard title="Daily sales" subtitle="Sum of invoice totals for each day in the current filters">
            {dailySeries.length ? (
              <>
                <AnimatedAreaChart series={dailySeries} height={200} />
                <p className="sr-only">{dailySeries.map((point) => `${point.label} ₹${point.value}`).join(', ')}</p>
              </>
            ) : <p className="text-sm text-content-muted">No sales in this range.</p>}
          </PanelCard>
          <div className="grid gap-4 lg:grid-cols-2">
            <PanelCard title="Payment methods" subtitle="Amounts recorded on payments, including cash tendered">
              <AmountList rows={breakdown.byMethod} currency={tenant?.currency} />
            </PanelCard>
            <PanelCard title="Top products" subtitle="Line totals from the same invoices">
              <AmountList rows={breakdown.byProduct.slice(0, 6)} currency={tenant?.currency} />
            </PanelCard>
            <PanelCard title="By category"><AmountList rows={breakdown.byCategory} currency={tenant?.currency} /></PanelCard>
            {branches.length > 1 && <PanelCard title="By branch"><AmountList rows={breakdown.byBranch} currency={tenant?.currency} /></PanelCard>}
          </div>
          <PanelCard title="Sales" subtitle="Search and status apply to this table and the totals above">
            <div className="mb-3 grid gap-2 sm:grid-cols-3">
              <Input label="Search" value={query} placeholder="Invoice, customer, cashier" onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
              <Select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                <option value="PAID">Paid</option>
                <option value="REFUND">Refund recorded</option>
              </Select>
              <Select label="Sort" value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="newest">Newest</option>
                <option value="total">Highest total</option>
                <option value="invoice">Invoice number</option>
              </Select>
            </div>
            {pageRows.length === 0 ? <p className="text-sm text-content-muted">No sales match these filters.</p> : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="text-xs text-content-muted">
                      <tr>
                        {['Invoice', 'When', 'Branch', 'Cashier', 'Customer', 'Payment', 'Tax', 'Discount', 'Total', 'Status'].map((heading) => (
                          <th key={heading} className="py-2 pr-3 font-medium">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((sale) => {
                        const cashier = userById(state, sale.cashierId);
                        const refunded = refundedPaise(state, sale.id);
                        return (
                          <tr key={sale.id} className="border-t border-border/70">
                            <td className="py-2 pr-3 font-medium">{sale.invoiceNo}</td>
                            <td className="py-2 pr-3 whitespace-nowrap">{new Date(sale.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                            <td className="py-2 pr-3">{names.branchName[sale.branchId] || '—'}</td>
                            <td className="py-2 pr-3">{cashier ? `${cashier.firstName} ${cashier.lastName}` : '—'}</td>
                            <td className="py-2 pr-3">{names.customerName[sale.customerId] || 'Walk-in'}</td>
                            <td className="py-2 pr-3">{(sale.payments || []).map((payment) => payment.method).join(' + ') || '—'}</td>
                            <td className="py-2 pr-3 tabular-nums">{formatPaise(sale.taxPaise, tenant?.currency)}</td>
                            <td className="py-2 pr-3 tabular-nums">{formatPaise(sale.discountPaise, tenant?.currency)}</td>
                            <td className="py-2 pr-3 tabular-nums">{formatPaise(sale.totalPaise, tenant?.currency)}</td>
                            <td className="py-2 pr-3">{refunded ? 'Paid · refund recorded' : (sale.status || 'Paid')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <ul className="space-y-2 md:hidden">
                  {pageRows.map((sale) => (
                    <li key={sale.id} className="rounded-xl border border-border p-3 text-sm">
                      <p className="font-medium">{sale.invoiceNo}</p>
                      <p className="text-xs text-content-muted">{new Date(sale.createdAt).toLocaleString('en-IN')} · {names.branchName[sale.branchId]}</p>
                      <p className="mt-1 tabular-nums">{formatPaise(sale.totalPaise, tenant?.currency)} · GST {formatPaise(sale.taxPaise, tenant?.currency)}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center justify-between text-xs text-content-muted">
                  <span>Showing {pageRows.length} of {salesRows.length}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={safePage <= 1} onClick={() => setPage((current) => current - 1)}>Previous</Button>
                    <Button size="sm" variant="outline" disabled={safePage >= pageCount} onClick={() => setPage((current) => current + 1)}>Next</Button>
                  </div>
                </div>
              </>
            )}
          </PanelCard>
        </>
      )}

      {tab === 'inventory' && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard compact label="Units on hand" value={model.stockUnits} hint={scopedBranch ? 'This branch' : 'Authorized branches combined'} />
            <StatCard compact label="Low stock" value={model.lowStock.length} hint="Above zero and at or below the reorder level" />
            <StatCard compact label="Out of stock" value={model.outOfStock.length} hint="Zero units in this view" />
            <StatCard compact label="Valuation" value={Math.round(model.valuationPaise / 100)} hint="Quantity times recorded cost. Missing cost counts as zero." format={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`} />
          </div>
          <PanelCard title="Stock" subtitle="Taken from the same product stock used by inventory">
            <ul className="space-y-1 text-sm">
              {(model.lowStock.concat(model.outOfStock)).slice(0, 12).map((product) => {
                const qty = scopedBranch ? branchStock(product, scopedBranch) : Object.values(product.stockByBranch || {}).reduce((sum, value) => sum + value, 0);
                return <li key={product.id} className="flex justify-between gap-3"><span>{product.name}</span><span className="tabular-nums">{qty} · {product.costPrice ? formatPaise(Math.round(product.costPrice * 100), tenant?.currency) + ' cost' : 'No cost recorded'}</span></li>;
              })}
              {model.lowStock.length + model.outOfStock.length === 0 && <li className="text-content-muted">No low or empty items in this view.</li>}
            </ul>
          </PanelCard>
          <PanelCard title="Stock movements" subtitle="Adjustments and transfers recorded for this business">
            {movements.length === 0 ? <p className="text-sm text-content-muted">No stock movements are recorded.</p> : (
              <ul className="space-y-1 text-sm">
                {movements.slice(0, 12).map((move) => {
                  const product = state.products.find((item) => item.id === move.productId);
                  return <li key={move.id}>{product?.name || 'Item'} · {move.type} {move.delta > 0 ? `+${move.delta}` : move.delta} · {move.reason}</li>;
                })}
              </ul>
            )}
          </PanelCard>
        </>
      )}

      {tab === 'purchases' && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard compact label="Receipts" value={model.purchases.length} hint="Goods receipts in this range" />
            <StatCard compact label="Received" value={model.purchases.filter((item) => item.status === 'RECEIVED' || !item.status).length} hint="Pending receipts are not treated as stock" />
            <StatCard compact label="Suppliers" value={supplierCounts.size} hint="Count of suppliers on those receipts" />
          </div>
          <PanelCard title="Purchase receipts" subtitle="These records do not store a rupee total, so no purchase value is shown.">
            {model.purchases.length === 0 ? <p className="text-sm text-content-muted">No purchase receipts in this range.</p> : (
              <ul className="space-y-2 text-sm">
                {model.purchases.map((purchase) => (
                  <li key={purchase.id} className="rounded-xl border border-border p-3">
                    <p className="font-medium">{names.supplierName[purchase.supplierId] || 'Supplier'} · {purchase.status || 'Received'}</p>
                    <p className="text-xs text-content-muted">{names.branchName[purchase.branchId] || 'Branch'} · {new Date(purchase.createdAt).toLocaleString('en-IN')}</p>
                    <p className="mt-1">{purchase.lines.map((line) => `${line.name} × ${line.qty}`).join(', ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </PanelCard>
        </>
      )}

      {tab === 'tax' && (
        <>
          <p className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-content-muted">
            Sample tax from recorded sale lines in this demo. This is not a GST return and it is not a compliance certificate. CGST, SGST, and IGST are not stored separately.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <StatCard compact label="GST recorded" value={Math.round(filteredTax / 100)} hint="Sum of tax on the sales in the current filters" format={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`} />
            <StatCard compact label="Taxable value" value={Math.round(breakdown.taxBands.reduce((sum, band) => sum + band.taxablePaise, 0) / 100)} hint="Recorded taxable amount on those lines" format={(value) => `₹${Math.round(value).toLocaleString('en-IN')}`} />
          </div>
          <PanelCard title="Rate breakdown" subtitle="Grouped by the tax rate stored on each sale line">
            {breakdown.taxBands.length === 0 ? <p className="text-sm text-content-muted">No tax was recorded in this range.</p> : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs text-content-muted"><tr><th className="py-2">Rate</th><th>Lines</th><th>Taxable</th><th>GST</th></tr></thead>
                <tbody>
                  {breakdown.taxBands.map((band) => (
                    <tr key={band.rate} className="border-t border-border/70">
                      <td className="py-2">{band.rate}%</td>
                      <td>{band.lines}</td>
                      <td className="tabular-nums">{formatPaise(band.taxablePaise, tenant?.currency)}</td>
                      <td className="tabular-nums">{formatPaise(band.taxPaise, tenant?.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </PanelCard>
        </>
      )}
    </div>
  );
}

function AmountList({ rows, currency }) {
  if (!rows?.length) return <p className="text-sm text-content-muted">No sales in this range.</p>;
  return (
    <ul className="space-y-1 text-sm">
      {rows.map((row) => (
        <li key={row.name} className="flex justify-between gap-3">
          <span className="truncate">{row.name}</span>
          <span className="tabular-nums">{formatPaise(row.amountPaise, currency)}</span>
        </li>
      ))}
    </ul>
  );
}
