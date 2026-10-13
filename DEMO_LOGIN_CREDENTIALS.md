# Demo login credentials

These accounts exist only in the browser demo store. The password for every account is `Demo@12345`.

They are fictional public demo credentials. They are not production secrets, and they are not accepted by the NestJS API.

Demo authentication is simulated in the browser. It is not a security boundary.

## Customer login — `/login`

| Role | Email | Lands on |
|---|---|---|
| Business owner | `owner@demo.takshi.test` | `/retail/dashboard` for Takshi Silks |
| Business admin | `admin@demo.takshi.test` | `/retail/dashboard` for Takshi Silks |
| Branch manager | `manager@demo.takshi.test` | `/retail/dashboard` for the Main Store membership |
| Cashier | `cashier@demo.takshi.test` | `/retail/pos` |
| Inventory staff | `inventory@demo.takshi.test` | `/retail/products` |
| Multi-business owner | `owner@demo.multibiz.test` | `/app/businesses` (Takshi Silks, Fresh Mart, Royal Tiles) |
| Fresh Mart owner | `owner@demo.freshmart.test` | `/retail/dashboard` for Fresh Mart |
| Royal Tiles owner | `owner@demo.royaltiles.test` | `/retail/dashboard` for Royal Tiles |

The customer login page lists these accounts as suggestion cards. It does not list the Super Admin account.

## Platform login — `/platform/login`

| Role | Email | Lands on |
|---|---|---|
| Platform Super Admin | `superadmin@demo.innosify.test` | `/platform/dashboard` |

Signing in with that email on `/login` does not open the platform. Use `/platform/login`.

## Invitation demo

Accept-invitation page: `/accept-invitation`

Sample token already in the seed: `demo-invite-token` (cashier invitation for Takshi Silks).

## Reset

Platform settings and retail settings both include **Reset demo data**. That restores the seed, including these accounts, and drops sales created during the session.
