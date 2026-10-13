# Frontend final readiness report

Date: 13 October 2026. Project: `D:\projects\pos\pos-ds-2-`. Demo mode only. No NestJS, Prisma, or database work was started.

Checkpoint of the tree before this pass: git object `813e386129a0a1525a2fbe571e77233a0f1825fc` (created with `git stash create`; the working tree was not reset).

## 1. Route inventory

Mounted in `src/app/router.jsx`.

Public: `/`, `/features`, `/pricing`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/accept-invitation`.

Workspace: `/app/businesses`, `/app/businesses/new`, `/app/profile`, `/app/account` (redirect), `/app/settings/account`, `/app/subscriptions`.

Retail, behind tenant and business guards: `/retail`, `/retail/dashboard`, `/retail/counter`, `/retail/stockroom`, `/retail/pos`, `/retail/products`, `/retail/products/new`, `/retail/products/:productId/edit`, `/retail/categories`, `/retail/brands`, `/retail/inventory`, `/retail/purchases`, `/retail/suppliers`, `/retail/registers`, `/retail/registers/new`, `/retail/registers/:registerId/edit`, `/retail/branches`, `/retail/sales`, `/retail/returns`, `/retail/refunds`, `/retail/customers`, `/retail/team`, `/retail/analytics`, `/retail/subscription`, `/retail/settings`.

Platform: `/platform/login`, `/platform/dashboard`, `/platform/tenants`, `/platform/tenants/:tenantId`, `/platform/plans`, `/platform/subscriptions`, `/platform/customers`, `/platform/payments`, `/platform/audit-logs`, `/platform/support`, `/platform/settings`.

Other: `/unauthorized`, unmatched `*`.

`src/modules/retail/navigation/routes.jsx` is an older subset. It is not the live router.

## 2. Screens audited

Public home, features, pricing, and both logins were reviewed in code and in earlier browser passes. This pass reopened billing, refunds, and platform login.

Retail screens present in the router were read against the demo engine: dashboard desks, POS, products and labels, categories, brands, inventory, purchases, suppliers, registers, branches, sales, returns, exchanges, refunds, store credit, customers, loyalty settings, team, analytics, subscription, settings.

Platform screens are one module and are mounted. They operate on demo platform data.

There is no separate exchanges route. Exchange is a form on the returns screen.

## 3. Reproducible issues found

- Refund amount label rendered as mojibake `â‚¹` on `/retail/refunds`.
- Entry bundle was 872.50 kB (`index-CMQrjB8s.js` from the previous production build) because billing, labels, registers, settings, analytics, and platform screens were static imports. The unused route table imported the same screens again, so the first lazy split could not move them.

## 4. Issues fixed

- Refund label now reads `Refund amount (₹)`. Confirmed in the browser on `/retail/refunds` (TAK-1002 return ₹2,968.00).
- Live router lazy-loads POS, products, product form, registers, analytics, settings, and platform screens, with a “Loading…” fallback.
- The older route table uses the same dynamic imports so it no longer pins those modules into the entry chunk.

## 5. Files modified in this pass

- `src/modules/retail/screens/flows/RetailFlows.jsx`
- `src/app/router.jsx`
- `src/modules/retail/navigation/routes.jsx`
- `FRONTEND_BACKEND_API_REQUIREMENTS.md` (new)
- `FRONTEND_FINAL_READINESS_REPORT.md` (new)

## 6. Existing features preserved

Role matrix, two login sessions, Takshi silk catalog, one-click owner membership, simulated payment labels, merchant UPI QR only when a VPA is saved, product CODE128 and product QR, register expected-cash formula, and demo persistence were left in place. No seed version bump. No demo reset. Register 01 was not closed.

## 7. Workflows tested

| Workflow | Result |
| --- | --- |
| Unit tests for cart quote, UPI intent, drawer, barcodes, register cash, customer flows | Verified working — 26 passed |
| Production build | Verified working |
| `/retail/refunds` with persisted Takshi data | Verified working — rupee label, return and refund history |
| `/retail/pos` after the lazy chunk | Verified working — billing shell, barcode field, sample codes |
| POS at 375px | Verified working — no horizontal document overflow; Take payment still present |
| `/platform/login` lazy chunk | Verified working — email field and Enter platform |
| Cash close, new cash sale, physical scan, physical print, live UPI, live card | Not verified this pass |
| `VITE_DEMO_MODE=false` | Not verified |

Earlier passes in this project already exercised owner demo login, a simulated cash sale, stock drop, cashier and inventory route blocks, and register expected cash. Those flows were not repeated here so the open demo register and saved invoices stayed intact.

## 8. Test results

`npm test` (Vitest 5.0.4): 5 files, 26 tests, all passed.

There is no lint script. Lint was not run.

## 9. Build result

`npm run build` (Vite 6.4.3): succeeded. Chunk-size warning remains on the entry file.

## 10. Bundle size

| Build | Entry JS |
| --- | --- |
| Before this pass | 872.50 kB (`index-CMQrjB8s.js`) |
| After | 586.58 kB (`index-PNwPUi0A.js`), gzip 160.80 kB |

Split out of the entry: POS 32.84 kB, products 24.23 kB, product form 54.91 kB, registers 14.84 kB, settings 19.14 kB, analytics 19.17 kB, platform 24.23 kB, label preview 19.79 kB, plus a 93.54 kB browser chunk. CSS entry 68.77 kB.

## 11. Remaining frontend limitations

- Entry chunk is still above 500 kB. Further splits would need to pull shared demo and chart code out of the shell.
- Dashboard counters animate from zero for about a second.
- Reports are filtered demo sales plus CSV. No PDF.
- Loyalty, exchanges, purchase returns, and store credit exist in the demo engine and screens. They are browser records, not accounting entries.
- `navigation/routes.jsx` still omits POS, inventory, purchases, and branches. The live router includes them.

## 12. Backend-dependent features

Class: **Backend required**. Accounts, persisted tenants, stock, sales, registers, staff, and subscriptions. See `FRONTEND_BACKEND_API_REQUIREMENTS.md`. Frontend route guards are not tenant security.

## 13. Real payment limitations

Class: **External provider required**. Cash, UPI, UPI QR, debit, credit, and split can be recorded as `SIMULATED`. A QR is not a received payment. Integrated terminal mode stays unavailable. No card data is collected. No provider secrets are in the frontend.

## 14. Hardware testing limitations

Class: **Hardware verification required**. USB keyboard-wedge behavior is implemented as a text field plus Enter. Product QR needs a 2D wedge. No camera scanner. `window.print` is used for receipts and labels; a physical printer and scanner were not used.

## 15. Security limitations

Class: **Backend required**. Demo passwords live in the seed. Sessions are localStorage keys with a 12-hour client expiry. Any user who can open devtools can change demo state. Platform and tenant sessions are separate keys only in the browser.

## 16. Final readiness assessment

The frontend is ready for a guided demo of the supported browser workflows: public site, role logins, billing, catalog and labels, registers, returns, refunds, and settings. It is not production-ready.

| Item | Class |
| --- | --- |
| Refund rupee label | Fixed |
| Route code splitting | Fixed |
| Unit tests and production build | Verified working |
| Refunds, POS shell, platform login in the browser | Verified working |
| POS at 375px overflow | Verified working |
| Live payments and terminals | External provider required |
| Scanner and printer | Hardware verification required |
| Persistence, auth, tenant isolation | Backend required |
| Full click-through of every route in this pass | Not verified |
| Closing Register 01 and resetting demo data | Blocked — left unchanged on purpose |
