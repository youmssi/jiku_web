# Contributing to the Jikū frontend

This guide is the workflow every change follows, from picking a story to merging
it. The architecture and engineering rules live in `README.md` and `AGENTS.md`;
read them before your first change.

## 1. One story, one branch, merged before the next

1. Pick the next story in the production plan (backend repository,
   `docs/jiku-plan-production.md`) and give it its `JIKU-<n>` number.
2. Branch from an up-to-date `develop`:

   ```bash
   git fetch origin develop
   git checkout -b jiku-<n>-<slug> origin/develop
   ```

3. Build the story on that branch.
4. Open a pull request against `develop`, as a draft while work is in progress.
5. **Merge the story into `develop` before starting the next one.** A story is
   finished only when its pull request is squash-merged; the next branch starts
   from the `develop` that contains it.

Never stack a story on another unmerged story. Stacked branches drift from each
other, every squash-merge below them turns into a conflict above them, and a
reviewer can no longer read one story in isolation.

A story that needs a new backend endpoint has one branch per repository, both
named `jiku-<n>-<slug>`. The backend is merged first; the frontend follows once
the contract it consumes is on the backend's `develop`, and `lib/api-types.ts` is
regenerated from that contract in the same pull request.

## 2. Before opening the pull request

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

- Every user-facing string is in both locales.
- Forms follow the shared form pattern (React Hook Form + Zod + shadcn `Field`).
- New screens reuse the shadcn primitives in `components/ui` before anything new
  is written; no component duplicates one that already exists.
- Dead code left behind by the change is removed in the same change.

## 3. Commits and pull requests

- Conventional Commits: `<type>(<scope>): <description>` with a
  `Refs: JIKU-<n>` trailer. Types: `feat`, `fix`, `refactor`, `test`, `docs`,
  `chore`, `perf`, `build`.
- The pull request title is the squash commit title; the description follows
  `.github/pull_request_template.md` and justifies any new `"use client"`
  boundary that is not obvious.
- No AI authorship trace anywhere: not in commits, pull requests, comments or file
  headers.

## 4. Merging

1. CI is green on the latest commit and every review thread is answered.
2. Mark the pull request ready and **squash-merge** it into `develop`.
3. Delete the branch.
4. Only then start the next story from the updated `develop`.

`main` receives `develop` for a release; nothing is committed to `main` or
`develop` directly.
