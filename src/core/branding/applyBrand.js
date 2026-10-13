import { useEffect } from 'react';
import { useTenant } from '@core/tenant/TenantProvider.jsx';

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((char) => char + char).join('') : value;
  const num = Number.parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function mixWithWhite(hex, amount) {
  const { r, g, b } = hexToRgb(hex);
  const channel = (part) => Math.round(part + (255 - part) * amount);
  return `${channel(r)} ${channel(g)} ${channel(b)}`;
}

export function applyBrand(tenant) {
  const root = document.documentElement;
  if (!tenant?.primaryColor) {
    root.style.removeProperty('--color-accent');
    root.style.removeProperty('--color-accent-hover');
    root.style.removeProperty('--color-brand');
    root.style.removeProperty('--rgb-accent');
    root.style.removeProperty('--rgb-brand');
    root.style.removeProperty('--rgb-accent-muted');
    root.style.removeProperty('--color-accent-muted');
    document.title = 'Innosify POS';
    return;
  }
  const { r, g, b } = hexToRgb(tenant.primaryColor);
  root.style.setProperty('--color-accent', tenant.primaryColor);
  root.style.setProperty('--color-accent-hover', tenant.primaryColor);
  root.style.setProperty('--color-brand', tenant.primaryColor);
  root.style.setProperty('--rgb-accent', `${r} ${g} ${b}`);
  root.style.setProperty('--rgb-brand', `${r} ${g} ${b}`);
  root.style.setProperty('--rgb-accent-muted', mixWithWhite(tenant.primaryColor, 0.82));
  document.title = `${tenant.name} · Innosify POS`;
}

export function BrandingEffect() {
  const { tenant } = useTenant();
  useEffect(() => {
    applyBrand(tenant);
    return () => applyBrand(null);
  }, [tenant]);
  return null;
}
