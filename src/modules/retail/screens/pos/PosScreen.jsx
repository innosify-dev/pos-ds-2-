import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { demoMode, useDemo } from '@services/demo';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { branchStock } from '@services/demo/engine.js';
import { formatPaise, quoteCart, rupeesToPaise } from '@services/demo/money.js';
import { useToast } from '@shared/feedback/Toast.jsx';
import './receipt.css';

export function BarcodeImage({ value }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, String(value), { format: 'CODE128', height: 48, margin: 0, fontSize: 12 });
    } catch {
      /* invalid barcode value */
    }
  }, [value]);
  return <svg ref={ref} />;
}

const payMethods = [
  ['cash', 'Cash'],
  ['upi', 'UPI'],
  ['card', 'Card'],
  ['split', 'Split'],
];

function money(paise, currency) {
  return formatPaise(paise, currency);
}

export function PosScreen() {
  const { state, dispatch } = useDemo();
  const { tenantUser, tenantSession, can } = useAuth();
  const { tenant, branch } = useTenant();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const [scan, setScan] = useState('');
  const [cart, setCart] = useState([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [customerId, setCustomerId] = useState('');
  const [payOpen, setPayOpen] = useState(false);
  const [method, setMethod] = useState('cash');
  const [tender, setTender] = useState('');
  const [cardSplit, setCardSplit] = useState('');
  const [upiState, setUpiState] = useState('idle');
  const [qr, setQr] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [paying, setPaying] = useState(false);
  const payingRef = useRef(false);
  const barcodeRef = useRef(null);
  const searchRef = useRef(null);
  const scanLock = useRef(false);

  const products = state.products.filter((product) => product.tenantId === tenant?.id);
  const customers = state.customers.filter((customer) => customer.tenantId === tenant?.id);
  const registers = state.registers.filter((register) => register.branchId === branch?.id);
  const register = registers.find((item) => item.status === 'Open') || registers[0];
  const held = state.heldBills.filter((bill) => bill.tenantId === tenant?.id);
  const categories = ['All', ...new Set(products.map((product) => product.category).filter(Boolean))];

  const quote = useMemo(() => {
    const lines = cart.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name,
        qty: item.qty,
        unitPricePaise: rupeesToPaise(product?.price || 0),
        discountPaise: rupeesToPaise(item.discount || 0),
        taxRate: product?.taxRate || 0,
      };
    });
    return quoteCart(lines, rupeesToPaise(billDiscount || 0));
  }, [cart, billDiscount, products]);

  const taxBands = quote.lines.reduce((bands, line) => {
    const rate = line.taxRate || 0;
    const current = bands.get(rate) || 0;
    bands.set(rate, current + line.taxPaise);
    return bands;
  }, new Map());

  const addProduct = (product) => {
    if (!product) return;
    const available = branchStock(product, branch?.id);
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      const nextQty = (existing?.qty || 0) + 1;
      if (nextQty > available) {
        toast.push(`Only ${available} in stock at ${branch?.name}.`, 'danger');
        return current;
      }
      if (existing) return current.map((item) => item.productId === product.id ? { ...item, qty: nextQty } : item);
      return [...current, { productId: product.id, qty: 1, discount: 0 }];
    });
  };

  const focusBarcode = () => {
    barcodeRef.current?.focus();
  };

  useEffect(() => {
    focusBarcode();
  }, []);

  const lookup = (code) => {
    const value = String(code || '').trim();
    if (!value || scanLock.current) return;
    scanLock.current = true;
    window.setTimeout(() => { scanLock.current = false; }, 80);
    const product = products.find((item) => item.barcode === value || String(item.sku || '').toLowerCase() === value.toLowerCase());
    if (!product) {
      toast.push('No product in this business matches that code.', 'danger');
      barcodeRef.current?.select();
      return;
    }
    addProduct(product);
    setScan('');
    focusBarcode();
  };

  const onBarcodeKey = (event) => {
    if (event.key !== 'Enter' || event.repeat) return;
    event.preventDefault();
    lookup(event.currentTarget.value);
  };

  useEffect(() => {
    if (!payOpen) return undefined;
    let cancelled = false;
    QRCode.toDataURL(`innosify-demo://simulated-pay/${tenant?.slug || 'shop'}/${quote.totalPaise}`, { margin: 1, width: 180 }).then((url) => {
      if (!cancelled) setQr(url);
    });
    return () => { cancelled = true; };
  }, [payOpen, quote.totalPaise, tenant?.slug]);

  const visible = products.filter((product) => {
    const text = `${product.name} ${product.sku} ${product.barcode}`.toLowerCase();
    const matchesQuery = text.includes(query.trim().toLowerCase());
    const matchesCategory = category === 'All' || product.category === category;
    return matchesQuery && matchesCategory;
  });

  useEffect(() => {
    setActiveIndex(0);
  }, [query, category]);

  const onSearchKey = (event) => {
    if (!visible.length) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(visible.length - 1, index + 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(0, index - 1));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      addProduct(visible[activeIndex]);
    }
  };

  const setQty = (productId, qty) => {
    const product = products.find((item) => item.id === productId);
    const available = branchStock(product, branch?.id);
    if (qty > available) {
      toast.push(`Only ${available} in stock at ${branch?.name}.`, 'danger');
      return;
    }
    setCart((current) => current.flatMap((item) => {
      if (item.productId !== productId) return [item];
      if (qty < 1) return [];
      return [{ ...item, qty }];
    }));
  };

  const checkout = (payments) => {
    if (payingRef.current) return;
    payingRef.current = true;
    setPaying(true);
    const result = dispatch({
      type: 'sale.create',
      tenantId: tenant.id,
      branchId: branch.id,
      registerId: register?.id,
      cashierId: tenantSession?.userId,
      customerId: customerId || null,
      lines: cart.map((item) => ({ productId: item.productId, qty: item.qty, discountPaise: rupeesToPaise(item.discount || 0) })),
      billDiscountPaise: rupeesToPaise(billDiscount || 0),
      payments,
    });
    payingRef.current = false;
    setPaying(false);
    if (!result.ok) {
      toast.push(result.error, 'danger');
      return;
    }
    const sale = result.state.sales[0];
    setReceipt(sale);
    setCart([]);
    setBillDiscount(0);
    setCustomerId('');
    setPayOpen(false);
    setUpiState('idle');
    setTender('');
    toast.push(`Invoice ${sale.invoiceNo} saved. Payment is simulated.`);
  };

  const closeReceipt = () => {
    setReceipt(null);
    window.setTimeout(focusBarcode, 0);
  };

  const clearCart = () => {
    if (!cart.length) return;
    if (!window.confirm('Clear this bill? Completed sales stay on record.')) return;
    setCart([]);
    setBillDiscount(0);
    setCustomerId('');
    focusBarcode();
  };

  const tenderedPaise = rupeesToPaise(tender || 0);
  const changePreview = tenderedPaise > quote.totalPaise ? tenderedPaise - quote.totalPaise : 0;

  const pay = () => {
    if (payingRef.current) return;
    if (method === 'upi' && upiState !== 'success') {
      toast.push('Simulate a successful UPI payment before confirming.', 'danger');
      return;
    }
    if (method === 'cash') {
      const tendered = rupeesToPaise(tender || 0);
      if (tendered < quote.totalPaise) {
        toast.push('Cash received is less than the total.', 'danger');
        return;
      }
      checkout([{ method: 'cash', amountPaise: tendered, tenderedPaise: tendered }]);
      return;
    }
    if (method === 'split') {
      const card = rupeesToPaise(cardSplit || 0);
      const cash = quote.totalPaise - card;
      if (card <= 0 || cash <= 0) {
        toast.push('Enter a card amount that leaves a cash balance.', 'danger');
        return;
      }
      checkout([
        { method: 'card', amountPaise: card },
        { method: 'cash', amountPaise: cash },
      ]);
      return;
    }
    checkout([{ method, amountPaise: quote.totalPaise }]);
  };

  const currency = tenant?.currency;
  const canAddProduct = can('products.manage');

  return (
    <div className={`min-w-0 bg-canvas p-4 sm:p-5 ${cart.length ? 'pb-28 xl:pb-5' : ''}`}>
      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] xl:grid-cols-[minmax(0,1fr)_minmax(17rem,0.86fr)_minmax(17rem,0.74fr)]">
        <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm" aria-labelledby="pos-products">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 id="pos-products" className="text-base font-semibold text-content">Products</h2>
              <p className="text-xs text-content-muted">{branch?.name || 'Branch'} · stock shown for this branch</p>
            </div>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Input
              ref={barcodeRef}
              label="Barcode or SKU"
              placeholder="Scan or type, then Enter"
              value={scan}
              autoFocus
              onChange={(event) => setScan(event.target.value)}
              onKeyDown={onBarcodeKey}
            />
            <Input
              ref={searchRef}
              label="Search"
              placeholder="Name, SKU, or barcode"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKey}
              aria-activedescendant={visible[activeIndex] ? `pos-product-${visible[activeIndex].id}` : undefined}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Categories">
            {categories.map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={category === name}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${category === name ? 'bg-accent text-content-inverse' : 'border border-border bg-canvas text-content'}`}
                onClick={() => setCategory(name)}
              >
                {name}
              </button>
            ))}
          </div>
          {demoMode && products.length > 0 && (
            <div className="mt-3 rounded-xl border border-dashed border-border bg-canvas p-3">
              <p className="text-xs font-semibold text-content">Sample barcodes</p>
              <p className="mt-0.5 text-[11px] text-content-muted">Demo only. Fill a code, then press Enter. Nothing is added until you do.</p>
              <ul className="mt-2 space-y-1">
                {products.slice(0, 3).map((product) => (
                  <li key={product.id} className="flex items-center gap-2 text-xs">
                    <span className="min-w-0 flex-1 truncate">{product.name}</span>
                    <span className="font-mono text-[11px] text-content-muted">{product.barcode}</span>
                    <button type="button" className="font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => navigator.clipboard?.writeText(product.barcode).then(() => toast.push('Barcode copied')).catch(() => toast.push('Could not copy that barcode', 'danger'))}>Copy</button>
                    <button type="button" className="font-semibold text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => { setScan(product.barcode); focusBarcode(); }}>Fill</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-2 text-xs text-content-muted">A USB scanner that types a code and sends Enter will add the product when the barcode field is focused. Physical scanners were not tested.</p>

          {products.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-border px-4 py-10 text-center">
              <p className="font-semibold text-content">No products in this business yet</p>
              <p className="mt-1 text-sm text-content-muted">Billing uses the catalog of the business you have open.</p>
              {canAddProduct && <Link to="/retail/products/new" className="mt-4 inline-flex rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-content-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">Add product</Link>}
            </div>
          )}
          {products.length > 0 && visible.length === 0 && (
            <p className="mt-6 rounded-2xl bg-canvas px-4 py-8 text-center text-sm text-content-muted" role="status">No product matches that search in {category === 'All' ? 'this business' : category}.</p>
          )}
          <ul className="mt-3 max-h-[28rem] space-y-1.5 overflow-y-auto" aria-label="Product results">
            {visible.map((product, index) => {
              const stock = branchStock(product, branch?.id);
              const selected = index === activeIndex;
              const image = product.image || product.imageUrl;
              return (
                <li key={product.id}>
                  <button
                    id={`pos-product-${product.id}`}
                    type="button"
                    disabled={stock < 1}
                    aria-pressed={selected}
                    onClick={() => addProduct(product)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60 ${selected ? 'border-accent bg-accent-muted' : 'border-border bg-canvas hover:border-accent/30'}`}
                  >
                    {image && <img src={image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-content">{product.name}</span>
                      <span className="block truncate text-[11px] text-content-muted">{product.category || 'Uncategorised'} · {product.sku}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-sm font-semibold tabular-nums text-content">{money(rupeesToPaise(product.price), currency)}</span>
                      <span className={`text-[11px] font-semibold ${stock < 1 ? 'text-danger' : stock <= (product.lowStock || 0) ? 'text-warning' : 'text-success'}`}>
                        {stock < 1 ? 'Out of stock' : `${stock} in stock`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm" aria-labelledby="pos-cart">
          <h2 id="pos-cart" className="text-base font-semibold text-content">Cart</h2>
          <p className="text-xs text-content-muted">{branch?.name} · {tenantUser?.firstName} · {register?.name || 'No register'}</p>
          {quote.lines.length === 0 && (
            <p className="mt-6 rounded-2xl bg-canvas px-4 py-8 text-center text-sm text-content-muted" role="status">Search or scan a product to start the bill. Checkout stays closed until the cart has an item.</p>
          )}
          <ul className="mt-3 max-h-[24rem] space-y-2 overflow-y-auto" aria-live="polite">
            {quote.lines.map((line) => {
              const item = cart.find((entry) => entry.productId === line.productId);
              const product = products.find((entry) => entry.id === line.productId);
              return (
                <li key={line.productId} className="rounded-xl border border-border bg-canvas p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-content">{line.name}</p>
                      <p className="truncate text-[11px] text-content-muted">{product?.sku} · {product?.barcode}</p>
                      <p className="text-xs text-content-muted">{money(line.unitPricePaise, currency)} · GST {line.taxRate}%{line.lineDiscountPaise ? ` · discount ${money(line.lineDiscountPaise, currency)}` : ''}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-content">{money(line.totalPaise, currency)}</p>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button type="button" aria-label={`Decrease ${line.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => setQty(line.productId, (item?.qty || 1) - 1)}>−</button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{item?.qty || 0}</span>
                      <button type="button" aria-label={`Increase ${line.name}`} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => addProduct(product)}>+</button>
                    </div>
                    <button type="button" className="text-xs font-semibold text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30" onClick={() => setQty(line.productId, 0)}>Remove</button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm lg:col-span-1 xl:col-span-1" aria-labelledby="pos-summary">
          <h2 id="pos-summary" className="text-base font-semibold text-content">Checkout</h2>
          <p className="text-xs text-content-muted">Payment on this screen is simulated.</p>
          <label className="mt-4 block text-xs font-medium text-content" htmlFor="bill-discount">Bill discount (₹)
            <input id="bill-discount" className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" type="number" min="0" value={billDiscount} onChange={(event) => setBillDiscount(event.target.value)} />
          </label>
          <label className="mt-3 block text-xs font-medium text-content" htmlFor="pos-customer">Customer
            <select id="pos-customer" className="mt-1 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
              <option value="">Walk-in customer</option>
              {customers.filter((customer) => !customer.walkIn).map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
            </select>
          </label>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-content-muted">Subtotal</dt><dd className="tabular-nums">{money(quote.subtotalPaise, currency)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-content-muted">Discount</dt><dd className="tabular-nums">{money(quote.discountPaise, currency)}</dd></div>
            {[...taxBands.entries()].map(([rate, amount]) => (
              <div key={rate} className="flex justify-between gap-3"><dt className="text-content-muted">GST {rate}%</dt><dd className="tabular-nums">{money(amount, currency)}</dd></div>
            ))}
            <div className="flex justify-between gap-3 border-t border-border pt-3">
              <dt className="text-base font-semibold">Total</dt>
              <dd className="text-2xl font-semibold tabular-nums tracking-tight">{money(quote.totalPaise, currency)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] leading-relaxed text-content-muted">GST uses the rate stored on each product. This demo does not split CGST, SGST, and IGST.</p>
          <div className="mt-4 grid gap-2">
            <Button className="w-full" size="lg" onClick={() => setPayOpen(true)} disabled={!cart.length || paying}>Take payment</Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { dispatch({ type: 'sale.hold', bill: { id: `hold-${Date.now()}`, tenantId: tenant.id, cart, billDiscount, customerId } }); setCart([]); toast.push('Bill held in this browser.'); }} disabled={!cart.length}>Hold</Button>
              <Button variant="ghost" onClick={clearCart} disabled={!cart.length}>Clear</Button>
            </div>
          </div>
          {held.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-canvas p-3 text-xs">
              <p className="font-semibold text-content">Held bills · this business</p>
              {held.map((bill) => (
                <button key={bill.id} type="button" className="mt-2 block rounded-lg px-1 py-1 font-medium text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40" onClick={() => { setCart(bill.cart); setBillDiscount(bill.billDiscount); setCustomerId(bill.customerId || ''); dispatch({ type: 'sale.hold.delete', id: bill.id }); focusBarcode(); }}>Resume {bill.cart.length} items</button>
              ))}
            </div>
          )}
        </aside>
      </div>

      {cart.length > 0 && (
        <div className="fixed inset-x-3 bottom-3 z-20 flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 shadow-sm xl:hidden">
          <div>
            <p className="text-xs text-content-muted">Total</p>
            <p className="text-lg font-semibold tabular-nums">{money(quote.totalPaise, currency)}</p>
          </div>
          <Button onClick={() => setPayOpen(true)} disabled={paying}>Take payment</Button>
        </div>
      )}

      {payOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="pay-title">
          <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h3 id="pay-title" className="text-lg font-semibold">Simulated payment</h3>
            <p className="mt-1 text-sm text-content-muted">Amount {money(quote.totalPaise, currency)}. This does not contact a bank or UPI app.</p>
            <div className="mt-4 grid grid-cols-4 gap-2" role="group" aria-label="Payment method">
              {payMethods.map(([item, label]) => (
                <button key={item} type="button" aria-pressed={method === item} className={`rounded-xl px-2 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${method === item ? 'bg-accent text-content-inverse' : 'bg-canvas text-content'}`} onClick={() => setMethod(item)}>{label}</button>
              ))}
            </div>
            {method === 'cash' && (
              <div className="mt-3">
                <Input label="Cash received (₹)" type="number" value={tender} onChange={(event) => setTender(event.target.value)} />
                <p className="mt-2 text-sm text-content" role="status">Change due {money(changePreview, currency)}</p>
              </div>
            )}
            {method === 'split' && <Input className="mt-3" label="Card portion (₹)" type="number" value={cardSplit} onChange={(event) => setCardSplit(event.target.value)} />}
            {method === 'upi' && (
              <div className="mt-3 text-center">
                {qr && <img src={qr} alt="Simulated payment code, not a merchant UPI QR" className="mx-auto" />}
                <p className="text-xs text-content-muted">Demo QR only. It is not a payable UPI link.</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  <Button size="sm" onClick={() => setUpiState('success')}>Simulate success</Button>
                  <Button size="sm" variant="outline" onClick={() => setUpiState('failed')}>Simulate failure</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setUpiState('cancelled'); setPayOpen(false); }}>Cancel</Button>
                </div>
                {upiState !== 'idle' && <p className="mt-2 text-sm" role="status">Status: {upiState}</p>}
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPayOpen(false)} disabled={paying}>Close</Button>
              <Button onClick={pay} disabled={paying || !cart.length}>{paying ? 'Saving…' : 'Confirm simulated payment'}</Button>
            </div>
          </div>
        </div>
      )}

      {receipt && (
        <div className="pos-receipt-shell fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm print:static print:bg-white sm:items-center" role="dialog" aria-modal="true" aria-labelledby="receipt-title">
          <div className="pos-receipt w-full max-w-sm rounded-3xl border border-border bg-surface p-6 shadow-sm print:shadow-none">
            {tenant?.logoDataUrl ? <img src={tenant.logoDataUrl} alt="" className="mb-2 h-12 w-12 object-contain" /> : null}
            <h3 id="receipt-title" className="text-lg font-semibold">{tenant?.invoiceName || tenant?.name}</h3>
            <p className="text-xs text-content-muted">{branch?.name}</p>
            <p className="text-xs text-content-muted">{[tenant?.address, tenant?.city].filter(Boolean).join(', ')}</p>
            <p className="text-xs text-content-muted">GSTIN {tenant?.gstin || '—'}</p>
            <p className="mt-2 text-sm font-medium">{receipt.invoiceNo}</p>
            <p className="text-xs text-content-muted">{new Date(receipt.createdAt).toLocaleString('en-IN')}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {receipt.lines.map((line) => (
                <li key={line.productId}>
                  <div className="flex justify-between gap-3">
                    <span>{line.name} × {line.qty}</span>
                    <span className="tabular-nums">{money(line.totalPaise, currency)}</span>
                  </div>
                  <p className="text-[11px] text-content-muted">{money(line.unitPricePaise, currency)} each{line.taxPaise ? ` · GST ${money(line.taxPaise, currency)}` : ''}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-dashed border-border pt-2 text-sm">
              <div className="flex justify-between"><dt className="text-content-muted">Discount</dt><dd className="tabular-nums">{money(receipt.discountPaise, currency)}</dd></div>
              <div className="flex justify-between"><dt className="text-content-muted">Tax</dt><dd className="tabular-nums">{money(receipt.taxPaise, currency)}</dd></div>
              <div className="flex justify-between text-base font-semibold"><dt>Total</dt><dd className="tabular-nums">{money(receipt.totalPaise, currency)}</dd></div>
            </dl>
            <p className="mt-2 text-xs">{receipt.payments.map((payment) => payment.method).join(' + ')} · change {money(receipt.changePaise, currency)}</p>
            <p className="mt-2 text-xs text-content-muted">{tenant?.receiptFooter}</p>
            <p className="text-xs text-content-muted">Simulated payment — not verified by a gateway.</p>
            <div className="mt-3 flex gap-2 print:hidden">
              <Button onClick={() => window.print()}>Print</Button>
              <Button variant="outline" onClick={closeReceipt}>Done</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
