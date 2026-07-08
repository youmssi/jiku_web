# Jikū — Claude Code Instructions

This file configures Claude Code for the Jikū frontend service. It includes all project context from `AGENTS.md`.

@AGENTS.md

## Claude-Specific Instructions

### Before Writing Any Code

1. Read `AGENTS.md` fully — do not skip this step
2. Read the relevant API docs in `node_modules/next/dist/docs/` for any Next.js API you plan to use — this version (16.2) has breaking changes
3. Check if the file or pattern you're about to create already exists in the project

### Code Style

- Use **4-space indentation** (not tabs)
- Use single quotes for strings (Prettier default for this project)
- Prefer `interface` over `type` for object shapes
- Use `function` declarations (not arrow functions) for React components
- Async Server Components use `async function ComponentName()`
- Client Components use `"use client";` directive at the very top

### Import Conventions

- Use the `@/` path alias (e.g., `import { Button } from "@/components/ui/button"`)
- Group imports: external → internal → styles/types
- Barrel exports from `index.ts` files at directory level

### TypeScript Rules

- `strict: true` in tsconfig — respect it strictly
- No `any` types — use `unknown` and narrow
- Prefer branded types for IDs (e.g., `type EventId = string & { __brand: "EventId" }`)
- Use `Readonly<{ children: React.ReactNode }>` for layout component props
- Dynamic route params use: `params: Promise<{ param: string }>` and `const { param } = await params`

### PR & Commit Rules

- Branch naming: `jiku-{number}-{slug}` (e.g., `jiku-12-organizer-auth-ui`)
- Squash merge only into `develop`
- PR template from `docs/jiku-mvp-backlog.md` Section 2
- **Never** include AI authorship traces in any artifact

### When Stuck

- If a story has an `[INTERACTIVE STEP]` block, stop and present options — do not guess
- If a dependency is not yet merged to `develop`, stop and report
- If you're unsure about an API, check the Next.js docs in `node_modules/next/dist/docs/` before proceeding
