# Innosify POS — frontend demo

React 18 + Vite storefront and retail workspace for a multi-tenant POS. This build runs entirely in the browser with sample businesses. It does not call the NestJS API, and it does not process payments.

## Run

```bash
npm install
npm run dev
```

The dev server uses port 4000. Open `http://localhost:4000`.

```bash
npm test
npm run build
```

`VITE_DEMO_MODE=true` is the default. See `.env.example`.

## Demo sign-in

Customer login: `/login`  
Platform login: `/platform/login`

Every demo password is `Demo@12345`. Accounts, landing routes, and the sample invitation token are listed in [DEMO_LOGIN_CREDENTIALS.md](DEMO_LOGIN_CREDENTIALS.md).

Authentication and UPI, card, and refund actions are simulated. The Super Admin account is only on the platform login page.

## What is in the UI

- Public site for Innosify POS
- My Businesses, onboarding, and per-business subscriptions
- Retail billing, inventory, customers, staff, registers, and reports
- A separate Super Admin portal

Takshi Silks, Fresh Mart, and Royal Tiles are separate sample tenants. Switching businesses changes branding and data.

Reset the sample data from retail Settings or platform Settings if a session has changed stock or plans.

## Docs

- [FRONTEND_IMPLEMENTATION_STATUS.md](FRONTEND_IMPLEMENTATION_STATUS.md) — what works, what was tested, what is still mock
- [SAAS_UI_ARCHITECTURE.md](SAAS_UI_ARCHITECTURE.md) — routing, tenancy, permissions, persistence
- [ARCHITECTURE.md](ARCHITECTURE.md) — earlier retail shell notes

The NestJS backend lives outside this folder and is not wired up.
