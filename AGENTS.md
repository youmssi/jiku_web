<!-- BEGIN:jiku-project-context -->
# Jikū — Frontend Service (AI Agent Instructions)

## Project Overview

Jikū is a white-label SaaS platform for event invitation, ticketing, RSVP, and check-in. This is the frontend service, built with Next.js (App Router), TypeScript, and Tailwind CSS. It communicates with a Kotlin/Spring Boot backend API.

## Tech Stack

| Technology | Version | Notes |
|---|---|---|
| **Next.js** | 16.2.9 | App Router with route groups |
| **React** | 19.2.4 | Server Components by default |
| **TypeScript** | ^5 | Strict mode enabled |
| **Tailwind CSS** | ^4 | PostCSS configuration |
| **pnpm** | workspace | Preferred package manager |

> **Important:** Next.js 16 has breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before assuming API behavior. Heed deprecation notices.

## Route Groups (App Router)

Routes are organized by role using Next.js route groups (parentheses syntax), which keep URL paths clean while allowing per-role layouts:

```
app/
├── (organizer)/           → URLs: /dashboard, /events, etc.
│   ├── dashboard/page.tsx → /dashboard
│   └── layout.tsx         → Organizer-specific layout
├── (guest)/               → URLs: /invitation/[token], etc.
│   ├── invitation/[token]/page.tsx → /invitation/:token
│   └── layout.tsx         → Guest-facing layout (light, branded)
├── (validator)/           → URLs: /checkin/[token], etc.
│   ├── checkin/[token]/page.tsx   → /checkin/:token
│   └── layout.tsx         → Validator layout (dark, scanning-optimized)
├── layout.tsx             → Root layout (Geist fonts, global styles)
├── page.tsx               → Landing page (/)
└── globals.css            → Tailwind imports & CSS variables
```

**Key rules:**
- Route groups do **not** affect the URL path — `(organizer)/dashboard` serves at `/dashboard`
- Each group has its own `layout.tsx` for role-specific chrome
- Dynamic route params use the `Promise`-based API (Next.js 16): `params: Promise<{ token: string }>` + `const { token } = await params`

## Component Layers (Strict One-Directional Dependency)

```
components/
├── shared/                    # Cross-role: types, hooks, utilities
│   └── index.ts               # Barrel: Role, ApiResponse<T>, etc.
├── ui/                        # shadcn/ui primitives (no domain logic)
│   └── index.ts               # Barrel: Button, Input, Card, etc.
└── modules/
    ├── organizer/             # Organizer-specific
    │   ├── components/        # UI components
    │   ├── hooks/             # TanStack Query hooks (data/cache)
    │   └── services/          # ky API calls
    ├── guest/                 # Guest-specific
    │   ├── components/
    │   ├── hooks/
    │   └── services/
    └── validator/             # Validator-specific (offline-sync critical)
        ├── components/
        ├── hooks/
        └── services/
```

**Layer dependency direction (strict, one-way):**

```
Routing (app/) → Component (modules/{role}/components/)
               → Cache/Data (modules/{role}/hooks/)
               → Service (modules/{role}/services/)
```

- **Routing layer** (`app/`) — route resolution, params, search params, auth/token checks, renders the module's top-level component. No business logic, no presentation logic.
- **Component layer** — UI components per role. Never makes API calls directly.
- **Cache layer** (`hooks/`) — TanStack Query hooks for data fetching, caching, mutations. Never used for single-action buttons or static content.
- **Service layer** (`services/`) — API calls using `ky`. Never imported inside Server Components or Server Actions directly.

**Omission rules:**
- A module **may** skip the hooks layer if nothing changes after initial load (e.g., guest ticket page)
- A module **may** skip separate services if a single Server Action covers its one mutation (e.g., RSVP confirm/decline)
- The **component layer is never omitted**
- The **validator module's service/cache separation must never be collapsed** due to offline-sync requirements

## Rendering Strategy per Route Group

| Route Group | Strategy | Rationale |
|---|---|---|
| `(organizer)` | Server Components + client-side polling | Initial SSR render, TanStack Query for dashboard updates |
| `(guest)` | Dynamic Server Components + Server Actions | Fast-loading, mobile-first pages for invitation links |
| `(validator)` | Client-Component-dominant | Camera access, IndexedDB, offline sync needs |
| SSG / ISR | Not used anywhere in current scope | All data is dynamic and tenant-specific |

## Environment Variables

- Public (browser) vars: prefix with `NEXT_PUBLIC_`
- Server-only vars: no prefix, only accessible in Server Components/Actions/Route Handlers
- Every variable must be documented in `.env.example`
- Never hardcode a configurable value — always use env vars
- Fail fast on missing required env vars — no silent fallbacks

## API Conventions

- Backend API is served from the Spring Boot backend (hosted on Render)
- All endpoints are versioned under `/api/v1/...`
- Authentication uses httpOnly cookies (JWT), not localStorage
- API calls go through service layers using `ky`, never `fetch` directly

## Engineering Rules (Hard Requirements)

1. **No AI authorship trace** — No commit message, PR description, code comment, or file header may reference "AI", "Claude", "Copilot", "ChatGPT", "generated by", or any equivalent. Write everything as a human engineer would. This is non-negotiable.

2. **Conventional Commits** — Format: `<type>(<scope>): <description>` with `Refs: JIKU-<number>` trailer. Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `build`.

3. **No hardcoded config** — URLs, API keys, numeric thresholds, feature flags come from env vars. Never literals in source code.

4. **No duplicated logic** — Extract shared validation, formatting, or mapping into `components/shared/`. Never copy-paste across modules.

5. **Server Components first** — Default to a Server Component. Mark `"use client"` only for interactivity, browser APIs, or client-side state. Justify in PR description if not obvious.

6. **No direct cross-module access** — `organizer/` code never imports from `guest/` internals. Shared code goes in `components/shared/`.

## Deployment

| Service | Provider |
|---|---|
| Frontend | **Vercel** (native Next.js deployment) |
| Backend | **Render** (Spring Boot service) |
| Database | **Neon** (PostgreSQL) |

## Key Reference Files

- `web/CLAUDE.md` — Claude Code instructions (includes this file)
- `web/README.md` — Project structure and setup guide
- `web/.env.example` — Required environment variables
- `docs/jiku-mvp-backlog.md` — Full backlog (single source of truth)
- `docs/jiku-project-framing.md` — Architecture decisions and reasoning
- `app/` — Backend service repository (Kotlin/Spring Boot)
<!-- END:jiku-project-context -->
