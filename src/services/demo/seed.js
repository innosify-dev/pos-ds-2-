import { quoteCart, rupeesToPaise } from './money.js';

export const SEED_VERSION = 2;
export const DEMO_PASSWORD = 'Demo@12345';

const PLANS = [
  {
    code: 'FREE',
    name: 'Free',
    pricePaise: 0,
    interval: 'MONTHLY',
    trialDays: 0,
    active: true,
    description: 'A single register for a new shop.',
    limits: { branches: 1, registers: 1, users: 1, transactionsPerMonth: 40 },
    features: ['1 branch', '1 register', '1 user', '40 transactions / month'],
  },
  {
    code: 'STARTER',
    name: 'Starter',
    pricePaise: 99900,
    interval: 'MONTHLY',
    trialDays: 14,
    active: true,
    description: 'Daily billing and basic inventory.',
    limits: { branches: 1, registers: 2, users: 3, transactionsPerMonth: 500 },
    features: ['Basic inventory', '3 users', 'Barcode billing', '500 transactions / month'],
  },
  {
    code: 'PROFESSIONAL',
    name: 'Professional',
    pricePaise: 249900,
    interval: 'MONTHLY',
    trialDays: 14,
    active: true,
    description: 'Multiple branches, reports, and staff roles.',
    limits: { branches: 5, registers: 10, users: 25, transactionsPerMonth: 5000 },
    features: ['Multiple branches', 'Reports and analytics', 'Staff permissions', 'Returns and refunds'],
  },
  {
    code: 'ENTERPRISE',
    name: 'Enterprise',
    pricePaise: 999900,
    interval: 'MONTHLY',
    trialDays: 0,
    active: true,
    description: 'Configurable limits for larger operations.',
    limits: { branches: 50, registers: 100, users: 200, transactionsPerMonth: 100000 },
    features: ['Configurable limits', 'Advanced permissions', 'Priority support', 'Many branches'],
  },
];

function user(id, email, firstName, lastName, preferredTenantId = null) {
  return { id, email, password: DEMO_PASSWORD, firstName, lastName, phone: '', status: 'ACTIVE', preferredTenantId, platformRole: null };
}

function at(now, daysAgo, hour) {
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 10, 0, 0);
  return date.toISOString();
}

function sale({ id, tenantId, branchId, registerId, cashierId, customerId, invoiceNo, createdAt, lines, payments }) {
  const quote = quoteCart(lines.map((line) => ({
    ...line,
    unitPricePaise: rupeesToPaise(line.price),
    discountPaise: rupeesToPaise(line.discount || 0),
  })));
  return {
    id,
    tenantId,
    branchId,
    registerId,
    cashierId,
    customerId,
    invoiceNo,
    createdAt,
    lines: quote.lines,
    subtotalPaise: quote.subtotalPaise,
    discountPaise: quote.discountPaise,
    taxPaise: quote.taxPaise,
    totalPaise: quote.totalPaise,
    payments: payments || [{ method: 'upi', amountPaise: quote.totalPaise, status: 'SIMULATED', label: 'Simulated payment — not verified by a gateway' }],
    changePaise: 0,
    status: 'PAID',
  };
}

export function createSeed(now = new Date()) {
  const users = [
    user('u-super', 'superadmin@demo.innosify.test', 'Platform', 'Admin'),
    user('u-takshi', 'owner@demo.takshi.test', 'Lakshmi', 'Narayan', 't-takshi'),
    user('u-admin', 'admin@demo.takshi.test', 'Arun', 'Mehta', 't-takshi'),
    user('u-manager', 'manager@demo.takshi.test', 'Kavitha', 'Rao', 't-takshi'),
    user('u-cashier', 'cashier@demo.takshi.test', 'Priya', 'Sharma', 't-takshi'),
    user('u-inventory', 'inventory@demo.takshi.test', 'Anitha', 'Suresh', 't-takshi'),
    user('u-multi', 'owner@demo.multibiz.test', 'Meera', 'Iyer', 't-takshi'),
    user('u-fresh', 'owner@demo.freshmart.test', 'Rahul', 'Desai', 't-fresh'),
    user('u-tiles', 'owner@demo.royaltiles.test', 'Imran', 'Qureshi', 't-royal'),
  ];
  users[0].platformRole = 'SUPER_ADMIN';

  const tenants = [
    {
      id: 't-takshi',
      slug: 'takshi-silks',
      name: 'Takshi Silks',
      legalName: 'Takshi Silks',
      type: 'clothing',
      logoDataUrl: null,
      primaryColor: '#6B238F',
      secondaryColor: '#EEE4F5',
      currency: 'INR',
      gstin: '33AABCT1234K1Z5',
      phone: '+91 98765 43210',
      email: 'hello@demo.takshi.test',
      address: '12, Kumbakonam Road',
      city: 'Thanjavur',
      invoiceName: 'Takshi Silks',
      receiptFooter: 'Thank you for visiting Takshi Silks. Demo receipt — no payment was collected.',
      taxInclusive: false,
      status: 'ACTIVE',
      ownerUserId: 'u-takshi',
    },
    {
      id: 't-fresh',
      slug: 'fresh-mart',
      name: 'Fresh Mart Demo',
      legalName: 'Fresh Mart Demo Supermarket',
      type: 'supermarket',
      logoDataUrl: null,
      primaryColor: '#1C6A4A',
      secondaryColor: '#E2F3EB',
      currency: 'INR',
      gstin: '27AABCF5678L1Z2',
      phone: '+91 98000 11122',
      email: 'hello@demo.freshmart.test',
      address: '44, Lake Road',
      city: 'Pune',
      invoiceName: 'Fresh Mart Demo',
      receiptFooter: 'Fresh Mart Demo receipt. Prices and GST rates are fictional sample data. No payment was collected.',
      taxInclusive: false,
      status: 'ACTIVE',
      ownerUserId: 'u-fresh',
    },
    {
      id: 't-royal',
      slug: 'royal-tiles',
      name: 'Royal Tiles',
      legalName: 'Royal Tiles & Hardware',
      type: 'tiles',
      logoDataUrl: null,
      primaryColor: '#1D4E89',
      secondaryColor: '#E4EEF8',
      currency: 'INR',
      gstin: '29AABCR9012M1Z8',
      phone: '+91 98111 22334',
      email: 'hello@demo.royaltiles.test',
      address: '8, Industrial Estate',
      city: 'Bengaluru',
      invoiceName: 'Royal Tiles',
      receiptFooter: 'Royal Tiles demo receipt. Tile quantities are in boxes unless noted.',
      taxInclusive: false,
      status: 'ACTIVE',
      ownerUserId: 'u-tiles',
    },
  ];

  const trialEnds = new Date(now);
  trialEnds.setDate(trialEnds.getDate() + 9);

  const subscriptions = [
    { id: 'sub-takshi', tenantId: 't-takshi', planCode: 'PROFESSIONAL', status: 'ACTIVE', trialEndsAt: null, renewsAt: at(now, -2, 9), history: [{ at: at(now, 40, 11), type: 'ASSIGNED', planCode: 'PROFESSIONAL', note: 'Demo subscription' }] },
    { id: 'sub-fresh', tenantId: 't-fresh', planCode: 'STARTER', status: 'ACTIVE', trialEndsAt: null, renewsAt: at(now, -5, 9), history: [{ at: at(now, 20, 11), type: 'ASSIGNED', planCode: 'STARTER', note: 'Demo subscription' }] },
    { id: 'sub-royal', tenantId: 't-royal', planCode: 'PROFESSIONAL', status: 'TRIALING', trialEndsAt: trialEnds.toISOString(), renewsAt: trialEnds.toISOString(), history: [{ at: at(now, 5, 11), type: 'ASSIGNED', planCode: 'PROFESSIONAL', note: '14-day demo trial' }] },
  ];

  const branches = [
    { id: 'b-takshi-main', tenantId: 't-takshi', name: 'Main Store', code: 'MAIN', address: '12, Kumbakonam Road', city: 'Thanjavur', isDefault: true, phone: '+91 98765 43210' },
    { id: 'b-takshi-city', tenantId: 't-takshi', name: 'City Showroom', code: 'CITY', address: '2, Big Street', city: 'Thanjavur', isDefault: false, phone: '+91 98765 43211' },
    { id: 'b-fresh', tenantId: 't-fresh', name: 'Downtown', code: 'DT', address: '44, Lake Road', city: 'Pune', isDefault: true, phone: '+91 98000 11122' },
    { id: 'b-fresh-east', tenantId: 't-fresh', name: 'Koregaon Park', code: 'KP', address: '18, North Main Road', city: 'Pune', isDefault: false, phone: '+91 98000 11123' },
    { id: 'b-royal', tenantId: 't-royal', name: 'Depot', code: 'DEPOT', address: '8, Industrial Estate', city: 'Bengaluru', isDefault: true, phone: '+91 98111 22334' },
  ];

  const registers = [
    { id: 'r-takshi-1', tenantId: 't-takshi', branchId: 'b-takshi-main', name: 'Register 01', code: 'REG-001', isActive: true, status: 'Open', cashierId: 'u-cashier', openingCashPaise: 1000000, currentCashPaise: 1250000, openedAt: at(now, 0, 9), allowCash: true, allowCard: true, allowUpi: true },
    { id: 'r-takshi-2', tenantId: 't-takshi', branchId: 'b-takshi-main', name: 'Register 02', code: 'REG-002', isActive: true, status: 'Closed', cashierId: null, openingCashPaise: 0, currentCashPaise: 0, openedAt: null, allowCash: true, allowCard: true, allowUpi: true },
    { id: 'r-takshi-3', tenantId: 't-takshi', branchId: 'b-takshi-city', name: 'Showroom Register', code: 'REG-101', isActive: true, status: 'Closed', cashierId: null, openingCashPaise: 0, currentCashPaise: 0, openedAt: null, allowCash: true, allowCard: true, allowUpi: false },
    { id: 'r-fresh-1', tenantId: 't-fresh', branchId: 'b-fresh', name: 'Counter 1', code: 'REG-001', isActive: true, status: 'Open', cashierId: 'u-fresh', openingCashPaise: 500000, currentCashPaise: 560000, openedAt: at(now, 0, 8), allowCash: true, allowCard: true, allowUpi: true },
    { id: 'r-fresh-2', tenantId: 't-fresh', branchId: 'b-fresh-east', name: 'Counter 2', code: 'REG-002', isActive: true, status: 'Closed', cashierId: null, openingCashPaise: 0, currentCashPaise: 0, openedAt: null, allowCash: true, allowCard: true, allowUpi: true },
    { id: 'r-royal-1', tenantId: 't-royal', branchId: 'b-royal', name: 'Billing Desk', code: 'REG-001', isActive: true, status: 'Closed', cashierId: null, openingCashPaise: 0, currentCashPaise: 0, openedAt: null, allowCash: true, allowCard: true, allowUpi: true },
  ];

  const memberships = [
    { id: 'm1', userId: 'u-takshi', tenantId: 't-takshi', role: 'OWNER', branchIds: ['b-takshi-main', 'b-takshi-city'], status: 'ACTIVE', shift: 'floor', rating: 4.9 },
    { id: 'm2', userId: 'u-admin', tenantId: 't-takshi', role: 'BUSINESS_ADMIN', branchIds: ['b-takshi-main', 'b-takshi-city'], status: 'ACTIVE', shift: 'floor', rating: 4.7 },
    { id: 'm3', userId: 'u-manager', tenantId: 't-takshi', role: 'BRANCH_MANAGER', branchIds: ['b-takshi-main'], status: 'ACTIVE', shift: 'stockroom', rating: 4.8 },
    { id: 'm4', userId: 'u-cashier', tenantId: 't-takshi', role: 'CASHIER', branchIds: ['b-takshi-main'], status: 'ACTIVE', shift: 'billing', rating: 4.8 },
    { id: 'm5', userId: 'u-inventory', tenantId: 't-takshi', role: 'INVENTORY_STAFF', branchIds: ['b-takshi-main'], status: 'ACTIVE', shift: 'stockroom', rating: 4.4 },
    { id: 'm6', userId: 'u-multi', tenantId: 't-takshi', role: 'OWNER', branchIds: ['b-takshi-main', 'b-takshi-city'], status: 'ACTIVE', shift: 'floor', rating: 4.9 },
    { id: 'm7', userId: 'u-multi', tenantId: 't-fresh', role: 'OWNER', branchIds: ['b-fresh', 'b-fresh-east'], status: 'ACTIVE', shift: 'floor', rating: 4.9 },
    { id: 'm8', userId: 'u-multi', tenantId: 't-royal', role: 'OWNER', branchIds: ['b-royal'], status: 'ACTIVE', shift: 'floor', rating: 4.9 },
    { id: 'm9', userId: 'u-fresh', tenantId: 't-fresh', role: 'OWNER', branchIds: ['b-fresh', 'b-fresh-east'], status: 'ACTIVE', shift: 'billing', rating: 4.6 },
    { id: 'm10', userId: 'u-tiles', tenantId: 't-royal', role: 'OWNER', branchIds: ['b-royal'], status: 'ACTIVE', shift: 'floor', rating: 4.7 },
  ];

  const categories = [
    { id: 'c-sarees', tenantId: 't-takshi', name: 'Sarees', parentId: null, status: 'Active' },
    { id: 'c-silk', tenantId: 't-takshi', name: 'Silk Sarees', parentId: 'c-sarees', status: 'Active' },
    { id: 'c-cotton', tenantId: 't-takshi', name: 'Cotton Sarees', parentId: 'c-sarees', status: 'Active' },
    { id: 'c-grocery', tenantId: 't-fresh', name: 'Grocery', parentId: null, status: 'Active' },
    { id: 'c-beverages', tenantId: 't-fresh', name: 'Beverages', parentId: null, status: 'Active' },
    { id: 'c-care', tenantId: 't-fresh', name: 'Personal Care', parentId: null, status: 'Active' },
    { id: 'c-household', tenantId: 't-fresh', name: 'Household', parentId: null, status: 'Active' },
    { id: 'c-snacks', tenantId: 't-fresh', name: 'Snacks', parentId: null, status: 'Active' },
    { id: 'c-dairy', tenantId: 't-fresh', name: 'Dairy', parentId: null, status: 'Active' },
    { id: 'c-electronics', tenantId: 't-fresh', name: 'Electronics Accessories', parentId: null, status: 'Active' },
    { id: 'c-floor', tenantId: 't-royal', name: 'Floor Tiles', parentId: null, status: 'Active' },
    { id: 'c-wall', tenantId: 't-royal', name: 'Wall Tiles', parentId: null, status: 'Active' },
  ];

  const brands = [
    { id: 'bd-nalli', tenantId: 't-takshi', name: 'Nalli' },
    { id: 'bd-pothys', tenantId: 't-takshi', name: 'Pothys' },
    { id: 'bd-fresh', tenantId: 't-fresh', name: 'Sample House' },
    { id: 'bd-amul', tenantId: 't-fresh', name: 'Amul' },
    { id: 'bd-britannia', tenantId: 't-fresh', name: 'Britannia' },
    { id: 'bd-tata', tenantId: 't-fresh', name: 'Tata' },
    { id: 'bd-parle', tenantId: 't-fresh', name: 'Parle' },
    { id: 'bd-colgate', tenantId: 't-fresh', name: 'Colgate' },
    { id: 'bd-surf', tenantId: 't-fresh', name: 'Surf Excel' },
    { id: 'bd-kajaria', tenantId: 't-royal', name: 'Kajaria' },
    { id: 'bd-somany', tenantId: 't-royal', name: 'Somany' },
  ];

  const products = [
    product('p-kanji', 't-takshi', 'Kanjivaram Silk Saree — Red Gold Zari', 'KK5000401', '8901000000011', 'Silk Sarees', 'Nalli', 18500, 12000, 5, { 'b-takshi-main': 8, 'b-takshi-city': 4 }, { fabric: 'Pure Silk', color: 'Red', design: 'Gold zari' }),
    product('p-banaras', 't-takshi', 'Banarasi Silk Saree', 'BSL00401', '8901000000028', 'Silk Sarees', 'Pothys', 12400, 8000, 4, { 'b-takshi-main': 6, 'b-takshi-city': 2 }, { fabric: 'Pure Silk', color: 'Maroon' }),
    product('p-soft', 't-takshi', 'Soft Silk Saree', 'SSL00402', '8901000000035', 'Silk Sarees', 'Nalli', 6200, 3900, 5, { 'b-takshi-main': 10, 'b-takshi-city': 3 }, { fabric: 'Soft silk', color: 'Green' }),
    product('p-cotton', 't-takshi', 'Handloom Cotton Saree', 'COT00901', '8901000000042', 'Cotton Sarees', 'Pothys', 2800, 1500, 6, { 'b-takshi-main': 14, 'b-takshi-city': 5 }, { fabric: 'Cotton', color: 'Indigo' }),
    product('p-organza', 't-takshi', 'Organza Saree', 'ORG00601', '8901000000059', 'Silk Sarees', 'Nalli', 5400, 3100, 3, { 'b-takshi-main': 2, 'b-takshi-city': 0 }, { fabric: 'Organza', color: 'Peach' }),
    product('p-rice', 't-fresh', 'Ponni Rice 5 kg', 'RICE5', '8902000000012', 'Grocery', 'Sample House', 320, 260, 5, { 'b-fresh': 40, 'b-fresh-east': 12 }, { weight: '5 kg', packSize: '1 bag' }),
    product('p-oil', 't-fresh', 'Sunflower Oil 1 L', 'OIL1', '8902000000029', 'Grocery', 'Sample House', 165, 140, 5, { 'b-fresh': 28, 'b-fresh-east': 10 }, { weight: '1 L', packSize: '1 bottle' }),
    product('p-milk', 't-fresh', 'Amul Milk 500 ml', 'MILK500', '8902000000036', 'Dairy', 'Amul', 28, 24, 0, { 'b-fresh': 48, 'b-fresh-east': 20 }, { weight: '500 ml', packSize: '1 pouch' }),
    product('p-atta', 't-fresh', 'Chakki Atta 10 kg', 'ATTA10', '8902000000043', 'Grocery', 'Sample House', 410, 350, 5, { 'b-fresh': 18, 'b-fresh-east': 6 }, { weight: '10 kg', packSize: '1 bag' }),
    product('p-bread', 't-fresh', 'Britannia Bread', 'BREAD', '8902000000104', 'Grocery', 'Britannia', 45, 32, 0, { 'b-fresh': 22, 'b-fresh-east': 10 }, { unit: 'Pack' }),
    product('p-parle', 't-fresh', 'Parle-G Biscuits', 'PARLEG', '8902000000111', 'Snacks', 'Parle', 10, 7, 18, { 'b-fresh': 80, 'b-fresh-east': 36 }, { unit: 'Pack' }),
    product('p-salt', 't-fresh', 'Tata Salt 1 kg', 'SALT1', '8902000000128', 'Grocery', 'Tata', 28, 22, 0, { 'b-fresh': 40, 'b-fresh-east': 16 }, { unit: 'Pack' }),
    product('p-sugar', 't-fresh', 'Sugar 1 kg', 'SUGAR1', '8902000000135', 'Grocery', 'Sample House', 52, 44, 5, { 'b-fresh': 30, 'b-fresh-east': 12 }, { unit: 'Pack' }),
    product('p-rice1', 't-fresh', 'Rice 1 kg', 'RICE1', '8902000000142', 'Grocery', 'Sample House', 68, 54, 0, { 'b-fresh': 36, 'b-fresh-east': 14 }, { unit: 'Pack' }),
    product('p-paste', 't-fresh', 'Colgate Toothpaste', 'PASTE', '8902000000159', 'Personal Care', 'Colgate', 95, 70, 18, { 'b-fresh': 24, 'b-fresh-east': 8 }, { unit: 'Pack' }),
    product('p-soap', 't-fresh', 'Bath Soap', 'SOAP', '8902000000166', 'Personal Care', 'Sample House', 40, 26, 18, { 'b-fresh': 50, 'b-fresh-east': 18 }, { unit: 'Nos' }),
    product('p-shampoo', 't-fresh', 'Shampoo', 'SHAMP', '8902000000173', 'Personal Care', 'Sample House', 145, 98, 18, { 'b-fresh': 16, 'b-fresh-east': 6 }, { unit: 'Pack' }),
    product('p-water', 't-fresh', 'Mineral Water', 'WATER', '8902000000180', 'Beverages', 'Sample House', 20, 12, 18, { 'b-fresh': 70, 'b-fresh-east': 30 }, { unit: 'Pack' }),
    product('p-cola', 't-fresh', 'Soft Drink', 'COLA', '8902000000197', 'Beverages', 'Sample House', 40, 28, 28, { 'b-fresh': 42, 'b-fresh-east': 15 }, { unit: 'Pack' }),
    product('p-tea', 't-fresh', 'Tea Powder', 'TEA', '8902000000203', 'Grocery', 'Tata', 120, 90, 5, { 'b-fresh': 18, 'b-fresh-east': 7 }, { unit: 'Pack' }),
    product('p-surf', 't-fresh', 'Detergent Powder', 'DETER', '8902000000210', 'Household', 'Surf Excel', 135, 100, 18, { 'b-fresh': 20, 'b-fresh-east': 5 }, { unit: 'Pack' }),
    product('p-note', 't-fresh', 'Notebook', 'NOTE', '8902000000227', 'Household', 'Sample House', 35, 20, 12, { 'b-fresh': 25, 'b-fresh-east': 9 }, { unit: 'Nos' }),
    product('p-pen', 't-fresh', 'Ball Pen', 'PEN', '8902000000234', 'Household', 'Sample House', 10, 4, 18, { 'b-fresh': 100, 'b-fresh-east': 40 }, { unit: 'Nos' }),
    product('p-choc', 't-fresh', 'Chocolate', 'CHOC', '8902000000241', 'Snacks', 'Sample House', 30, 18, 18, { 'b-fresh': 8, 'b-fresh-east': 3 }, { unit: 'Pack' }),
    product('p-chips', 't-fresh', 'Chips', 'CHIPS', '8902000000258', 'Snacks', 'Sample House', 20, 12, 12, { 'b-fresh': 34, 'b-fresh-east': 11 }, { unit: 'Pack' }),
    product('p-usb', 't-fresh', 'USB Cable', 'USB', '8902000000265', 'Electronics Accessories', 'Sample House', 199, 90, 18, { 'b-fresh': 14, 'b-fresh-east': 4 }, { unit: 'Nos' }),
    product('p-charger', 't-fresh', 'Phone Charger', 'CHARGER', '8902000000272', 'Electronics Accessories', 'Sample House', 349, 180, 18, { 'b-fresh': 6, 'b-fresh-east': 2 }, { unit: 'Nos' }),
    product('p-tile-white', 't-royal', 'Glossy White Floor Tile 600x600', 'TL-W600', '8903000000018', 'Floor Tiles', 'Kajaria', 850, 620, 18, { 'b-royal': 120 }, { unit: 'Box', sqftPerBox: 15.5, piecesPerBox: 4 }),
    product('p-tile-wood', 't-royal', 'Wood Finish Floor Tile', 'TL-WOOD', '8903000000025', 'Floor Tiles', 'Somany', 980, 700, 18, { 'b-royal': 48 }, { unit: 'Box', sqftPerBox: 15.5, piecesPerBox: 4 }),
    product('p-tile-wall', 't-royal', 'Matte Wall Tile 300x450', 'TL-WALL', '8903000000032', 'Wall Tiles', 'Kajaria', 640, 450, 18, { 'b-royal': 15 }, { unit: 'Box', piecesPerBox: 5 }),
  ];

  const customers = [
    { id: 'cu1', tenantId: 't-takshi', name: 'Divya Raman', phone: '9840011122', email: 'divya@example.test', notes: 'Prefers silk sarees', loyaltyPoints: 120, balancePaise: 0 },
    { id: 'cu2', tenantId: 't-takshi', name: 'Walk-in counter', phone: '', email: '', notes: 'Default walk-in', loyaltyPoints: 0, balancePaise: 0, walkIn: true },
    { id: 'cu3', tenantId: 't-fresh', name: 'Sanjay Kulkarni', phone: '9822099001', email: 'sanjay@example.test', notes: 'Sample customer', loyaltyPoints: 40, balancePaise: 0 },
    { id: 'cu5', tenantId: 't-fresh', name: 'Meena Joshi', phone: '9822012345', email: 'meena@example.test', notes: 'Sample customer', loyaltyPoints: 12, balancePaise: 0 },
    { id: 'cu6', tenantId: 't-fresh', name: 'Walk-in counter', phone: '', email: '', notes: 'Default walk-in', loyaltyPoints: 0, balancePaise: 0, walkIn: true },
    { id: 'cu4', tenantId: 't-royal', name: 'Builders Guild', phone: '9800012345', email: 'accounts@builders.test', notes: 'Site delivery', loyaltyPoints: 0, balancePaise: 0 },
  ];

  const suppliers = [
    { id: 's1', tenantId: 't-takshi', name: 'Nalli Weavers', phone: '9444011111', city: 'Kanchipuram' },
    { id: 's2', tenantId: 't-fresh', name: 'Western Wholesale', phone: '02040001111', city: 'Pune' },
    { id: 's4', tenantId: 't-fresh', name: 'Amul City Distributor', phone: '02040001122', city: 'Pune' },
    { id: 's3', tenantId: 't-royal', name: 'Kajaria Depot', phone: '08040002222', city: 'Bengaluru' },
  ];

  const line = (product, qty, discount = 0) => ({
    productId: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    qty,
    price: product.price,
    discount,
    taxRate: product.taxRate,
  });

  const byId = (id) => products.find((item) => item.id === id);

  const sales = [
    sale({ id: 'sal-1', tenantId: 't-takshi', branchId: 'b-takshi-main', registerId: 'r-takshi-1', cashierId: 'u-cashier', customerId: 'cu1', invoiceNo: 'TAK-1048', createdAt: at(now, 0, 11), lines: [line(byId('p-kanji'), 1)], payments: [{ method: 'upi', amountPaise: 0, status: 'SIMULATED', label: 'Simulated payment — not verified by a gateway' }] }),
    sale({ id: 'sal-2', tenantId: 't-takshi', branchId: 'b-takshi-main', registerId: 'r-takshi-1', cashierId: 'u-cashier', customerId: 'cu2', invoiceNo: 'TAK-1049', createdAt: at(now, 0, 16), lines: [line(byId('p-cotton'), 2)], payments: [{ method: 'cash', amountPaise: 0, status: 'SIMULATED', label: 'Simulated payment — not verified by a gateway' }] }),
    sale({ id: 'sal-3', tenantId: 't-takshi', branchId: 'b-takshi-city', registerId: 'r-takshi-3', cashierId: 'u-admin', customerId: 'cu1', invoiceNo: 'TAK-1030', createdAt: at(now, 12, 15), lines: [line(byId('p-banaras'), 1)] }),
    sale({ id: 'sal-4', tenantId: 't-takshi', branchId: 'b-takshi-main', registerId: 'r-takshi-1', cashierId: 'u-cashier', customerId: 'cu2', invoiceNo: 'TAK-1002', createdAt: at(now, 36, 13), lines: [line(byId('p-soft'), 1), line(byId('p-cotton'), 1)] }),
    sale({ id: 'sal-8', tenantId: 't-takshi', branchId: 'b-takshi-main', registerId: 'r-takshi-1', cashierId: 'u-cashier', customerId: 'cu1', invoiceNo: 'TAK-1018', createdAt: at(now, 70, 14), lines: [line(byId('p-organza'), 1)], payments: [{ method: 'card', amountPaise: 0, status: 'SIMULATED', label: 'Simulated payment — not verified by a gateway' }] }),
    sale({ id: 'sal-9', tenantId: 't-takshi', branchId: 'b-takshi-city', registerId: 'r-takshi-3', cashierId: 'u-admin', customerId: 'cu2', invoiceNo: 'TAK-0988', createdAt: at(now, 110, 12), lines: [line(byId('p-soft'), 1)] }),
    sale({ id: 'sal-5', tenantId: 't-fresh', branchId: 'b-fresh', registerId: 'r-fresh-1', cashierId: 'u-fresh', customerId: 'cu3', invoiceNo: 'FRE-880', createdAt: at(now, 0, 10), lines: [line(byId('p-rice'), 1), line(byId('p-milk'), 2)] }),
    sale({ id: 'sal-6', tenantId: 't-fresh', branchId: 'b-fresh', registerId: 'r-fresh-1', cashierId: 'u-fresh', customerId: 'cu3', invoiceNo: 'FRE-860', createdAt: at(now, 8, 18), lines: [line(byId('p-oil'), 2)] }),
    sale({ id: 'sal-10', tenantId: 't-fresh', branchId: 'b-fresh-east', registerId: 'r-fresh-2', cashierId: 'u-fresh', customerId: 'cu5', invoiceNo: 'FRE-870', createdAt: at(now, 1, 15), lines: [line(byId('p-parle'), 4), line(byId('p-paste'), 1)], payments: [{ method: 'cash', amountPaise: 0, status: 'SIMULATED', label: 'Simulated payment — not verified by a gateway' }] }),
    sale({ id: 'sal-7', tenantId: 't-royal', branchId: 'b-royal', registerId: 'r-royal-1', cashierId: 'u-tiles', customerId: 'cu4', invoiceNo: 'ROY-220', createdAt: at(now, 1, 12), lines: [line(byId('p-tile-white'), 4)] }),
  ].map((entry) => ({
    ...entry,
    payments: entry.payments.map((payment) => ({ ...payment, amountPaise: payment.amountPaise || entry.totalPaise })),
  }));

  const returns = [{
    id: 'ret-1',
    tenantId: 't-takshi',
    saleId: 'sal-4',
    invoiceNo: 'TAK-1002',
    lines: [{ lineIndex: 1, qty: 1, restock: true, amountPaise: sales.find((item) => item.id === 'sal-4').lines[1].totalPaise, name: byId('p-cotton').name, productId: 'p-cotton' }],
    reason: 'Size exchange',
    amountPaise: sales.find((item) => item.id === 'sal-4').lines[1].totalPaise,
    createdAt: at(now, 30, 12),
  }];

  const refunds = [{
    id: 'rfd-1',
    tenantId: 't-takshi',
    saleId: 'sal-4',
    returnId: 'ret-1',
    invoiceNo: 'TAK-1002',
    amountPaise: returns[0].amountPaise,
    method: 'upi',
    status: 'SIMULATED',
    createdAt: at(now, 30, 12),
    note: 'Simulated refund — no money was transferred.',
  }];

  return {
    version: SEED_VERSION,
    plans: PLANS,
    users,
    tenants,
    subscriptions,
    branches,
    registers,
    memberships,
    categories,
    brands,
    products,
    customers,
    suppliers,
    sales,
    returns,
    refunds,
    purchases: [
      { id: 'pur-takshi-1', tenantId: 't-takshi', supplierId: 's1', branchId: 'b-takshi-main', status: 'RECEIVED', note: 'Demo goods receipt. No purchase order was sent to a supplier.', createdAt: at(now, 4, 10), lines: [{ productId: 'p-cotton', name: 'Handloom Cotton Saree', qty: 6 }] },
      { id: 'pur-takshi-2', tenantId: 't-takshi', supplierId: 's1', branchId: 'b-takshi-city', status: 'RECEIVED', note: 'Demo goods receipt for the showroom.', createdAt: at(now, 9, 11), lines: [{ productId: 'p-banaras', name: 'Banarasi Silk Saree', qty: 2 }] },
      { id: 'pur-fresh-1', tenantId: 't-fresh', supplierId: 's2', branchId: 'b-fresh', status: 'RECEIVED', note: 'Demo goods receipt. Stock above already includes this delivery.', createdAt: at(now, 2, 9), lines: [{ productId: 'p-rice', name: 'Ponni Rice 5 kg', qty: 20 }, { productId: 'p-oil', name: 'Sunflower Oil 1 L', qty: 12 }] },
      { id: 'pur-fresh-2', tenantId: 't-fresh', supplierId: 's4', branchId: 'b-fresh-east', status: 'RECEIVED', note: 'Demo dairy delivery for Koregaon Park.', createdAt: at(now, 1, 8), lines: [{ productId: 'p-milk', name: 'Amul Milk 500 ml', qty: 20 }] },
      { id: 'pur-royal-1', tenantId: 't-royal', supplierId: 's3', branchId: 'b-royal', status: 'RECEIVED', note: 'Demo tile receipt.', createdAt: at(now, 6, 11), lines: [{ productId: 'p-tile-white', name: 'Glossy White Floor Tile 600x600', qty: 40 }] },
    ],
    stockMoves: [
      { id: 'mov-1', tenantId: 't-takshi', productId: 'p-organza', type: 'ADJUST', delta: -1, branchId: 'b-takshi-main', reason: 'Demo count correction', createdAt: at(now, 2, 15) },
      { id: 'mov-2', tenantId: 't-takshi', productId: 'p-cotton', type: 'TRANSFER', delta: 2, fromBranchId: 'b-takshi-main', toBranchId: 'b-takshi-city', reason: 'Demo transfer to the showroom', createdAt: at(now, 5, 16) },
      { id: 'mov-3', tenantId: 't-fresh', productId: 'p-charger', type: 'ADJUST', delta: -2, branchId: 'b-fresh', reason: 'Demo damaged units', createdAt: at(now, 3, 13) },
      { id: 'mov-4', tenantId: 't-fresh', productId: 'p-parle', type: 'TRANSFER', delta: 10, fromBranchId: 'b-fresh', toBranchId: 'b-fresh-east', reason: 'Demo transfer to Koregaon Park', createdAt: at(now, 2, 17) },
    ],
    heldBills: [],
    invitations: [{
      id: 'inv-demo',
      tenantId: 't-takshi',
      email: 'new.cashier@demo.takshi.test',
      role: 'CASHIER',
      branchIds: ['b-takshi-main'],
      token: 'demo-invite-token',
      status: 'PENDING',
      createdAt: at(now, 1, 9),
    }],
    resetTokens: [],
    tickets: [
      { id: 'tk1', tenantId: 't-takshi', subject: 'Need a second showroom register', status: 'OPEN', priority: 'Normal', createdAt: at(now, 2, 10), body: 'City Showroom wants UPI enabled on the existing register.' },
      { id: 'tk2', tenantId: 't-fresh', subject: 'Trial question about barcode labels', status: 'PENDING', priority: 'Low', createdAt: at(now, 4, 15), body: 'How do we print shelf labels for grocery?' },
    ],
    audit: [
      { id: 'aud-seed', createdAt: at(now, 0, 8), actor: 'system', action: 'demo.seeded', entityType: 'platform', summary: 'Demo dataset loaded' },
    ],
    invoiceSeq: { 't-takshi': 1049, 't-fresh': 880, 't-royal': 220 },
    platformSettings: {
      companyName: 'Innosify POS',
      supportEmail: 'support@demo.innosify.test',
      website: 'https://demo.innosify.test',
    },
  };
}

const REQUIRED_ACCOUNT_IDS = ['u-super', 'u-takshi', 'u-manager', 'u-cashier', 'u-inventory'];

/** Add any missing built-in accounts without replacing saved businesses or signups. */
export function ensureRequiredAccounts(state) {
  if (!state?.users) return state;
  const seed = createSeed();
  let users = state.users;
  let memberships = state.memberships;
  let changed = false;

  REQUIRED_ACCOUNT_IDS.forEach((id) => {
    const seeded = seed.users.find((user) => user.id === id);
    if (!seeded) return;
    const existing = users.find((user) => user.id === id || user.email === seeded.email);
    if (!existing) {
      users = [...users, seeded];
      memberships = [
        ...memberships,
        ...seed.memberships.filter((item) => item.userId === id && !memberships.some((current) => current.id === item.id)),
      ];
      changed = true;
    }
  });

  const superAdmin = users.find((user) => user.id === 'u-super');
  if (superAdmin && superAdmin.platformRole !== 'SUPER_ADMIN') {
    users = users.map((user) => user.id === 'u-super' ? { ...user, platformRole: 'SUPER_ADMIN' } : user);
    changed = true;
  }

  if (!changed) return state;
  return { ...state, users, memberships };
}

function product(id, tenantId, name, sku, barcode, category, brand, price, costPrice, taxRate, stockByBranch, attributes) {
  const stock = Object.values(stockByBranch).reduce((sum, qty) => sum + qty, 0);
  const lowStock = tenantId === 't-fresh' ? 12 : 4;
  return {
    id,
    tenantId,
    name,
    sku,
    barcode,
    category,
    brand,
    price,
    costPrice,
    taxRate,
    stock,
    lowStock,
    stockByBranch,
    status: stock <= 0 ? 'Out of Stock' : stock <= lowStock ? 'Low Stock' : 'Active',
    returnable: true,
    unit: attributes.unit || (tenantId === 't-fresh' ? 'Pack' : 'Nos (Pieces)'),
    attributes,
    createdDate: 'Oct 1, 2026',
    gradient: 'from-violet-600 to-purple-800',
  };
}
