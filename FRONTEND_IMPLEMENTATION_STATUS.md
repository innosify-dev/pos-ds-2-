# Frontend implementation status

Demo-only React frontend. The NestJS server was not modified and is not called.

`npm run build` succeeded (Vite 6). `npm test` (`vitest run`) passed: 5 tests in `src/services/demo/demo.logic.test.js`.

## Completed screens

Public: `/`, `/features`, `/pricing`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/accept-invitation`, `/unauthorized`, 404.

Workspace: `/app/businesses`, `/app/businesses/new` (10-step onboarding), `/app/account`, `/app/subscriptions`.

Retail: dashboard, POS billing, products, categories, brands, stock, purchases, suppliers, registers, branches, sales, returns, refunds, customers, team, analytics, subscription, settings.

Platform: `/platform/login`, dashboard, tenants, tenant detail, plans, subscriptions, customers, payments, audit logs, support, settings.

## Working demo flows

- Separate tenant and platform sessions in `localStorage` (`innosify.session.tenant`, `innosify.session.platform`).
- Role landing paths and route guards. A cashier who opens `/retail/settings` is sent to `/unauthorized`.
- Multi-business picker. Switching a business changes the name, catalog, staff, and branch list.
- Platform plan assignment updates the business card and the tenant subscription screen.
- POS: barcode or SKU plus Enter, demo scan buttons, cash / UPI / card / split. UPI uses a non-payable `innosify-demo://` QR and requires **Simulate success** before confirm. Receipts say the payment was not collected.
- A completed sale writes an invoice, deducts branch stock, and remains after refresh (IndexedDB, with `localStorage` fallback).
- Returns cannot exceed sold quantity. Refunds cannot exceed the returned value. Restock puts quantity back.
- Free-plan register creation shows the plan-limit message and does not create the register.
- Team invites create a demo user in this browser. Settings save the active business profile, GST, receipt footer, and hours onto that tenant.

## Mock services

`src/services/demo/` is the store: `applyDemoAction`, seed, IndexedDB persistence, metrics. Screens call `useDemo().dispatch`. `src/services/api/index.js` re-exports the same demo functions and does not call HTTP.

Money is integer paise via `quoteCart`.

## Browser checks performed

On `http://localhost:4000` (13 Oct 2026):

1. Takshi owner login opened the Takshi Silks dashboard with saree sales, not grocery or tiles.
2. Multi-business owner opened Fresh Mart (grocery, Downtown) and Royal Tiles (floor tile, Depot) as separate catalogs.
3. Super Admin at `/platform/login` changed Fresh Mart to Enterprise; the business card showed Enterprise. The plan was then set back to Starter.
4. Cashier landed on `/retail/pos` with billing, sales, returns, and customers only. `/retail/settings` showed Access denied.
5. Typing barcode `8901000000059` and Enter added Organza Saree. Cash checkout created invoice `TAK-1050` and dropped Main Store stock from 2 to 1.
6. Returning that line restocked it to 2. The owner recorded a simulated cash refund of ₹5,562.00. Refresh kept the refund.
7. Downgrading Takshi to Free showed usage over the limit (registers 3 / 1). Saving a new register stayed on the form and showed the Free plan limit message. The plan was set back to Professional.
8. `/`, `/login`, and `/signup` rendered. Customer login cards do not include the Super Admin.

Physical barcode scanners and printers were not used. USB scanner behavior is keyboard input plus Enter only.

## Not exercised in the browser

- The full 10-step signup and new-business wizard was not clicked through. The screens and `business.create` action exist.
- Forgot-password, reset-password, and accept-invitation pages were not clicked through.
- Every platform module (tickets, audit, plan editor) was not clicked. Subscription assign was.
- Product-form label art is a drawn preview. CODE128 images are rendered on the stock screen with JsBarcode.

## Backend integration pending

No catalog, sales, inventory, customer, or payment APIs exist on the current NestJS phase. Auth, tenants, branding, branches, registers, members, plans, subscriptions, and audit on the server are unused by this UI. Demo roles include Business Admin, Branch Manager, and Inventory Staff, which the API role enum does not. Demo guards must be replaced by API authorization.

## Remaining gaps

- Dashboard KPI numbers count up from 0, so a snapshot taken immediately shows 0 while the hint already has the real total.
- Loyalty points are a display formula, not a ledger updated by each sale.
- Historical seed sales do not deduct stock; `stockByBranch` is the current balance. New sales do deduct.
- “Today” metrics follow the calendar date. After midnight, seed sales from the previous day leave today’s total at 0 until a new sale or a demo reset.
- Label templates and appearance preferences use `innosify.pref.<tenantId>.*`. Older `takshi-*` keys are no longer written.
- Notifications and the top-bar search do not filter data.
- The production bundle is one large JavaScript file (about 609 kB minified).

## Known limitations

Demo login, plan changes, UPI, card, and refunds are simulated. Nothing here verifies a payment or protects tenant data. Reset demo data from Settings if a previous session changed plans or stock.
