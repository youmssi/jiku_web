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
├── app/
│   ├── (organizer)/           # Organizer dashboard routes
│   │   └── dashboard/
│   │       └── page.tsx
│   ├── (guest)/               # Guest-facing routes
│   │   └── invitation/[token]/
│   │       └── page.tsx
│   ├── (validator)/           # Validator check-in routes
│   │   └── checkin/[token]/
│   │       └── page.tsx
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page
│   └── globals.css            # Global styles & Tailwind
├── components/
│   ├── shared/                # Cross-role components, types, hooks
│   ├── ui/                    # shadcn/ui primitives
│   └── modules/
│       ├── organizer/         # Organizer-specific components
│       │   ├── components/
│       │   ├── hooks/
│       │   └── services/
│       ├── guest/             # Guest-specific components
│       │   ├── components/
│       │   ├── hooks/
│       │   └── services/
│       └── validator/         # Validator-specific components
│           ├── components/
│           ├── hooks/
│           └── services/
├── .env.example               # Environment variable reference
├── package.json
├── next.config.ts
└── tsconfig.json
```

## Architecture

The frontend follows a strict layered architecture:

| Layer | Location | Responsibility |
|---|---|---|
| **Routing** | `app/` | Route resolution, params, auth checks |
| **Component** | `components/modules/{module}/components/` | UI components per role |
| **Cache/Data** | `components/modules/{module}/hooks/` | TanStack Query hooks |
| **Service** | `components/modules/{module}/services/` | API calls via `ky` |

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
