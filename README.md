# Jikū — Frontend Service

**Jikū** is a white-label SaaS platform for event invitation, ticketing, RSVP, and check-in. This repository contains the frontend service built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Prerequisites

- **Node.js 20+**
- **pnpm** (preferred package manager)

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

### 3. Start the development server

```bash
pnpm dev
```

The application starts on `http://localhost:3000`.

### 4. Build for production

```bash
pnpm build
```

## Project Structure

```
web/
├── app/                          # ROUTING LAYER — route groups, params, guards
│   ├── [locale]/                 # i18n segment: "/" = fr (default), "/en/..." = en
│   │   ├── (organizer)/          # /dashboard, /events, /events/[id]/...
│   │   │   ├── (auth)/           # /login, /register, password reset, verify email
│   │   │   └── (app)/            # authenticated organizer app
│   │   ├── (guest)/              # /invitation/[token], /o/[username], /privacy
│   │   ├── (operator)/           # /checkin/[token] (door), /line/[token] (counter)
│   │   ├── (admin)/              # /admin/... platform admin desk
│   │   ├── layout.tsx            # Root layout (locale-aware)
│   │   └── page.tsx              # Landing page (both locales)
│   ├── api/                      # BFF route handlers (locale-agnostic)
│   └── globals.css               # Global styles & Tailwind
├── i18n/                         # next-intl config: routing, request, navigation
├── messages/                     # translation catalogs (fr.json, en.json)
├── proxy.ts                      # locale resolution + organizer session guard
├── components/
│   ├── ui/                       # shadcn/ui primitives (no domain logic)
│   ├── shared/                   # cross-cutting: SupportButton, service worker, shared types
│   └── modules/<domain>/         # feature modules — FLAT, one folder per business domain
│       ├── identity/             # organizer auth  ← REFERENCE shape (index.ts + server.ts)
│       ├── event/                # event creation & editing
│       ├── guest/                # organizer guest-list management (import, invitations)
│       ├── dashboard/            # live event metrics
│       ├── invitation/           # guest-facing RSVP / ticket / data deletion
│       └── checkin/              # validator scanning console (online + offline)
├── lib/                          # api, api-server, auth, constants, datetime, utils
├── .env.example                  # Environment variable reference
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Architecture

Modules are split **by business domain, not by role**. Every module is a flat folder
with the same shape — when in doubt, copy `components/modules/identity/`:

```
schema.ts             CONTRACT — Zod schemas + inferred types / DTOs mirroring the backend
<domain>.service.ts   SERVICE  — the module's writes and client-triggered reads, as Server
                                 Actions returning `ActionResult<T>` (lib/action-result); the
                                 only layer, with queries, that inspects HTTP statuses
<domain>.queries.ts   SERVICE  — optional server-only reads for Server Components
                                 (`import "server-only"`): never Server Actions, so no client
                                 can call them; a failed read falls back to an empty state
use<Domain>.ts        CACHE    — client polling/cache hooks (optional; omit when nothing
                                 changes after the initial load)
<feature>.tsx         COMPONENT— UI + validation only (RHF + Zod); calls actions/hooks,
                                 never raw fetch
index.ts              BARREL   — the module's public surface (components, hooks, public types);
                                 deep imports never cross the module boundary
server.ts             BARREL   — optional server-only surface (`import "server-only"`): loaders
                                 that read the session cookie, for Server Components only, so
                                 they can never reach a client bundle through index.ts
```

Layer dependency is one-way — routing → component → cache → service → contract:

| Layer | Location | Responsibility |
|---|---|---|
| **Routing** | `app/**` | Route groups, params, guards; renders a module component (imported from its barrel) |
| **Component** | `modules/<domain>/<feature>.tsx` | UI + validation only |
| **Cache/Data** | `modules/<domain>/use<Domain>.ts` | Client polling/cache (optional) |
| **Service** | `modules/<domain>/<domain>.service.ts` | Server Actions / `fetch`; sole HTTP-status handler |
| **Contract** | `modules/<domain>/schema.ts` | Zod schemas + types |

## Key Conventions

- **Server Components** are the default; use `"use client"` only when interactivity or browser APIs are needed
- **Route groups** (parentheses syntax) keep URL paths clean while allowing per-role layouts
- **i18n (next-intl)** — locales live in `i18n/routing.ts` (`fr` default, unprefixed; `/en/...` prefixed). Import `Link`/`useRouter`/`usePathname` from `@/i18n/navigation` (not `next/link` / `next/navigation`) so the active locale survives navigation; on the server, redirect with `localeRedirect` from `@/i18n/redirect`. File downloads served by `app/api/**` are plain `<a download>` links, never `Link`. Every user-facing string lives in `messages/<locale>/<namespace>.json` (one catalog per namespace, listed in `i18n/messages.ts`); French is the reference whose shape types every key, and `pnpm i18n:check` (run in CI) fails when English drifts from it. Components use `useTranslations` / `getTranslations`; Server Actions translate their messages with `getTranslations`; Zod schemas carry `common.validation` keys that `FormFieldError` translates. Long-form marketing copy (landing, simulator, use cases) stays in its typed per-locale content modules
- **Route names** — URL segments are English and specific (`/services/[id]/manage`, `/services/[id]/line`); the language lives in the locale prefix, not in the path.
- **Pages stay thin** — a `page.tsx` reads params and renders one module component; data loading, fallbacks and role checks live in the module
- **No hardcoded config** — environment variables via `.env` files only
- **API calls** go through service layers, never directly in components

## Available Scripts

| Script     | Command            |
|------------|--------------------|
| Dev server | `pnpm dev`         |
| Build      | `pnpm build`       |
| Start      | `pnpm start`       |
| Lint       | `pnpm lint`        |

## Contributing

`CONTRIBUTING.md` is the workflow from story to merge: one branch per story from
an up-to-date `develop`, merged before the next story starts.
