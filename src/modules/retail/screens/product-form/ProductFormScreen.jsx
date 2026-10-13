import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { useProducts } from '@modules/retail/store/ProductsContext.jsx';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useAuth } from '@core/auth/AuthProvider.jsx';
import { useDemo } from '@services/demo';
import {
  AdditionalFeatures,
  ImagesGallery,
  LabelPreview,
  OtherInfo,
  PricingTax,
  VariantsSection,
} from '@modules/retail/components/product-form';

const units = ['Nos (Pieces)', 'Meters', 'Kg', 'Set'];
const sareeTypes = ['Kanjivaram', 'Banarasi Silk', 'Soft Silk', 'Cotton', 'Chanderi', 'Mysore Silk', 'Organza', 'Linen'];
const fabrics = ['Pure Silk', 'Cotton', 'Organza', 'Linen', 'Chanderi', 'Art Silk'];

const defaultInfo = {
  name: '',
  category: '',
  brand: '',
  model: '',
  manufacturer: '',
  vendor: '',
  hsn: '',
  sku: '',
  unit: '',
  collection: '',
  sareeType: '',
  fabric: '',
  description: '',
};

const defaultVariants = [
  { id: 'v-color', name: 'Color', values: ['Red', 'Green', 'Purple', 'Blue'] },
  { id: 'v-border', name: 'Border', values: ['Gold Zari', 'Silver Zari'] },
];

const defaultFeatures = [
  { id: 'f1', key: 'Saree Length', value: '6.3 Meter' },
  { id: 'f2', key: 'Blouse Length', value: '0.8 Meter' },
  { id: 'f3', key: 'Wash Care', value: 'Dry Clean Only' },
  { id: 'f4', key: 'Occasion', value: 'Wedding / Festive' },
];

function seedFrom(product) {
  if (!product) {
    return {
      info: defaultInfo,
      featuresEnabled: false,
      features: defaultFeatures,
      hasVariants: true,
      variants: defaultVariants,
      combos: [],
      pricing: { price: '', selling: '', mrp: '' },
      tax: { category: 'GST 5%', rate: '5', base: '' },
      other: {
        status: 'Active',
        openingStock: '25',
        warehouse: 'Main Store',
        supplierRef: '',
        notes: '',
        trackInventory: true,
        lowThreshold: '5',
        remarks: '',
      },
    };
  }
  const details = product.details || {};
  const attributes = product.attributes || {};
  const variantDefs = Array.isArray(details.variants) ? details.variants : [];
  return {
    info: {
      ...defaultInfo,
      name: product.name || '',
      sku: product.sku || '',
      category: product.category || '',
      brand: product.brand || '',
      model: details.model || '',
      manufacturer: details.manufacturer || '',
      vendor: details.vendor || '',
      hsn: details.hsn || product.hsn || '',
      unit: details.unit || product.unit || '',
      collection: details.collection || attributes.packSize || '',
      sareeType: details.sareeType || '',
      fabric: details.fabric || attributes.fabric || '',
      description: details.description || '',
    },
    featuresEnabled: Array.isArray(details.features) && details.features.length > 0,
    features: details.features?.length ? details.features : [],
    hasVariants: variantDefs.length > 0,
    variants: variantDefs.length ? variantDefs : [],
    combos: Array.isArray(details.combos) ? details.combos : [],
    pricing: {
      price: product.costPrice != null ? String(product.costPrice) : '',
      selling: product.price != null ? String(product.price) : '',
      mrp: details.mrp != null ? String(details.mrp) : '',
    },
    tax: {
      category: details.tax?.category || `GST ${product.taxRate ?? 5}%`,
      rate: String(details.tax?.rate ?? product.taxRate ?? 5),
      base: details.tax?.base != null ? String(details.tax.base) : '',
    },
    other: {
      status: product.status || 'Active',
      openingStock: product.stock != null ? String(product.stock) : '0',
      warehouse: details.other?.warehouse || 'Main Store',
      supplierRef: details.other?.supplierRef || '',
      notes: details.other?.notes || '',
      trackInventory: details.other?.trackInventory ?? true,
      lowThreshold: String(product.lowStock ?? details.other?.lowThreshold ?? 5),
      remarks: details.other?.remarks || '',
    },
  };
}

function comboSku(baseSku, values) {
  const base = (baseSku || 'SKU').toUpperCase().replace(/\s+/g, '');
  const suffix = values.map((v) => (v.trim()[0] ?? 'X').toUpperCase()).join('-');
  return `${base}-${suffix}`;
}

function cartesian(defs) {
  let acc = [[]];
  for (const d of defs) {
    acc = acc.flatMap((prev) => d.values.map((v) => [...prev, v]));
  }
  return acc.filter((combo) => combo.length > 0);
}

/**
 * Add / Edit product form screen. Full product configuration with
 * gallery, features, variants, labels, pricing, tax, and inventory.
 */
export function ProductFormScreen() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useProducts();
  const { tenant, branch } = useTenant();
  const { can } = useAuth();
  const canManage = can('products.manage');
  const { state } = useDemo();
  const savingRef = useRef(false);
  const businessType = tenant?.type || 'retail';
  const isEdit = Boolean(productId);
  const existing = isEdit ? products.find((p) => p.id === productId) : null;

  const categories = useMemo(
    () => [...new Set([
      ...products.map((p) => p.category),
      ...state.categories.filter((item) => item.tenantId === tenant?.id).map((item) => item.name),
    ].filter(Boolean))].sort(),
    [products, state.categories, tenant?.id],
  );

  const initial = seedFrom(existing);
  const [info, setInfo] = useState(initial.info);
  const [mainImage, setMainImage] = useState(existing?.image || existing?.details?.image || null);
  const [gallery, setGallery] = useState(Array.isArray(existing?.details?.gallery) ? existing.details.gallery : []);
  const [featuresEnabled, setFeaturesEnabled] = useState(initial.featuresEnabled);
  const [features, setFeatures] = useState(initial.features);
  const [hasVariants, setHasVariants] = useState(initial.hasVariants);
  const [variants, setVariants] = useState(initial.variants);
  const [combos, setCombos] = useState(initial.combos);
  const [removedKeys, setRemovedKeys] = useState([]);
  const [comboIndex, setComboIndex] = useState(0);
  const [applyAll, setApplyAll] = useState({ price: '', selling: '', mrp: '', returnable: '', discount: '' });
  const [pricing, setPricing] = useState(initial.pricing);
  const [tax, setTax] = useState(initial.tax);
  const [other, setOther] = useState(initial.other);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const next = seedFrom(isEdit ? products.find((item) => item.id === productId) : null);
    setInfo(next.info);
    setFeaturesEnabled(next.featuresEnabled);
    setFeatures(next.features);
    setHasVariants(next.hasVariants);
    setVariants(next.variants);
    setCombos(next.combos);
    setPricing(next.pricing);
    setTax(next.tax);
    setOther(next.other);
    setError('');
    setFieldErrors({});
    setRemovedKeys([]);
    savingRef.current = false;
    setSaving(false);
    // Reload when the route changes. Product edits stay local until save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!hasVariants) {
      setCombos([]);
      return;
    }
    const defs = variants.filter((v) => v.name.trim() && v.values.length > 0);
    if (defs.length === 0) {
      setCombos([]);
      return;
    }
    setCombos((prev) => {
      const prevByKey = new Map(prev.map((c) => [c.key, c]));
      return cartesian(defs)
        .map((values) => {
          const key = values.join('|');
          const name = values.join(' - ');
          const sku = comboSku(info.sku, values);
          const kept = prevByKey.get(key);
          if (kept) return { ...kept, values, name, sku };
          return { key, values, name, sku, price: '', selling: '', mrp: '', returnable: true, discount: '' };
        })
        .filter((c) => !removedKeys.includes(c.key));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVariants, variants, info.sku]);

  if (!canManage || (isEdit && !existing)) {
    return <Navigate to="/retail/products" replace />;
  }

  const toObjectUrls = (files, limit) =>
    files.slice(0, limit).map((f) => URL.createObjectURL(f));

  const updateCombo = (key, field, value) =>
    setCombos((list) => list.map((c) => (c.key === key ? { ...c, [field]: value } : c)));

  const removeCombo = (key) => {
    setRemovedKeys((keys) => [...keys, key]);
    setCombos((list) => list.filter((c) => c.key !== key));
  };

  const handleApplyAll = () => {
    setCombos((list) =>
      list.map((c) => ({
        ...c,
        price: applyAll.price !== '' ? applyAll.price : c.price,
        selling: applyAll.selling !== '' ? applyAll.selling : c.selling,
        mrp: applyAll.mrp !== '' ? applyAll.mrp : c.mrp,
        returnable: applyAll.returnable === '' ? c.returnable : applyAll.returnable === 'yes',
        discount: applyAll.discount !== '' ? applyAll.discount : c.discount,
      }))
    );
  };

  const handleTaxChange = (field, value) => {
    setTax((t) => {
      if (field === 'category') {
        const match = /^GST (\d+)%$/.exec(value);
        return { ...t, category: value, rate: match ? match[1] : t.rate };
      }
      return { ...t, [field]: value };
    });
  };

  const validate = (isDraft) => {
    const fields = {};
    if (!info.name.trim()) fields.name = 'Product name is required.';
    if (!isDraft) {
      if (!info.category) fields.category = 'Product category is required.';
      if (!info.sku.trim()) fields.sku = 'SKU is required.';
      if (!info.hsn.trim()) fields.hsn = 'HSN is required.';
      if (!info.unit) fields.unit = 'Unit is required.';
      const taken = products.some((p) => p.sku.toLowerCase() === info.sku.trim().toLowerCase() && p.id !== existing?.id);
      if (info.sku.trim() && taken) fields.sku = 'This SKU is already in use.';
    }
    return { message: Object.values(fields)[0] || '', fields };
  };

  const persist = (isDraft) => {
    if (savingRef.current) return;
    const { message, fields } = validate(isDraft);
    setFieldErrors(fields);
    if (message) {
      setError(message);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    const sellingOf = (v) => (v === '' || Number.isNaN(Number(v)) ? 0 : Number(v));
    const values = {
      name: info.name.trim(),
      sku: info.sku.trim(),
      category: info.category || 'Uncategorized',
      brand: info.brand.trim() || 'Brand',
      price: hasVariants && combos.length > 0 ? sellingOf(combos[0].selling) : sellingOf(pricing.selling),
      stock: Number(other.openingStock) || 0,
      lowStock: Number(other.lowThreshold) || 0,
      ...(hasVariants ? {} : { costPrice: sellingOf(pricing.price) }),
      status: isDraft ? 'Draft' : other.status,
      returnable: existing?.returnable ?? true,
      details: {
        ...(existing?.details || {}),
        model: info.model,
        manufacturer: info.manufacturer,
        vendor: info.vendor,
        hsn: info.hsn,
        unit: info.unit,
        collection: info.collection,
        sareeType: info.sareeType,
        fabric: info.fabric,
        description: info.description,
        features: featuresEnabled ? features.filter((f) => f.key.trim()) : [],
        variants: hasVariants ? variants : [],
        combos: hasVariants ? combos : [],
        tax,
        other,
      },
    };
    const stockByBranch = {
      ...(existing?.stockByBranch || {}),
      [branch?.id || 'unassigned']: Number(other.openingStock) || 0,
    };
    const result = isEdit
      ? updateProduct(existing.id, { ...values, stockByBranch })
      : addProduct({ ...values, stockByBranch: { [branch?.id || 'unassigned']: Number(other.openingStock) || 0 } });
    if (result && result.ok === false) {
      savingRef.current = false;
      setSaving(false);
      setError(result.error);
      return;
    }
    navigate('/retail/products');
  };

  const actions = (
    <>
      <Button variant="outline" onClick={() => persist(true)} disabled={saving}>Save as draft</Button>
      <Button variant="outline" onClick={() => navigate('/retail/products')} disabled={saving}>Cancel</Button>
      <Button onClick={() => persist(false)} disabled={saving}>{saving ? 'Saving...' : 'Save product'}</Button>
    </>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 p-4 pb-28 sm:p-6">
      <nav aria-label="Breadcrumb" className="text-xs text-content-muted">
        <Link to="/retail/products" className="hover:text-accent">Products</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-content">{isEdit ? 'Edit product' : 'Add product'}</span>
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Catalog</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-content">{isEdit ? 'Edit product' : 'Add product'}</h2>
          <p className="mt-1 text-sm text-content-muted">
            {isEdit ? 'Changes stay in this business. Ownership is not edited here.' : 'Add a product to the current business.'}
          </p>
        </div>
        <div className="hidden flex-wrap items-center gap-2 sm:flex">{actions}</div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-danger/30 bg-danger-muted px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <section className="premium-card p-5">
          <h3 className="mb-1 text-sm font-semibold text-content">Basic information</h3>
          <p className="mb-4 text-xs text-content-muted">Required fields are marked.</p>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <Input label="Product name *" value={info.name} error={fieldErrors.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="Product name" />
            {existing?.barcode ? (
              <Input label="Barcode" value={existing.barcode} readOnly />
            ) : <div className="hidden sm:block" />}
            <Select label="Category *" value={info.category} error={fieldErrors.category} onChange={(e) => setInfo({ ...info, category: e.target.value })}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Input label="SKU *" value={info.sku} error={fieldErrors.sku} onChange={(e) => setInfo({ ...info, sku: e.target.value })} placeholder="SKU" />
            <Input label="Brand" value={info.brand} onChange={(e) => setInfo({ ...info, brand: e.target.value })} placeholder="Brand" />
            <Select label="Unit *" value={info.unit} error={fieldErrors.unit} onChange={(e) => setInfo({ ...info, unit: e.target.value })}>
              <option value="">Select unit</option>
              {(businessType === 'tiles' ? ['Box', 'Piece', 'Square feet'] : businessType === 'supermarket' ? ['Pack', 'Kg', 'Litre', 'Piece'] : units).map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
            <Input label="Model" value={info.model} onChange={(e) => setInfo({ ...info, model: e.target.value })} />
            <Input label="Collection" value={info.collection} onChange={(e) => setInfo({ ...info, collection: e.target.value })} />
            <Input label="Manufacturer" value={info.manufacturer} onChange={(e) => setInfo({ ...info, manufacturer: e.target.value })} />
            {businessType === 'clothing' && (
              <Select label="Saree type" value={info.sareeType} onChange={(e) => setInfo({ ...info, sareeType: e.target.value })}>
                <option value="">Select type</option>
                {sareeTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Select>
            )}
            <Input label="Vendor" value={info.vendor} onChange={(e) => setInfo({ ...info, vendor: e.target.value })} />
            {businessType === 'clothing' && (
              <Select label="Fabric" value={info.fabric} onChange={(e) => setInfo({ ...info, fabric: e.target.value })}>
                <option value="">Select fabric</option>
                {fabrics.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Select>
            )}
            {businessType === 'supermarket' && <Input label="Pack size" value={info.collection} onChange={(e) => setInfo({ ...info, collection: e.target.value })} />}
            {businessType === 'tiles' && <Input label="Pieces per box" value={info.model} onChange={(e) => setInfo({ ...info, model: e.target.value })} />}
            <Input label="HSN *" value={info.hsn} error={fieldErrors.hsn} onChange={(e) => setInfo({ ...info, hsn: e.target.value })} />
            <div className="sm:col-span-2">
              <label htmlFor="product-description" className="mb-1.5 block text-sm font-medium text-content">Description</label>
              <textarea
                id="product-description"
                value={info.description}
                onChange={(e) => setInfo({ ...info, description: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-content placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
          </div>
        </section>

        <ImagesGallery
          productName={info.name}
          main={mainImage}
          gallery={gallery}
          onMain={(file) => setMainImage(URL.createObjectURL(file))}
          onAdd={(files) => setGallery((g) => [...g, ...toObjectUrls(files, 10 - g.length)])}
          onRemove={(i) => setGallery((g) => g.filter((_, gi) => gi !== i))}
        />
      </div>

      <AdditionalFeatures
        enabled={featuresEnabled}
        onToggleEnabled={setFeaturesEnabled}
        features={features}
        onChange={(id, field, value) => setFeatures((list) => list.map((f) => (f.id === id ? { ...f, [field]: value } : f)))}
        onAdd={() => setFeatures((list) => [...list, { id: `f${Date.now()}`, key: '', value: '' }])}
        onRemove={(id) => setFeatures((list) => list.filter((f) => f.id !== id))}
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <VariantsSection
            enabled={hasVariants}
            onToggleEnabled={setHasVariants}
            variants={variants}
            onVariantName={(id, name) => setVariants((list) => list.map((v) => (v.id === id ? { ...v, name } : v)))}
            onVariantAddValue={(id, val) => setVariants((list) => list.map((v) => (v.id === id ? { ...v, values: [...v.values, val] } : v)))}
            onVariantRemoveValue={(id, val) => setVariants((list) => list.map((v) => (v.id === id ? { ...v, values: v.values.filter((x) => x !== val) } : v)))}
            onAddVariant={() => setVariants((list) => [...list, { id: `v${Date.now()}`, name: '', values: [] }])}
            onRemoveVariant={(id) => setVariants((list) => list.filter((v) => v.id !== id))}
            combos={combos}
            onComboChange={updateCombo}
            onRemoveCombo={removeCombo}
            applyAll={applyAll}
            onApplyAllChange={(field, value) => setApplyAll((a) => ({ ...a, [field]: value }))}
            onApplyAll={handleApplyAll}
          />
        </div>
        <LabelPreview combos={combos} index={comboIndex} onIndex={setComboIndex} productName={info.name} />
      </div>

      <PricingTax
        hasVariants={hasVariants}
        pricing={pricing}
        onPricingChange={(field, value) => setPricing((p) => ({ ...p, [field]: value }))}
        tax={tax}
        onTaxChange={handleTaxChange}
      />

      <OtherInfo
        other={other}
        onChange={(key, value) => setOther((o) => ({ ...o, [key]: value }))}
        warehouses={[...new Set([other.warehouse, branch?.name || 'Main Store'].filter(Boolean))]}
      />

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-canvas/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button variant="outline" onClick={() => navigate('/retail/products')} disabled={saving}>Cancel</Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => persist(true)} disabled={saving}>Save as draft</Button>
          <Button onClick={() => persist(false)} disabled={saving}>{saving ? 'Saving...' : 'Save product'}</Button>
        </div>
      </div>
    </div>
  );
}
