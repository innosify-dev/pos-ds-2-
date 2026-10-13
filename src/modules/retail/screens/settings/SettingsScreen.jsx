import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { PanelCard } from '@shared/display/PanelCard';
import { useTheme } from '@core/theme';
import { accentOptions, notificationToggles, settingsSections, shapeOptions, sidebarOptions } from '@modules/retail/data';
import { demoMode, useDemo } from '@services/demo';
import { useTenant } from '@core/tenant/TenantProvider.jsx';
import { useToast } from '@shared/feedback/Toast.jsx';
import { cn } from '@utils/cn';

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
        checked ? 'bg-accent' : 'bg-border-strong'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-ivory shadow transition-transform duration-300 ease-out',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

const accentKey = (id) => `innosify.pref.${id || 'default'}.accent`;
const shapeKey = (id) => `innosify.pref.${id || 'default'}.shape`;
const sidebarKey = (id) => `innosify.pref.${id || 'default'}.sidebar`;

const SIDEBAR_COLORS = {
  ink: '#111827',
  plum: '#42134F',
  graphite: '#27272A',
};

function applyAccentToRoot(option) {
  const root = document.documentElement;
  root.style.setProperty('--rgb-accent', option.rgb);
  root.style.setProperty('--rgb-brand', option.rgb);
  root.style.setProperty('--rgb-accent-muted', option.muted);
  root.style.setProperty('--color-accent', option.hex);
  root.style.setProperty('--color-accent-hover', option.hex);
}

function applyShapeToRoot(option) {
  const root = document.documentElement;
  root.style.setProperty('--radius-default', option.radius);
  root.style.setProperty('--radius-lg', option.radiusLg);
}

function applySidebarToRoot(option) {
  const color = SIDEBAR_COLORS[option?.id ?? option] ?? SIDEBAR_COLORS.ink;
  document.documentElement.style.setProperty('--color-sidebar', color);
}

/**
 * Settings screen — profile, notifications and appearance.
 * Accent colour and theme mode apply instantly to the whole app.
 */
export function SettingsScreen() {
  const { tenant, branch } = useTenant();
  const { state, dispatch, reset } = useDemo();
  const toast = useToast();
  const [section, setSection] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [accent, setAccent] = useState('plum');
  const [shape, setShape] = useState('round');
  const [sidebar, setSidebar] = useState('ink');
  const [toggles, setToggles] = useState(() =>
    Object.fromEntries(notificationToggles.map((toggle) => [toggle.id, toggle.enabled]))
  );
  const [hoursError, setHoursError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!tenant) return;
    setProfile({
      name: tenant.name,
      legalName: tenant.legalName,
      email: tenant.email,
      phone: tenant.phone,
      gstin: tenant.gstin,
      address: tenant.address,
      city: tenant.city,
      invoiceName: tenant.invoiceName,
      receiptFooter: tenant.receiptFooter,
      currency: tenant.currency || 'INR',
      openingTime: tenant.openingTime || '10:00',
      closingTime: tenant.closingTime || '21:00',
      logoDataUrl: tenant.logoDataUrl || '',
    });
    if (tenant.notifications) setToggles((current) => ({ ...current, ...tenant.notifications }));
    const storedAccent = accentOptions.find((option) => option.id === localStorage.getItem(accentKey(tenant.id)));
    if (storedAccent) {
      setAccent(storedAccent.id);
      applyAccentToRoot(storedAccent);
    }
    const storedShape = shapeOptions.find((option) => option.id === localStorage.getItem(shapeKey(tenant.id)));
    if (storedShape) {
      setShape(storedShape.id);
      applyShapeToRoot(storedShape);
    }
    const storedSidebar = sidebarOptions.find((option) => option.id === localStorage.getItem(sidebarKey(tenant.id)));
    if (storedSidebar) {
      setSidebar(storedSidebar.id);
      applySidebarToRoot(storedSidebar);
    }
  }, [tenant]);

  const applyAccent = (option) => {
    setAccent(option.id);
    localStorage.setItem(accentKey(tenant?.id), option.id);
    applyAccentToRoot(option);
    dispatch({ type: 'tenant.update', tenantId: tenant.id, patch: { primaryColor: option.hex }, actor: 'settings' });
  };

  const applyShape = (option) => {
    setShape(option.id);
    localStorage.setItem(shapeKey(tenant?.id), option.id);
    applyShapeToRoot(option);
  };

  const applySidebar = (option) => {
    setSidebar(option.id);
    localStorage.setItem(sidebarKey(tenant?.id), option.id);
    applySidebarToRoot(option);
  };

  const saveProfile = () => {
    if (saving || !profile) return;
    if (!profile.name || profile.name.trim().length < 2) {
      setFieldError('Business name needs at least 2 characters.');
      return;
    }
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      setFieldError('Enter a valid contact email, or leave it blank.');
      return;
    }
    if (profile.gstin && !/^[0-9A-Za-z]{15}$/.test(profile.gstin.trim())) {
      setFieldError('GSTIN is optional. When entered, it needs 15 letters or digits.');
      return;
    }
    setFieldError('');
    setSaving(true);
    const result = dispatch({
      type: 'tenant.update',
      tenantId: tenant.id,
      patch: {
        name: profile.name.trim(),
        legalName: profile.legalName,
        email: profile.email,
        phone: profile.phone,
        gstin: profile.gstin?.trim() || '',
        address: profile.address,
        city: profile.city,
        invoiceName: profile.invoiceName || profile.name.trim(),
        receiptFooter: profile.receiptFooter,
        currency: profile.currency,
        openingTime: profile.openingTime,
        closingTime: profile.closingTime,
        logoDataUrl: profile.logoDataUrl || '',
      },
      actor: 'settings',
    });
    setSaving(false);
    toast.push(result.ok ? 'Saved in this browser’s demo data. No server was updated.' : result.error, result.ok ? 'success' : 'danger');
  };

  const onLogo = (file) => {
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      toast.push('Use a PNG, JPG, or WebP logo.', 'danger');
      return;
    }
    if (file.size > 512 * 1024) {
      toast.push('Logo must be under 512 KB.', 'danger');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setProfile((current) => ({ ...current, logoDataUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  const resetProfile = () => {
    setFieldError('');
    setHoursError('');
    setProfile({
      name: tenant.name,
      legalName: tenant.legalName,
      email: tenant.email,
      phone: tenant.phone,
      gstin: tenant.gstin,
      address: tenant.address,
      city: tenant.city,
      invoiceName: tenant.invoiceName,
      receiptFooter: tenant.receiptFooter,
      currency: tenant.currency || 'INR',
      openingTime: tenant.openingTime || '10:00',
      closingTime: tenant.closingTime || '21:00',
      logoDataUrl: tenant.logoDataUrl || '',
    });
  };

  const updateHours = (field, value) => {
    const next = { ...profile, [field]: value };
    const [openH, openM] = next.openingTime.split(':').map(Number);
    const [closeH, closeM] = next.closingTime.split(':').map(Number);
    const valid = closeH * 60 + closeM - (openH * 60 + openM) >= 60;
    setHoursError(valid ? '' : 'Closing time must be at least an hour after opening.');
    setProfile(next);
  };

  const exportProducts = () => {
    const rows = state.products.filter((product) => product.tenantId === tenant.id);
    const header = 'name,sku,barcode,category,brand,price,stock';
    const lines = rows.map((product) => [product.name, product.sku, product.barcode, product.category, product.brand, product.price, product.stock].join(','));
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tenant.slug || 'catalog'}-products.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importProducts = async (file) => {
    const text = await file.text();
    const rows = text.split(/\r?\n/).slice(1).filter(Boolean);
    let added = 0;
    rows.forEach((row) => {
      const [name, sku, barcode, category, brand, price, stock] = row.split(',');
      if (!name || !sku) return;
      const result = dispatch({
        type: 'product.save',
        tenantId: tenant.id,
        product: {
          name: name.trim(),
          sku: sku.trim(),
          barcode: barcode?.trim() || undefined,
          category: category?.trim() || 'General',
          brand: brand?.trim() || tenant.name,
          price: Number(price) || 0,
          costPrice: 0,
          taxRate: 5,
          stock: Number(stock) || 0,
          stockByBranch: { [branch?.id || 'unassigned']: Number(stock) || 0 },
          lowStock: 2,
        },
      });
      if (result.ok) added += 1;
    });
    toast.push(added ? `Imported ${added} products` : 'No rows were imported', added ? 'success' : 'danger');
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <header className="animate-fade-up">
        <h2 className="text-base font-semibold text-content">Settings</h2>
        <p className="mt-0.5 text-xs text-content-muted">
          {tenant?.name}. Changes stay on this business in this browser’s demo data.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <nav className="animate-fade-up flex flex-row gap-1 lg:flex-col" style={{ animationDelay: '80ms' }}>
          {settingsSections.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={cn(
                'flex items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium transition-colors',
                section === item.id
                  ? 'bg-accent-muted text-accent'
                  : 'text-content-muted hover:bg-surface-muted hover:text-content'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="animate-fade-up" style={{ animationDelay: '140ms' }}>
          {profile && (section === 'profile' || section === 'tax' || section === 'operations' || section === 'receipt') && (
            <div className="max-w-2xl space-y-4">
              {fieldError && <p className="text-sm text-danger" role="alert">{fieldError}</p>}
              {section === 'profile' && (
                <PanelCard title="Business profile" subtitle="Name and contact shown for this business">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input label="Business name" value={profile.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
                    <Input label="Legal name" value={profile.legalName || ''} onChange={(event) => setProfile({ ...profile, legalName: event.target.value })} />
                    <Input label="Contact email" type="email" value={profile.email || ''} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
                    <Input label="Contact phone" value={profile.phone || ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                    <Input label="City" value={profile.city || ''} onChange={(event) => setProfile({ ...profile, city: event.target.value })} />
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-content sm:col-span-2">
                      Address
                      <Input value={profile.address || ''} onChange={(event) => setProfile({ ...profile, address: event.target.value })} />
                    </label>
                  </div>
                </PanelCard>
              )}
              {section === 'tax' && (
                <PanelCard title="Tax information" subtitle="GSTIN is printed on receipts when it is filled in">
                  <Input label="GSTIN" value={profile.gstin || ''} hint="Optional. 15 letters or digits. This demo stores one GST total and does not split CGST, SGST, or IGST." onChange={(event) => setProfile({ ...profile, gstin: event.target.value.toUpperCase() })} />
                </PanelCard>
              )}
              {section === 'operations' && (
                <PanelCard title="Operations" subtitle="Currency and business hours apply to the whole business">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input label="Currency" value={profile.currency || 'INR'} onChange={(event) => setProfile({ ...profile, currency: event.target.value })} />
                    <div />
                    <Input label="Opening time" type="time" value={profile.openingTime} hint="Start of the working day" onChange={(event) => updateHours('openingTime', event.target.value)} />
                    <Input label="Closing time" type="time" value={profile.closingTime} error={hoursError} onChange={(event) => updateHours('closingTime', event.target.value)} />
                  </div>
                  <p className="mt-3 text-xs text-content-muted">
                    Branch name, address, and phone stay on that branch. Edit them on <Link className="text-accent underline" to="/retail/branches">Branches</Link>.
                  </p>
                </PanelCard>
              )}
              {section === 'receipt' && (
                <PanelCard title="Receipt" subtitle="These fields are the ones printed on the billing receipt">
                  <div className="grid grid-cols-1 gap-3">
                    <Input label="Name on receipt" value={profile.invoiceName || ''} onChange={(event) => setProfile({ ...profile, invoiceName: event.target.value })} />
                    <Input label="Receipt footer" value={profile.receiptFooter || ''} onChange={(event) => setProfile({ ...profile, receiptFooter: event.target.value })} />
                    <div>
                      <p className="mb-1.5 text-sm font-medium">Business logo</p>
                      <input aria-label="Business logo" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => onLogo(event.target.files?.[0])} />
                      {profile.logoDataUrl && <Button className="mt-2" size="sm" variant="outline" onClick={() => setProfile({ ...profile, logoDataUrl: '' })}>Remove logo</Button>}
                      <p className="mt-1 text-xs text-content-muted">PNG, JPG, or WebP under 512 KB. The logo is stored with this business only.</p>
                    </div>
                  </div>
                  <div className="mt-4 max-w-sm rounded-2xl border border-dashed border-border p-4 text-sm">
                    {profile.logoDataUrl ? <img src={profile.logoDataUrl} alt="" className="mb-2 h-12 w-12 object-contain" /> : null}
                    <p className="font-semibold">{profile.invoiceName || profile.name || 'Business'}</p>
                    <p className="text-xs text-content-muted">{[profile.address, profile.city].filter(Boolean).join(', ') || 'Address'}</p>
                    <p className="text-xs text-content-muted">GSTIN {profile.gstin || '—'}</p>
                    <p className="mt-2 text-xs text-content-muted">{profile.receiptFooter || 'Footer'}</p>
                    <p className="mt-2 text-[11px] text-content-muted">Preview of the printed heading. Totals still come from the sale.</p>
                  </div>
                </PanelCard>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={resetProfile} disabled={saving}>Cancel</Button>
                <Button variant="primary" onClick={saveProfile} disabled={Boolean(hoursError) || saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <PanelCard title="Notifications" subtitle="Choose what the store should be alerted about" className="max-w-2xl">
              <ul className="flex flex-col divide-y divide-border/60">
                {notificationToggles.map((toggle, index) => (
                  <li
                    key={toggle.id}
                    className="animate-fade-up flex items-center justify-between gap-4 py-3"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-content">{toggle.label}</p>
                      <p className="text-[11px] text-content-muted">{toggle.hint}</p>
                    </div>
                    <Toggle
                      label={toggle.label}
                      checked={toggles[toggle.id]}
                      onChange={(next) => {
                        const notifications = { ...toggles, [toggle.id]: next };
                        setToggles(notifications);
                        dispatch({ type: 'tenant.update', tenantId: tenant.id, patch: { notifications }, actor: 'settings' });
                      }}
                    />
                  </li>
                ))}
              </ul>
            </PanelCard>
          )}

          {section === 'appearance' && (
            <div className="flex max-w-2xl flex-col gap-4">
              <PanelCard title="Branding" subtitle="Accent, shape, and sidebar are saved for this business. Innosify defaults stay in place until a colour is chosen. Colours come from the fixed palette.">
                <p className="text-xs font-medium text-content">Accent color</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {accentOptions.map((option, index) => (
                    <button
                      key={option.id}
                      type="button"
                      title={option.label}
                      onClick={() => applyAccent(option)}
                      className={cn(
                        'animate-pop-in h-8 w-8 rounded-full border-2 transition-transform hover:scale-110',
                        accent === option.id ? 'border-accent ring-2 ring-accent/25' : 'border-border'
                      )}
                      style={{ backgroundColor: option.hex, animationDelay: `${index * 40}ms` }}
                    >
                      <span className="sr-only">{option.label}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-content-muted">
                  Selected: {accentOptions.find((option) => option.id === accent)?.label}
                </p>

                <p className="mt-4 text-xs font-medium text-content">Shape</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {shapeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applyShape(option)}
                      style={{ borderRadius: option.radius }}
                      className={cn(
                        'h-12 w-20 border-2 bg-surface-muted transition-colors',
                        shape === option.id ? 'border-accent' : 'border-border hover:border-border-strong'
                      )}
                    >
                      <span className="text-[11px] font-medium text-content">{option.label}</span>
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs font-medium text-content">Sidebar</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sidebarOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => applySidebar(option)}
                      style={{ backgroundColor: SIDEBAR_COLORS[option.id] }}
                      className={cn(
                        'h-8 w-16 rounded border-2 transition-transform hover:scale-105',
                        sidebar === option.id ? 'border-accent ring-2 ring-accent/25' : 'border-border'
                      )}
                    >
                      <span className="text-[10px] font-medium text-white">{option.label}</span>
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-xs font-medium text-content">Mode</p>
                <div className="mt-2 inline-flex rounded-full bg-surface-muted p-1">
                  {['light', 'dark'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setTheme(mode)}
                      className={cn(
                        'rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors',
                        theme === mode ? 'bg-surface text-content shadow-sm' : 'text-content-muted hover:text-content'
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </PanelCard>
            </div>
          )}

          {section === 'data' && (
            <PanelCard title="Data" subtitle="Product CSV for this business, and the demo reset" className="max-w-2xl">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={exportProducts}>Export CSV</Button>
                <label className="inline-flex">
                  <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => event.target.files?.[0] && importProducts(event.target.files[0])} />
                  <span className="inline-flex cursor-pointer items-center rounded border border-border px-3 py-2 text-sm font-medium text-content">Import CSV</span>
                </label>
                {demoMode && (
                  <Button variant="ghost" onClick={() => {
                    if (!window.confirm('Reset Demo Data? Sample products, sales, and stock in this browser return to the starting dataset. Accounts outside this demo are not changed.')) return;
                    reset().then(() => toast.push('Demo data restored', 'success'));
                  }}>Reset Demo Data</Button>
                )}
              </div>
            </PanelCard>
          )}
        </div>
      </div>
    </div>
  );
}