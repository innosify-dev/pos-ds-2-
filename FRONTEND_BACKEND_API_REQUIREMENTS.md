# Frontend backend API requirements

Preparation only. The live app still reads and writes the browser demo store (`src/services/demo`). Do not treat these paths as implemented NestJS routes.

Scope on every tenant call: authenticated user, `businessId` (tenant), and `branchId` where the screen is branch-scoped. Platform calls use a separate session and must not share the shop session cookie.

Money is integer paise in the demo engine. Responses should keep paise (or a documented decimal) and the same quote the POS already shows: line price, line discount, bill discount, one GST rate per line, tax, total. The UI does not split CGST, SGST, and IGST.

| Module | Screen | Action | Method and path | Request | Response | Roles | Demo today |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Auth | `/login`, `/signup` | Sign up, sign in, forgot password | `POST /auth/signup`, `POST /auth/login`, `POST /auth/password/forgot` | email, password, name | user, tenant memberships, session | public | `user.signup`, `user.password`; login is local demo auth |
| Auth | `/platform/login` | Platform sign-in | `POST /platform/auth/login` | email, password | platform session | platform super admin | separate `innosify.session.platform` |
| Auth | header | Log out | `POST /auth/logout` | session | empty | any signed-in role | clears the matching browser session |
| Workspace | `/app/businesses` | List and switch businesses | `GET /me/businesses` | — | memberships, plan, branch ids | owner and staff with a membership | in-memory memberships |
| Workspace | `/app/businesses/new` | Create business | `POST /businesses` | name, type, branch | tenant, owner membership | authenticated user | `business.create` |
| Workspace | `/app/profile` | Update profile | `PATCH /me` | name, phone | user | any tenant user | `user.profile` |
| Catalog | `/retail/products` | List, save, archive | `GET/POST /products`, `PATCH/DELETE /products/:id` | name, sku, barcode, price, taxRate, variants, stock | product | `products.manage` / view | `product.save`, `product.delete` |
| Catalog | product form, labels | Assign internal barcode | server sequence | blank barcode | `INN` + 8 digits | `products.manage` | `assignMissingBarcodes` in the browser; not GS1 |
| Catalog | `/retail/categories`, `/retail/brands` | Save, delete | `POST/PATCH/DELETE /categories`, `/brands` | name | record | `products.manage` | `category.*`, `brand.*` |
| Inventory | `/retail/inventory` | Adjust, transfer | `POST /stock/adjust`, `POST /stock/transfer` | product, branch, qty, reason | stock by branch | `inventory.manage` | `stock.adjust`, `stock.transfer` |
| Inventory | `/retail/purchases` | Receive purchase | `POST /purchases` | supplier, lines, branch | purchase, stock increase once | `purchases.manage` | `purchase.create`; historical rows must not replay |
| Inventory | purchases | Purchase return | `POST /purchases/:id/returns` | lines, qty | purchase return, stock decrease once | `purchases.manage` | `purchase.return` |
| Inventory | `/retail/suppliers` | Save supplier | `POST/PATCH /suppliers` | name, phone | supplier | `purchases.manage` | `supplier.save` |
| POS | `/retail/pos` | Quote cart | `POST /sales/quote` | lines, discounts, loyalty points | subtotal, discount, tax, total in paise | `pos.use` | `quoteCart` |
| POS | `/retail/pos` | Create sale | `POST /sales` | quote id, registerId, payments, idempotency key | invoice, stock reduced once | `pos.use` | `sale.create`; register must be Open |
| POS | `/retail/pos` | Hold and resume | `POST/DELETE /sales/holds` | cart | held bill | `pos.use` | `sale.hold` |
| POS | checkout | UPI intent | `POST /payments/upi/intents` | amount, sale draft | `upi://` URI only when merchant VPA is stored server-side | `pos.use` | QR is display-only; confirm is simulated |
| POS | checkout | Card terminal | `POST /payments/terminal/initiate`, `GET /payments/:id` | amount, register, idempotency key | provider status | `pos.use` | `terminalContract` is `connected: false` |
| Sales | `/retail/sales` | List and reprint | `GET /sales` | branch, date | sales | `sales.view` | filtered demo sales |
| Returns | `/retail/returns` | Return lines | `POST /sales/:id/returns` | line index, qty | return, stock restored once | `returns.create` | `return.create` |
| Returns | returns | Exchange | `POST /sales/:id/exchanges` | returned lines, replacement product | exchange, stock both ways, difference | `returns.create` | `exchange.create` |
| Refunds | `/retail/refunds` | Refund or store credit | `POST /returns/:id/refunds`, `POST /store-credit` | amount, method | simulated refund or credit ledger | `returns.create` | `refund.create`, `credit.issue` |
| Customers | `/retail/customers` | Save, archive | `POST/PATCH /customers` | name, phone, email, gstin | customer in this business | `customers.create` / `customers.manage` | `customer.save` |
| Loyalty | settings | Program and redeem | `PUT /loyalty`, applied inside sale | earn rate, redeem value | program, ledger | `loyalty.configure`, `pos.use` | `loyalty.configure`; points are demo counters |
| Registers | `/retail/registers` | Open, cash in/out, close | `POST /registers/:id/open`, `/cash`, `/close` | opening or counted cash, reason | session, expected cash, variance | `registers.manage`; cashier may open the assigned register from the counter | `register.open`, `register.cash`, `register.close` |
| Expenses | registers, branch dashboard | Record expense | `POST /expenses` | amount, category, method, register | expense; cash method is one cash-out | `registers.manage` | `expense.save` |
| Team | `/retail/team` | Invite, update role | `POST /staff/invitations`, `PATCH /memberships/:id` | email, role, branch | invitation | `team.manage` | `staff.invite`, `staff.update` |
| Branches | `/retail/branches` | Save branch | `POST/PATCH /branches` | name, address, hours | branch | `branches.manage` | `branch.save` |
| Reports | `/retail/analytics` | Sales report | `GET /reports/sales` | branch, range | totals from stored sales, CSV | `analytics.view` | `analyticsModel`; FREE plan hides the screen |
| Settings | `/retail/settings` | Business profile, tax, receipt, UPI display name | `PATCH /businesses/:id` | profile, tax, upiVpa, upiPayeeName, logo | tenant | `settings.manage` | `tenant.update`; logo is a data URL |
| Subscription | `/retail/subscription` | Read usage, simulate plan | `GET /subscriptions/current` | — | plan, limits, trial end | `subscription.view` | `subscription.assign` does not charge a card |
| Platform | `/platform/*` | Tenants, plans, subscriptions, tickets, audit | `GET/PATCH /platform/...` | platform filters | cross-tenant lists | platform super admin only | `plan.save`, `tenant.suspend`, `ticket.*` |

## Backend dependencies

- Identity and password storage. Demo passwords stay in the seed only.
- Tenant and branch authorization on every query. Frontend guards are not security.
- Idempotency for sales, refunds, stock, and cash movements.
- Payment provider for UPI collect, dynamic QR confirmation, and card terminals. The browser must not store card numbers, CVV, PIN, or provider secrets.
- Product barcode uniqueness per business. Internal `INN` codes are not retail GS1 barcodes.
- File storage for logos, replacing data URLs.
- Register and expense records as operational history, not a general ledger, until accounting is specified.
