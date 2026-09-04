/**
 * Label template model — paper sizes, element defaults, and the default saree label.
 * Templates persist to localStorage until label templates land in the backend.
 */

export const paperSizes = [
  { label: '50mm x 30mm', width: 50, height: 30 },
  { label: '50mm x 70mm', width: 50, height: 70 },
  { label: '40mm x 60mm', width: 40, height: 60 },
  { label: '60mm x 90mm', width: 60, height: 90 },
  { label: 'Custom Size', width: null, height: null },
];

export const elementTypes = [
  { type: 'text', label: 'Text' },
  { type: 'brand', label: 'Brand / Logo' },
  { type: 'qr', label: 'QR Code' },
  { type: 'barcode', label: 'Barcode' },
  { type: 'line', label: 'Line' },
  { type: 'rectangle', label: 'Rectangle' },
  { type: 'image', label: 'Image' },
];

const layerNames = {
  brand: 'Brand Logo',
  productName: 'Product Name',
  qr: 'QR Code',
  barcode: 'Barcode',
  price: 'Price',
  sku: 'SKU',
  text: 'Text',
  line: 'Line',
  rectangle: 'Rectangle',
  image: 'Image',
};

let seq = 0;
export function newElement(type, overrides = {}) {
  seq += 1;
  const base = {
    id: `el-${Date.now()}-${seq}`,
    type,
    name: layerNames[type] ?? type,
    x: 5,
    y: 5,
    w: 20,
    h: 10,
  };
  const defaults = {
    text: { w: 30, h: 6, text: 'Text', font: 'Poppins', fontSize: 14, align: 'left', color: '#0f172a' },
    brand: { x: 15, y: 3, w: 20, h: 8 },
    productName: { x: 5, y: 12, w: 40, h: 7, font: 'Poppins', fontSize: 14, align: 'center' },
    qr: { x: 15, y: 20, w: 20, h: 20 },
    price: { x: 5, y: 41, w: 40, h: 7, font: 'Poppins', fontSize: 16, align: 'center' },
    barcode: { x: 7, y: 49, w: 36, h: 12 },
    sku: { x: 5, y: 62, w: 40, h: 4 },
    line: { w: 40, h: 1 },
    rectangle: { w: 40, h: 15 },
    image: { w: 20, h: 15 },
  };
  return { ...base, ...(defaults[type] ?? {}), ...overrides };
}

export function defaultTemplate() {
  return {
    name: 'Default Saree Label',
    paperLabel: '50mm x 70mm',
    width: 50,
    height: 70,
    orientation: 'portrait',
    elements: [
      newElement('brand'),
      newElement('productName'),
      newElement('qr'),
      newElement('price'),
      newElement('barcode'),
      newElement('sku'),
    ],
  };
}

const STORAGE_KEY = 'retail:label-template';

export function loadTemplate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTemplate();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.elements)) return defaultTemplate();
    return { ...defaultTemplate(), ...parsed };
  } catch {
    return defaultTemplate();
  }
}

export function saveTemplateToStorage(template) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
  } catch {
    // storage unavailable — template still applies for this session
  }
}

/** Canvas dimensions in mm, honoring orientation. */
export function canvasSize(template) {
  const portrait = template.orientation !== 'landscape';
  return {
    width: portrait ? template.width : template.height,
    height: portrait ? template.height : template.width,
  };
}
