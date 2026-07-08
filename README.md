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
│   ├── (organizer)/              # /dashboard, /events, /events/[id]/...
│   ├── (guest)/                  # /invitation/[token], /privacy
│   ├── (validator)/              # /checkin/[token]
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles & Tailwind
├── components/
│   ├── ui/                       # shadcn/ui primitives (no domain logic)
│   ├── shared/                   # cross-cutting: SupportButton, service worker, shared types
│   └── modules/<domain>/         # feature modules — FLAT, one folder per business domain
│       ├── identity/             # organizer auth  ← REFERENCE shape
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
<domain>.service.ts   SERVICE  — every endpoint of the module's scope (Server Actions / fetch);
                                 the ONLY layer that inspects HTTP statuses and returns
                                 user-ready messages
use<Domain>.ts        CACHE    — client polling/cache hooks (optional; omit when nothing
                                 changes after the initial load)
<feature>.tsx         COMPONENT— UI + validation only (RHF + Zod); calls actions/hooks,
                                 never raw fetch
index.ts              BARREL   — the module's public surface (components, hooks, public types);
                                 deep imports never cross the module boundary
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
- **No hardcoded config** — environment variables via `.env` files only
- **API calls** go through service layers, never directly in components

## Available Scripts

| Script     | Command            |
|------------|--------------------|
| Dev server | `pnpm dev`         |
| Build      | `pnpm build`       |
| Start      | `pnpm start`       |
| Lint       | `pnpm lint`        |
