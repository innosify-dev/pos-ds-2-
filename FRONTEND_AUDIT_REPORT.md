# Innosify POS — Frontend Audit Report (Task 14)

Date: 13 October 2026  
Scope: `pos-ds-2-` only. Backend (`server/`), `New folder/`, and `ok/` were not modified.  
Checkpoint before edits: git stash object `0f28807347c84bde015d78524a81a12e329c08ed` (working tree was not stashed or reset).

## A. Executive Summary

The retail frontend is a working demo of a multi-tenant POS. Public pages, two login entries, five roles, billing, inventory, branches, registers, team, reports, settings, branding, and platform administration all have real screens wired through `src/app/router.jsx`. Data lives in a browser demo store (`src/services/demo/`), not the NestJS API.

**Strengths**

- One billing screen (`/retail/pos`) is shared by every role that has `pos.use`, including Owner/Admin.
- Role matrix and route guards are explicit in `src/services/demo/permissions.js` and `src/app/guards.jsx`.
- Sales, stock, dashboard, and reports read the same demo sales and stock records.
- Checkout blocks duplicate submit, deducts stock only after a confirmed sale, and labels UPI, QR, and card results as simulated.
- Product barcodes on the POS cart use JsBarcode CODE128.

**Critical risks**

- Payments, subscriptions, and password reset are simulated. A button or QR panel is not a verified payment.
- Frontend guards are not tenant security. The API must enforce business and branch scope.
- Shelf-label barcode and QR graphics in `LabelGraphics.jsx` are decorative bit patterns, not machine-readable codes.
- `src/modules/retail/navigation/routes.jsx` is an older route list that omits billing, stock, purchases, suppliers, branches, and subscription. The live app does not mount it. `getActiveModuleRoutes()` has no callers.
- The production bundle is one ~800 kB JavaScript file.
- There is no lint script.

**Release readiness**

Ready for a guided product demo and for planning Tasks 15–18. Not ready to take real money, print scannable shelf labels, or rely on the browser for tenant isolation.

## B. Route Inventory

Live source: `src/app/router.jsx`. Status reflects code inspection plus browser checks called out in section G.

| Route | Screen | Authorized roles | Status |
| --- | --- | --- | --- |
| `/` | Landing | Public | COMPLETE |
| `/features` | Features | Public | COMPLETE |
| `/pricing` | Pricing | Public | COMPLETE |
| `/login` | Business login | Public | COMPLETE |
| `/signup` | Signup | Public | PARTIAL — demo account only |
| `/forgot-password` | Forgot password | Public | BACKEND DEPENDENCY |
| `/reset-password` | Reset password | Public | BACKEND DEPENDENCY |
| `/accept-invitation` | Accept invite | Public | PARTIAL — demo password flow |
| `/app/businesses` | My businesses | Signed-in tenant | COMPLETE |
| `/app/businesses/new` | Onboarding | Signed-in tenant | COMPLETE in demo |
| `/app/profile` | Profile | Signed-in tenant | COMPLETE in demo |
| `/app/account` | Redirect to profile | Signed-in tenant | COMPLETE |
| `/app/settings/account` | Account settings | Signed-in tenant | PARTIAL |
| `/app/subscriptions` | Workspace plan list | Signed-in tenant | PARTIAL |
| `/retail/dashboard` | Owner/manager dashboard | `dashboard.view` | COMPLETE in demo |
| `/retail/counter` | Cashier desk | `pos.use` (cashier home) | COMPLETE |
| `/retail/stockroom` | Inventory desk | `inventory.manage` | COMPLETE |
| `/retail/pos` | Billing | `pos.use` | PARTIAL — demo payments |
| `/retail/products` | Products | `products.view` | COMPLETE in demo |
| `/retail/products/new` | New product | `products.view` (actions need manage) | PARTIAL |
| `/retail/products/:productId/edit` | Edit product | same | PARTIAL |
| `/retail/categories` | Categories | `products.view` | COMPLETE in demo |
| `/retail/brands` | Brands | `products.view` | COMPLETE in demo |
| `/retail/inventory` | Stock | `inventory.manage` | PARTIAL |
| `/retail/purchases` | Purchases | `purchases.manage` | PARTIAL |
| `/retail/suppliers` | Suppliers | `purchases.manage` | COMPLETE in demo |
| `/retail/registers` | Registers | `registers.manage` | PARTIAL |
| `/retail/registers/new` | New register | `registers.manage` | COMPLETE in demo |
| `/retail/registers/:registerId/edit` | Edit register | `registers.manage` | COMPLETE in demo |
| `/retail/branches` | Branches | `branches.view` | COMPLETE in demo |
| `/retail/sales` | Sales history | `sales.view` | COMPLETE in demo |
| `/retail/returns` | Returns | `returns.create` | PARTIAL |
| `/retail/refunds` | Refunds | `refunds.manage` | PARTIAL |
| `/retail/customers` | Customers | `customers.view` | PARTIAL |
| `/retail/team` | Team | `team.view` | COMPLETE in demo |
| `/retail/analytics` | Reports | `analytics.view` | PARTIAL |
| `/retail/subscription` | Subscription | `subscription.view` | BACKEND DEPENDENCY |
| `/retail/settings` | Business settings | `settings.manage` | COMPLETE in demo |
| `/platform/login` | Super Admin login | Public | COMPLETE |
| `/platform/dashboard` | Platform dashboard | Platform session | COMPLETE in demo |
| `/platform/tenants` | Business directory | Platform session | COMPLETE in demo |
| `/platform/tenants/:tenantId` | Business detail | Platform session | PARTIAL |
| `/platform/plans` | Plans | Platform session | COMPLETE in demo |
| `/platform/subscriptions` | Subscriptions | Platform session | BACKEND DEPENDENCY |
| `/platform/customers` | Platform users | Platform session | PARTIAL |
| `/platform/payments` | Payments | Platform session | BACKEND DEPENDENCY |
| `/platform/audit-logs` | Audit logs | Platform session | PARTIAL |
| `/platform/support` | Support | Platform session | PARTIAL |
| `/platform/settings` | Platform settings | Platform session | PARTIAL |
| `/unauthorized` | Access denied | Any | COMPLETE |
| `*` | Not found | Any | COMPLETE |

Owner and Business Admin share the label Owner/Admin. Owner has `*`. Business Admin has the listed business permissions, including `pos.use`, `products.manage`, `inventory.manage`, `analytics.view`, `settings.manage`, and `subscription.view`. They use the same screens. Cashiers land on `/retail/counter`. Inventory staff land on `/retail/stockroom`. Branch managers land on `/retail/dashboard` and cannot open settings. Platform routes require `innosify.session.platform`.

## C. Feature Matrix

| Module | Feature | Status | Evidence | Issues | Priority |
| --- | --- | --- | --- | --- | --- |
| Public | Home, features, pricing | COMPLETE | `LandingScreen.jsx`, `FeaturesScreen.jsx`, `PricingScreen.jsx` | Plans are monthly demo catalog | P2 |
| Auth | Business login and demo role cards | COMPLETE | `AuthScreens.jsx`, `DemoAccess.jsx` | Demo only when `VITE_DEMO_MODE` is exactly `true` | P0 |
| Auth | Platform login | COMPLETE | `PlatformScreens.jsx`, `RequirePlatform` | Separate session key | P0 |
| Auth | Logout | COMPLETE | `AuthProvider.jsx`, `session.js` | Clears the session key. Demo store remains | P1 |
| Auth | Password reset and Google | BACKEND DEPENDENCY | Auth screens | Google is disabled. Reset is not a mail provider | P1 |
| Owner | Dashboard, businesses, branches, team, settings | COMPLETE | dashboard, workspace, branches, team, settings | Hours are tenant-level | P1 |
| Owner | Same billing, stock, sales, customers as staff | COMPLETE | `ROLE_PERMISSIONS.OWNER = ['*']`, shared routes | No duplicate owner modules | P0 |
| POS | Search, barcode field, cart, qty, discount, GST | COMPLETE | `PosScreen.jsx`, `quoteCart` | Single GST total. No CGST/SGST/IGST | P0 |
| POS | Cash, UPI, UPI QR, debit, credit, split | PARTIAL | `PosScreen.jsx` `pay()` | Demo confirmation is not a gateway result. QR panel has no payable image | P0 |
| POS | Hold and resume | COMPLETE | `sale.hold` in PosScreen | Browser demo store only | P1 |
| POS | Receipt and print | PARTIAL | receipt markup, `window.print()` | Print dialog not verified. Thermal claim is CSS only | P1 |
| POS | Product QR lookup | MISSING | POS lookup is barcode/SKU text | — | P1 |
| Inventory | Products, categories, brands | COMPLETE | product, category, brand screens | — | P0 |
| Inventory | Variants | PARTIAL | `VariantsSection.jsx`, `ProductFormScreen.jsx` | Not the POS sellable unit | P1 |
| Inventory | Stock, purchases, suppliers | PARTIAL | `RetailFlows.jsx` | Purchases have no rupee totals. No purchase returns | P1 |
| Inventory | Stock transfer and adjustment | PARTIAL | inventory flow | Confirm against engine before calling it complete | P1 |
| Labels | CODE128 on POS | COMPLETE | JsBarcode in `PosScreen.jsx` | — | P0 |
| Labels | Shelf label barcode and QR | BROKEN | `LabelGraphics.jsx` `FakeBarcode`, `FakeQr` | Decorative. Not scannable | P0 |
| Labels | Print preview and template editor | PARTIAL | `PrintPreviewModal.jsx`, `TemplateEditorModal.jsx` | Preview uses the fake graphics | P0 |
| Customers | List, add, purchase history | PARTIAL | `RetailFlows.jsx` `CustomersScreen` | No edit form. Loyalty is display-only | P0 |
| Customers | Select during billing | COMPLETE | POS customer select | — | P0 |
| Loyalty / store credit | — | MISSING | Seed has `loyaltyPoints` and `balancePaise` | Not redeemed at checkout | P1 |
| Sales | History and reprint | COMPLETE | `SalesScreen` in `RetailFlows.jsx` | Browser-checked on Takshi | P0 |
| Returns | Invoice return and restock | PARTIAL | `ReturnsScreen` | No exchange workflow | P0 |
| Refunds | Record refund | PARTIAL | `RefundsScreen` | Not a payment reversal | P0 |
| Reports | Sales, inventory, tax, CSV | PARTIAL | `AnalyticsScreen.jsx`, `metrics.js` | Sample GST only. No PDF. No profit report | P1 |
| Registers | Open, close, cash counted | PARTIAL | `RegistersScreen.jsx` | Close is not a full reconciliation | P1 |
| Expenses, offline, quotations, promotions | — | MISSING | No screens | Recommendations, not current defects | P1–P2 |
| Platform | Directory, plans, subscriptions, payments | PARTIAL / BACKEND DEPENDENCY | `PlatformScreens.jsx` | Plan edits and charges are demo | P0 |
| Demo data | Takshi, Fresh Mart, Royal Tiles | COMPLETE | `seed.js` SEED_VERSION 2 | Do not add a second demo store | P0 |

## D. UI/UX Issues

| Screen | Problem | Recommended fix | Severity |
| --- | --- | --- | --- |
| Product label preview | Barcode and QR look like codes but are random cells | Render CODE128 and a real QR from the product barcode in a later task | High |
| Sales history | Plain table, weak on small screens compared with reports | Reuse the reports mobile card pattern | Medium |
| Billing | Fixed Take payment bar can cover the sidebar button below `xl` | Keep the bar as the mobile primary action | Low |
| Reports and settings | Dense but consistent | Keep. Do not redesign in this pass | — |
| Dashboard | KPI count-up starts at 0 | Wait before reading numbers in tests | Low |
| Bundle | Single large JS chunk and large home photos | Code-split public vs retail after the API lands | Medium |

Sales at 375px did not overflow the document (`scrollWidth` 375). Settings, reports, and subscription were checked the same way in the previous task.

## E. Functional Bugs

| Reproduction | Expected | Actual | File | Fix status |
| --- | --- | --- | --- | --- |
| Import sales, returns, refunds, or customers from `screens/*/…` or `screens/index.js` | Same screens as the live router | Those files rendered `ModulePlaceholder` | `screens/sales`, `returns`, `refunds`, `customers` | Fixed. They re-export `RetailFlows.jsx`. The unused `routes.jsx` now imports the real screens. |
| Reprint a sale | Quantity marker is a multiplication sign | The line used a mis-encoded character | `RetailFlows.jsx` | Fixed |
| Confirm UPI/QR/card by clicking Save | Gateway success | Sale is stored only after an explicit demo result, and the receipt says the payment was not verified | `PosScreen.jsx` | Working as designed. Remains a backend dependency |
| Print a product label | Scanner reads the code | Label art is not a barcode | `LabelGraphics.jsx` | Not fixed. High-risk label rewrite |

## F. Security and Permissions

**Role access**

- Five roles: Platform Super Admin, Owner/Admin (`OWNER` and `BUSINESS_ADMIN` share that label), Branch Head, Cashier, and Inventory Staff. Two logins: `/login` and `/platform/login`.
- Owner `*` can open billing, products, labels, stock, purchases, registers, branches, team, sales, reports, settings, and subscription without a cashier login.
- Cashier: billing, sales, returns, customers. Direct `/retail/settings` and `/retail/analytics` go to `/unauthorized`.
- Inventory staff: products and stock. `/retail/pos` is denied.
- Branch manager: dashboard and operations, no `settings.manage`.
- Platform screens redirect to `/platform/login` without a platform session. A tenant session does not grant them.

**Business and branch isolation (frontend only)**

- Active tenant comes from the tenant session. Sales and customer queries filter `tenantId` and the branches the membership can see.
- Switching business should drop the previous catalog because queries are tenant-scoped. Cached React state still needs a manual check on every new screen.
- Logout removes the session key. IndexedDB demo data stays so the next demo login can resume. Reset Demo Data restores `createSeed()` and does not clear session keys.
- CSV export downloads whatever the current filter already shows. It is not an extra privilege, and it is not an API authorization check.

**Frontend limitations**

Route guards and demo-store filters can be bypassed in the browser. This audit does **not** verify backend tenant security.

**Backend requirements**

- Authorize every query by business, branch, and permission.
- Confirm UPI, QR, and card only from the payment provider.
- Isolate demo tenants from production data.
- Do not trust client stock, tax, or price totals.

## G. Testing

**Commands**

- `npm test` — 1 file, 11 tests passed (`vitest` 5.0.4).
- `npm run build` — succeeded. Warning: `dist/assets/index-CIXmGWqv.js` is 799.45 kB (gzip 209.36 kB).
- Lint: no `lint` script in `package.json`. Not run.

**Browser**

Dev server `http://localhost:4000`. Owner session for Takshi Silks (Lakshmi Narayan).

- `/retail/customers` shows Divya Raman, search, and save form. Not a placeholder.
- `/retail/sales` shows invoice rows and Reprint. Not a placeholder.
- Sales page at 375px: no horizontal document overflow.

**Unverified this pass**

- Physical barcode scanner and the print dialog.
- A completed cash-with-change sale and a completed split sale in this session (cash tender validation and simulated UPI QR were checked in the payment task).
- `VITE_DEMO_MODE` unset or `false`.
- Every route at 768, 1024, and 1440 in this pass.
- Keyboard focus traps in every dialog.
- Backend APIs.

## H. Remaining Work

**P0**

- Payment provider confirmation for UPI, UPI QR, debit, and credit. Keep the demo path labeled simulated.
- Machine-readable product barcode and QR on labels, including single and bulk print.
- Customer edit, and a clear decision on loyalty and store credit.
- Returns and refunds that stay consistent with stock and reports once the API exists.
- Server-side permission and tenant checks. Do not weaken the current matrix.

**P1**

- Quotations, promotions, stock transfers as a first-class flow, purchase returns, cash reconciliation, offline billing.
- Exchange as its own flow. Returns already accept a reason such as size exchange.
- Profit reporting only where `costPrice` is present.
- PDF or Excel export only when a real generator exists. CSV already works on reports.
- Align or remove the unused `navigation/routes.jsx` so it cannot be mounted without billing and stock.

**P2**

- Keyboard shortcuts beyond the new Ctrl+K screen finder.
- Notifications beyond existing demo alerts.
- Deeper analytics, audit history, and touch-sized POS targets.
- Route-level code splitting.

**Backend dependencies**

Auth mail, Google, invitations, live payments, subscriptions, GST returns, persistence, and printer drivers.

## I. Recommended Next Tasks

1. NestJS session and permission middleware that mirrors `ROLE_PERMISSIONS` and scopes every query by business and branch.
2. Persist the existing sale, stock, customer, and return actions. Keep `quoteCart` and stock-after-confirm behavior.
3. Payment provider for UPI and cards. Leave cash as a recorded tender.
4. Replace `FakeBarcode` and `FakeQr` with CODE128 and a real QR, then verify a scan.
5. Customer edit and loyalty only after the data model is agreed.
6. Delete or regenerate `navigation/routes.jsx` from `router.jsx` so the module registry cannot ship a shorter app.
7. Split the public site from the retail bundle.

Do not rebuild billing, reports, settings, or role dashboards that already work.
