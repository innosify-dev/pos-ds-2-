import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { Select } from '@shared/ui/Select';
import { useProducts } from '@modules/retail/store/ProductsContext.jsx';
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
 * Add / Edit product form screen — full product configuration with
 * gallery, features, variants, labels, pricing, tax, and inventory.
 */
export function ProductFormScreen() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useProducts();
  const isEdit = Boolean(productId);
  const existing = isEdit ? products.find((p) => p.id === productId) : null;

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );

  const [info, setInfo] = useState(() =>
    existing
      ? { ...defaultInfo, name: existing.name, sku: existing.sku, category: existing.category, brand: existing.brand }
      : defaultInfo
  );
  const [mainImage, setMainImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [featuresEnabled, setFeaturesEnabled] = useState(false);
  const [features, setFeatures] = useState([
    { id: 'f1', key: 'Saree Length', value: '6.3 Meter' },
    { id: 'f2', key: 'Blouse Length', value: '0.8 Meter' },
    { id: 'f3', key: 'Wash Care', value: 'Dry Clean Only' },
    { id: 'f4', key: 'Occasion', value: 'Wedding / Festive' },
  ]);
  const [hasVariants, setHasVariants] = useState(true);
  const [variants, setVariants] = useState(defaultVariants);
  const [combos, setCombos] = useState([]);
  const [removedKeys, setRemovedKeys] = useState([]);
  const [comboIndex, setComboIndex] = useState(0);
  const [applyAll, setApplyAll] = useState({ price: '', selling: '', mrp: '', returnable: '', discount: '' });
  const [pricing, setPricing] = useState({ price: '', selling: '', mrp: '' });
  const [tax, setTax] = useState({ category: 'GST 5%', rate: '5', base: '' });
  const [other, setOther] = useState(() => ({
    status: existing?.status ?? 'Active',
    openingStock: existing != null ? String(existing.stock) : '25',
    warehouse: 'Main Store',
    supplierRef: '',
    notes: '',
    trackInventory: true,
    lowThreshold: '5',
    remarks: '',
  }));
  const [error, setError] = useState('');

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

  if (isEdit && !existing) {
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
    if (!info.name.trim()) return 'Product Name is required.';
    if (isDraft) return '';
    if (!info.category) return 'Product Category is required.';
    if (!info.sku.trim()) return 'SKU is required.';
    if (!info.hsn.trim()) return 'HSN is required.';
    if (!info.unit) return 'Unit is required.';
    const taken = products.some((p) => p.sku === info.sku.trim() && p.id !== existing?.id);
    if (taken) return 'This SKU is already in use.';
    return '';
  };

  const persist = (isDraft) => {
    const message = validate(isDraft);
    if (message) {
      setError(message);
      return;
    }
    const sellingOf = (v) => (v === '' || Number.isNaN(Number(v)) ? 0 : Number(v));
    const values = {
      name: info.name.trim(),
      sku: info.sku.trim(),
      category: info.category || 'Uncategorized',
      brand: info.brand.trim() || 'Brand',
      price: hasVariants && combos.length > 0 ? sellingOf(combos[0].selling) : sellingOf(pricing.selling),
      stock: Number(other.openingStock) || 0,
      status: isDraft ? 'Draft' : other.status,
      returnable: true,
      details: {
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
    if (isEdit) updateProduct(existing.id, values);
    else addProduct(values);
    navigate('/retail/products');
  };

  const actions = (
    <>
      <Button variant="outline" onClick={() => persist(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M8 4v5h7V4" />
        </svg>
        Save as Draft
      </Button>
      <Button variant="outline" onClick={() => navigate('/retail/products')}>
        Cancel
      </Button>
      <Button onClick={() => persist(false)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
          <path d="M5 4h11l3 3v13H5z" />
          <path d="M8 4v5h7V4M8 20v-6h8v6" />
        </svg>
        Save Product
      </Button>
    </>
  );

  return (
    <div className="space-y-4 bg-surface-elevated/50 p-5 pb-24">
      <nav aria-label="Breadcrumb" className="text-xs text-content-muted">
        <Link to="/retail/products" className="hover:text-accent">Products</Link>
        <span className="mx-1.5">/</span>
        <span>{isEdit ? 'Edit Product' : 'Add Product'}</span>
      </nav>

      <div className="flex flex-wrap items-start gap-3">
        <div>
          <h2 className="text-lg font-bold text-content">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <p className="mt-0.5 text-xs text-content-muted">Create and configure a new product</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">{actions}</div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-content">1. Product Information</h3>
          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <Input label="Product Name *" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="Kanjivaram Silk Saree" />
            </div>
            <div />
            <Select label="Product Category *" value={info.category} onChange={(e) => setInfo({ ...info, category: e.target.value })}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Input label="SKU *" value={info.sku} onChange={(e) => setInfo({ ...info, sku: e.target.value })} placeholder="NALLI-KAN-2024" />
            <Input label="Product Brand *" value={info.brand} onChange={(e) => setInfo({ ...info, brand: e.target.value })} placeholder="Nalli" />
            <Select label="Unit *" value={info.unit} onChange={(e) => setInfo({ ...info, unit: e.target.value })}>
              <option value="">Select unit</option>
              {units.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </Select>
            <Input label="Model" value={info.model} onChange={(e) => setInfo({ ...info, model: e.target.value })} placeholder="Kan-Silk-2024" />
            <Input label="Collection" value={info.collection} onChange={(e) => setInfo({ ...info, collection: e.target.value })} placeholder="Wedding Collection 2024" />
            <Input label="Product Manufacturer" value={info.manufacturer} onChange={(e) => setInfo({ ...info, manufacturer: e.target.value })} placeholder="Nalli Silks Pvt. Ltd." />
            <Select label="Saree Type" value={info.sareeType} onChange={(e) => setInfo({ ...info, sareeType: e.target.value })}>
              <option value="">Select type</option>
              {sareeTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Input label="Vendor" value={info.vendor} onChange={(e) => setInfo({ ...info, vendor: e.target.value })} placeholder="Nalli Silks Store" />
            <Select label="Fabric" value={info.fabric} onChange={(e) => setInfo({ ...info, fabric: e.target.value })}>
              <option value="">Select fabric</option>
              {fabrics.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </Select>
            <Input label="HSN *" value={info.hsn} onChange={(e) => setInfo({ ...info, hsn: e.target.value })} placeholder="540752" />
            <div>
              <span className="mb-1.5 block text-sm font-medium text-content">Description</span>
              <textarea
                value={info.description}
                onChange={(e) => setInfo({ ...info, description: e.target.value })}
                rows={3}
                placeholder="Traditional Kanjivaram silk saree with zari border and rich pallu."
                className="w-full rounded border border-border bg-surface px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
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
        warehouses={['Main Store']}
      />

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="fixed bottom-0 left-52 right-0 z-10 flex items-center justify-between gap-2.5 border-t border-border bg-surface px-5 py-3">
        <Button variant="outline" onClick={() => navigate('/retail/products')}>
          Cancel
        </Button>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={() => persist(true)}>
            Save as Draft
          </Button>
          <Button onClick={() => persist(false)}>
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
}
