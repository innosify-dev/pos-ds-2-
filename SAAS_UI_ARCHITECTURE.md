# SaaS UI architecture

This document describes the demo frontend in `pos-ds-2-`. `ARCHITECTURE.md` still describes the earlier retail shell and was left unchanged.

## Stack

React 18, JSX, Vite 6, React Router 6, Tailwind CSS. Not Next.js and not TypeScript. Tauri 2 remains in the project and is not required for the browser demo.

`VITE_DEMO_MODE` defaults to on. Set it to `false` only after an HTTP client replaces the mock store. `.env.example` sets `VITE_DEMO_MODE=true`.

## Routing

`src/app/router.jsx`

- Public layout: marketing and auth.
- `/app/*` requires a tenant session. Business selection does not require an active tenant.
- `/retail/*` requires a session, an active business, and a permission for that path.
- `/platform/*` uses a separate platform session. `/platform/login` is public.

Guards live in `src/app/guards.jsx`. They are demo checks. Hiding a nav item is not the boundary; the route still redirects to `/unauthorized`.

## Authentication demo

`src/core/auth/AuthProvider.jsx` calls `authenticateDemo`. Passwords are compared with the seed string `Demo@12345` in the browser. Sessions last 12 hours in two localStorage keys so a platform login does not become a shop login.

Landing rules are in `landingPath` (`src/services/demo/permissions.js`):

- Super Admin → `/platform/dashboard`
- Cashier → `/retail/pos`
- Inventory staff → `/retail/products`
- Several businesses and no preferred or last-used business → `/app/businesses`
- One business → `/retail/dashboard`

## Tenant context

`TenantProvider` reads the active business from the tenant session. Branch lists are limited to `membership.branchIds` when that list is present. Every catalog, sale, customer, and staff query filters on `tenantId`. There is no shared product list.

## Roles

`OWNER`, `BUSINESS_ADMIN`, `BRANCH_MANAGER`, `CASHIER`, `INVENTORY_STAFF`, `SUPER_ADMIN`.

`hasPermission` treats `*.manage` as satisfying the matching view permission. A cashier does not have `settings.manage` or `subscription.view`.

These codes are richer than the API (`OWNER`, `MANAGER`, `CASHIER`, `SUPER_ADMIN`). Map them during integration.

## Mock persistence

`applyDemoAction(state, action)` in `src/services/demo/engine.js` is the only writer. The singleton in `store.js` saves to IndexedDB database `innosify-pos-demo`, store `kv`, key `state`. If IndexedDB fails, it uses `localStorage` key `innosify.demo.state`. `SEED_VERSION` is 1. A version mismatch reseeds.

Onboarding drafts use `sessionStorage` key `innosify.onboarding.draft`.

`resetDemoStore` clears storage and loads `createSeed()`.

## Branding

`BrandingEffect` sets `--color-accent` and related variables from the active business and resets them on unmount. The sidebar shows the business name and logo, or the first letter of the name. Takshi Silks keeps the plum accent when that tenant is selected. Public pages use the Innosify POS name.

## Subscriptions

A subscription belongs to a business. Plans in the seed: Free, Starter (₹999), Professional (₹2,499), Enterprise (₹9,999). Prices are illustrative.

`assertLimit` blocks new branches, registers, users, and sales when the count is already at the plan limit. Suspended businesses and expired, suspended, or canceled subscriptions cannot create sales.

Analytics on the Free plan shows an upgrade message instead of charts. The route itself stays allowed for owners.

## POS modules

Billing is `/retail/pos`. `quoteCart` applies line discounts, then a proportional bill discount, then integer tax. Stock checks use the active branch. Invoice numbers are `{slug prefix}-{sequence}`.

Payments stored on a sale are marked `SIMULATED`. The UPI image encodes `innosify-demo://simulated-pay/...`, not a `upi://` link.

Returns and refunds update the same store. Reports read `dashboardModel` and `analyticsModel` from recorded sales.

Barcode values are generated in `nextBarcode` when a product is saved without one, and duplicates inside a tenant are rejected. The stock screen draws CODE128 with JsBarcode. A focused POS field treats Enter as a scan. That path was exercised with a typed code, not with a scanner.

## Backend integration plan

Keep screen dispatches behind `src/services/api`. Replace `dispatchDemo` with `fetch` to `/api/v1` when the NestJS routes exist. Do not point React at PostgreSQL.

Expected API work that this UI cannot do yet: real login and tenant selection, membership permissions, catalog and stock, sales and returns, subscription billing, and file upload for logos. Until then, leave `VITE_DEMO_MODE=true`.

## Context for later assistants

Work only inside `pos-ds-2-`. Do not edit `../server` or `../New folder`. Do not describe this demo as production authentication or as verified payments. Seed businesses are Takshi Silks (`t-takshi`), Fresh Mart (`t-fresh`), and Royal Tiles (`t-royal`).
