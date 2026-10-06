# Innosify POS — Frontend Architecture

Single source of truth for the React UI codebase. Read this before modifying frontend code.

## Stack

- **React** (JavaScript) — UI
- **Vite** — build tooling
- **Tailwind CSS** — styling (design tokens via CSS variables)
- **shadcn/ui** — modern React UI components (copied into `shared/`, not used as a runtime package)
- **React Router** — routing
- **Tauri** — native desktop shell (`src-tauri/`)

## Architecture Model

```
Application Core  →  Shared UI  →  Business Modules  →  Configuration
     (app/core)        (shared)         (modules)          (per-module config)
```

One codebase supports multiple business types (Retail, Restaurant, Pharmacy, etc.) without duplicating applications or mixing business UI globally.

## Project Structure

```
src/
├── main.jsx                 # React entry point
├── app/                     # Bootstrap, routing, providers, module registry
├── core/                    # Application shell (layout, theme, nav framework)
├── shared/                  # Design system — reusable across all business types
├── modules/                 # Business-specific UI (isolated per business type)
├── store/                   # Global frontend state (by responsibility)
├── services/                # External/native integration boundaries
├── hooks/                   # Global hooks only
├── utils/                   # Global utilities only (no business logic)
├── constants/               # Application-wide constants only
└── assets/                  # Global static assets (icons, fonts, images, logos)

src-tauri/                   # Tauri native layer (Rust) — separate from React UI
```

### Path Aliases

Configured in `vite.config.js` and `jsconfig.json`:

| Alias | Path |
|-------|------|
| `@` | `src/` |
| `@app` | `src/app/` |
| `@core` | `src/core/` |
| `@shared` | `src/shared/` |
| `@modules` | `src/modules/` |
| `@store` | `src/store/` |
| `@services` | `src/services/` |
| `@hooks` | `src/hooks/` |
| `@utils` | `src/utils/` |
| `@constants` | `src/constants/` |
| `@assets` | `src/assets/` |

## Folder Responsibilities

### `app/` — Application Entry & Composition

- Bootstrap (`App.jsx`, `providers.jsx`)
- Router setup (`router.jsx`)
- Module registration (`moduleRegistry.js`)
- App-level config (`config/app.config.js`)

**Must NOT contain:** business screens, business components, or business logic.

### `core/` — Application Shell

- `layout/` — `AppLayout`, `Header`, `Sidebar`, `WorkspaceShell`
- `theme/` — `ThemeProvider`, design token references
- `navigation/` — `NavigationShell` (renders nav from active module)
- `auth/` — authentication shell (future)
- `permissions/` — permission-aware UI foundation (future)

**Must NOT contain:** business-specific screens or terminology.

### `shared/` — Design System

Reusable UI for **any** business type. Prefer **shadcn/ui** primitives here for buttons, inputs, dialogs, tables, and similar modern React components.

```
shared/
├── ui/           # shadcn/ui primitives (Button, Input, Select, Card, etc.)
├── forms/        # Form fields, validation wrappers
├── tables/       # Data tables, pagination
├── dialogs/      # Modal, Drawer, ConfirmationDialog
├── feedback/     # Toast, Loading, Error, Empty states
├── navigation/   # Breadcrumb, Tabs, Stepper (UI primitives)
└── display/      # Badge, Avatar, Tag, StatusIndicator
```

**Must NOT contain:** business-specific components (e.g. `RetailProductCard`).

If a component is genuinely reusable across businesses, it belongs here. If it uses business terminology or workflow, it belongs in a module.

shadcn/ui components are owned by this codebase (copied into `shared/ui/` and adapted to design tokens). Do not import them from a third-party UI kit at call sites. Modules consume them through `@shared`, never by adding a parallel component library.

### `modules/` — Business-Specific UI

Each business type is a self-contained module:

```
modules/
├── retail/          # First implementation target
├── restaurant/      # Boundary only — implement when needed
├── pharmacy/        # Boundary only
├── services/        # Boundary only (salon/services)
└── wholesale/       # Boundary only
```

**Must NOT:** create fake pages, mock CRUD, or placeholder features for unimplemented businesses.

### Retail Module Structure

```
modules/retail/
├── config/
│   └── retail.config.js     # Module id, name, route prefix
├── navigation/
│   ├── index.js             # Navigation items for sidebar
│   └── routes.jsx           # React Router route definitions
├── screens/                 # Feature-oriented screens (e.g. products/, sales/)
├── components/              # Retail-only reusable components
├── layouts/                 # Retail-specific layout wrappers
└── index.js                 # Module export (routes, navigation, config)
```

Retail screens grow inside `screens/` by feature — not in a global `pages/` folder.

Navigation supports `primary` and `footer` item groups via `NavigationShell`.

### `store/` — Global State

Organized by responsibility:

```
store/
├── auth/           # Session, user, tokens
├── application/    # Theme, UI state, app preferences
└── business/       # Active business type, tenant context
```

Business-specific data state should live **inside the business module**, not in global store.

### `services/` — Integration Boundaries

```
services/
├── api/            # HTTP client — components never call fetch directly
├── printer/        # Printer hardware
├── barcode/        # Barcode scanner
└── desktop/        # Tauri command wrappers
```

**Layering:**

```
React Components  →  services/  →  Tauri (src-tauri/) / External APIs
```

Components and business modules must **never** import `@tauri-apps/api` directly.

### `hooks/`, `utils/`, `constants/`, `assets/`

- **`hooks/`** — global hooks only; feature hooks stay in their module/feature
- **`utils/`** — global utilities only; no business logic
- **`constants/`** — app-wide constants; business constants stay in modules
- **`assets/`** — global assets; business assets stay in modules

## Boundaries

| Layer | Contains | Must NOT contain |
|-------|----------|------------------|
| `app/` | Bootstrap, routing, module registry | Business UI |
| `core/` | Shell, theme, nav framework | Business UI |
| `shared/` | Generic design system | Business-specific UI |
| `modules/*` | Business screens, components, nav, config | Generic reusable primitives |
| `services/` | API/native wrappers | React components |
| `src-tauri/` | Rust native commands | React/business logic |

## Module Registration

1. Business module exports a definition object from `modules/<type>/index.js`:

```js
export const retailModule = {
  id: 'retail',
  name: 'Retail',
  routes: retailRoutes,       // React Router <Route> elements
  navigation: retailNavigation, // [{ label, path }]
  config: retailConfig,
};
```

2. Register in `app/moduleRegistry.js`.
3. Active business type is determined by `getActiveBusinessType()` in `app/config/app.config.js` (currently `VITE_BUSINESS_TYPE` env var, default `retail`).

Adding a new business type primarily means adding a new folder under `modules/` and registering it — no restructuring of `core`, `shared`, or `app`.

## Naming Conventions

- **Files:** PascalCase for components (`Button.jsx`), camelCase for utilities/config (`app.config.js`)
- **Folders:** lowercase, feature-oriented (`screens/products/`, not `Screens/Products/`)
- **Components:** PascalCase (`ProductList`, not `product-list`)
- **Business prefix:** only inside business modules when disambiguation is needed (`RetailPosLayout`)
- **Barrel exports:** `index.js` at folder boundaries

## Component Placement Rules

1. **Generic and reusable across businesses?** → `shared/`
2. **Specific to one business type?** → `modules/<business>/`
3. **Application shell or layout frame?** → `core/`
4. **Bootstrap or routing?** → `app/`
5. **When unsure:** prefer module ownership; promote to `shared/` only when a second business genuinely needs it

**Do NOT create:**
- Global `pages/` directory
- Global `components/` directory for business components
- Folders named `helpers`, `managers`, `handlers`, `common`, `misc`, `others`

## Design System

- **Tokens:** CSS custom properties in `assets/styles/tokens.css`
- **Tailwind:** extended in `tailwind.config.js` to reference token variables (includes shadcn semantic aliases such as `primary` / `destructive` mapped to the same tokens)
- **shadcn/ui:** source of modern React UI primitives; copied into `shared/ui/` (and related `shared/` folders) and styled with Tailwind + design tokens
- **shadcn CLI:** `components.json` — JavaScript, output path `shared/ui/`. Add a primitive with `npx shadcn@latest add <component>`, then restyle to tokens if needed. Do **not** create `src/components/`
- **Theme:** `core/theme/ThemeProvider.jsx` toggles `light`/`dark` class on `<html>`; both modes resolve to the same warm Takshi Silks tokens (no dark-mode styling)
- **Global styles:** `assets/styles/global.css` (body uses raw token vars, never `@apply` with generated utilities)
- **Palette (Takshi Silks):** cream `#FBF7EF` app background, ivory `#FFFCF7` cards, purple `#6B238F` primary actions, plum `#42134F` contrast, lavender `#EEE4F5` selected backgrounds, gold `#C89B3C` restrained accents, warm cream-gray `#E9DED0` borders, charcoal `#211C24` text, warm gray `#756B75` secondary text; success `#287A43`/`#DDF3E3`, warning `#A66A00`/`#FFF0CC`, danger `#B42323`/`#FDE3E3`; 14px default / 18px large radius

Shared components use tokens and Tailwind utilities — not hardcoded colors. When adding a new generic control, start from shadcn/ui and place it in `shared/`. Do not introduce another UI library alongside it.

Existing shared primitives (`Button`, `Input`, `Modal`, `Table`, …) define the look; use shadcn for new shared controls or to replace a primitive when accessibility or composition is clearly better.

## State Management

- Global store slices in `store/` by responsibility
- Module-specific state co-located with the module (e.g. `modules/retail/store/` when needed)
- Do not create one monolithic store file

## Tauri Integration

- Native commands defined in `src-tauri/src/`
- React accesses native capabilities **only** through `services/desktop/`
- Business components never import Tauri APIs directly

## Adding a New Feature (within Retail)

1. Create screen in `modules/retail/screens/<feature>/`
2. Add retail-specific components in `modules/retail/components/<feature>/`
3. Register route in `modules/retail/navigation/routes.jsx`
4. Register nav item in `modules/retail/navigation/index.js`
5. Reuse `shared/` (shadcn/ui) components where appropriate; do not add business-specific copies of the same primitive
6. Call APIs through `services/api/`, not from components directly
7. Keep retail terminology inside the retail module

## Adding a New Business Type

1. Create `modules/<type>/` with the same structure as retail (config, navigation, screens, components, layouts, index.js)
2. Export module definition from `modules/<type>/index.js`
3. Register in `app/moduleRegistry.js`
4. Add boundary stub in `modules/index.js` if needed
5. Do **not** modify `core/`, `shared/`, or global folders unless adding genuinely cross-business capability
6. Update this document if the module contract changes

## Evolution Phases

| Phase | Scope |
|-------|-------|
| 1 | Retail only |
| 2 | Retail + Restaurant |
| 3 | Retail + Restaurant + Services |
| 4 | Additional business modules |

Each phase adds a module — not a restructure.

## Change Guidelines

When implementing a new feature, follow this order:

1. **Read `ARCHITECTURE.md` first.**
2. **Identify correct ownership** — app, core, shared, or which business module.
3. **Reuse `shared/` components** where appropriate; do not duplicate.
4. **Do not move or restructure folders** without a clear architectural reason.
5. **Do not duplicate existing functionality.**
6. **Keep business-specific code inside its business module.**
7. **Update `ARCHITECTURE.md`** when a meaningful architectural decision or folder-boundary change is introduced.
8. **Before creating a new global folder**, verify the existing architecture cannot accommodate the requirement.
9. **Keep the architecture scalable** for future business types without implementing those businesses prematurely.
