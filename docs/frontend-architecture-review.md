# Jikū Web — Frontend Architecture Review

Senior review of the `web/` service after the domain-module restructure. Scope:
layer model, data flow (web ↔ app), strengths, limits/breakdowns, DRY violations,
misplaced logic and boilerplate, with a file-by-file report and a prioritized fix
plan. Backend is only referenced where the frontend contract depends on it.

Verdict: **solid, coherent foundation** — the layering is now clean, the BFF/auth
model is correct, and the offline check-in engine is genuinely high quality. To reach
*enterprise-grade*, the gaps are: (1) backend DTOs hand-mirrored and scattered instead
of living in the contract layer, (2) no unified action-result / error-normalization
type, (3) several concrete DRY violations, (4) inconsistent fetch helpers, (5) unchecked
`as T` response casts. None are structural rewrites; they are consolidation work.

---

## 1. Layer model, as implemented

```
app/**/page.tsx            ROUTING   pure shells → return <View/> (post-refactor ✅)
components/modules/<d>/
  <feature>.tsx / *-view   COMPONENT UI + validation; Server Actions for writes
  use<D>.ts                CACHE     client polling/IndexedDB state (checkin, dashboard)
  <d>.service.ts           SERVICE   "use server" actions; only layer touching HTTP status
  schema.ts                CONTRACT  Zod form schemas + (should hold) backend DTOs
  index.ts                 BARREL    public surface
lib/                       PLUMBING  api, api-server, auth, constants, datetime, support,
                                     utils, report-error
components/ui, shared      PRIMITIVES shadcn + cross-cutting chrome
proxy.ts                   EDGE      cheap cookie gate on organizer routes
```

### Data flow

- **Read (authenticated):** Server Component/view → `serverFetch(path)` (reads the
  httpOnly access-token cookie, adds `Authorization: Bearer`) → backend `/api/v1/...`.
  RSC renders the result; some screens then poll client-side (`useDashboard`).
- **Read (public):** guest/validator views call `fetch(\`${apiBaseUrl()}/...\`)`
  directly (no token) — RSVP, ticket, check-in context.
- **Write:** client component → Server Action in `<d>.service.ts` → `serverFetch`/`fetch`
  → backend; action returns a plain `{ … , error? }` result; the component shows a toast
  or an inline `Alert`. `useTransition` drives pending state.
- **Auth:** tokens live only in httpOnly cookies (`lib/auth`); the browser never sees a
  JWT. `proxy.ts` redirects cookieless visitors off `/dashboard` and `/events`; pages
  re-check server-side (defense in depth).

**Strengths:** correct BFF (no token on the client); timezone-correct rendering (event
tz, never the viewer's); Server Actions + `useTransition`; route groups for per-role
chrome; lazy QR scanner; accessible forms (`Field`/`aria-invalid`) and the new
`PasswordInput`. The offline check-in stack (`useOfflineCheckin` + `offline-db` +
`checkin.service`) is excellent: IndexedDB queue, per-link roster isolation, stale-response
guards, first-timestamp-wins reconciliation.

**Limits / breakdowns of the adopted patterns:**

- **Contract layer is under-used.** `schema.ts` was meant to mirror the backend, but
  most response DTOs live *inline in view components*. The contract is therefore
  scattered and partly duplicated (see §2.1). Now that the backend exposes OpenAPI
  (`/v3/api-docs`), these types can be **generated**, eliminating drift entirely.
- **No shared result/error contract.** Each service invents its own result shape and
  re-implements HTTP-status→message mapping. `shared/ApiResponse<T>` exists but is dead.
- **Unchecked boundary.** Responses are `as T` casts with no runtime validation; a
  backend contract change fails silently in the UI.
- **Two fetch helpers by convention, three in practice** (`serverFetch`, raw `fetch`,
  and `authedGet` re-implementing `serverFetch`).
- **No client data layer.** Polling/caching is hand-rolled per screen (fine for MVP;
  a real limit for consistency, retries, and error surfacing at scale).

---

## 2. Cross-cutting findings (ranked, with justification)

### 2.1 — [P0] Backend DTOs hand-mirrored and scattered across components
The frontend re-declares backend response shapes by hand, and inconsistently:

- In the contract layer (good): `dashboard/schema.ts` (`DashboardData`…),
  `checkin/schema.ts` (`CheckInResponse`, `ValidatorContext`…), `invitation/schema.ts`
  (`RsvpView`, extracted during the refactor).
- Inline in view components (misplaced): `EventResponse` (`event/edit-event-view.tsx`),
  `EventListItem` (`event/events-list-view.tsx`), `Guest` + `Invitation`
  (`guest/guests-view.tsx`), `CurrentUser` + `Branding` (`identity/organizer-home.tsx`).

**Why it matters:** the contract lives in two places with two conventions; a `/api/v1`
change can break a screen with no compile error (`as T`). **Recommendation:** (a) short
term — move every backend-mirrored type into its module `schema.ts`; (b) target —
generate `lib/api-types.ts` from `/v3/api-docs` with `openapi-typescript` and consume
those types in services, deleting the hand-written mirrors. This is the single highest-
leverage enterprise improvement and is unlocked now that Swagger exists.

### 2.2 — [P0] No unified action-result / error-normalization (boilerplate)
Every service hand-rolls a bespoke shape and status mapping:
`identity.service` `{ error? }`; `guest.service` `{ result?, error? }` / `{ queued?, error? }`;
`dashboard.service` `{ data?, error? }`; `invitation.service` `{ error? }`;
`checkin.service` `{ data?, error?, linkInvalid? }`. Meanwhile
`components/shared/index.ts` defines `ApiResponse<T>` that **nothing uses** (dead code).

**Why:** ~6 files repeat `if (!response.ok) return { error: "…" }` with divergent copy,
and there is no single place to normalize errors or feed `reportError`.
**Recommendation:** introduce a shared discriminated `ActionResult<T>` in `lib/` and a
helper `handle<T>(response, map?)` that converts a `Response` to `ActionResult<T>`,
routing failures through `reportError`. Delete `shared/ApiResponse`. Services shrink to
declaring only their *domain-specific* status messages.

### 2.3 — [P1] Invitation channels defined three times (DRY)
`EMAIL`/`WHATSAPP` + labels exist in: `event/schema.ts`
(`INVITATION_CHANNELS`, `INVITATION_CHANNEL_LABELS`), `guest/send-invitations.tsx`
(local `CHANNELS`), and as bare `"EMAIL"`/`"WHATSAPP"` literals in `guest/guests-view.tsx`.
**Why:** adding a channel (e.g. SMS) touches three files and risks drift.
**Recommendation:** one source of truth for channels + labels (a `shared` domain constant,
since it spans event/guest/invitation), consumed everywhere.

### 2.4 — [P1] `GuestMatch` and `RosterEntry` are identical (DRY)
`checkin/schema.ts` declares two interfaces with the same nine fields.
**Recommendation:** `export type RosterEntry = GuestMatch` (or a shared base), or generate
from OpenAPI (§2.1).

### 2.5 — [P1] `authedGet` re-implements `serverFetch` (DRY / misplaced)
`identity/organizer-home.tsx` defines a private `authedGet<T>` that re-does token read +
`Bearer` + fetch + json — exactly `serverFetch` plus `.json()`.
**Recommendation:** use `serverFetch` and parse; delete `authedGet`. A cookie-name or
header change should be edited in one place.

### 2.6 — [P1] Two public-fetch call sites open-code the base URL (DRY)
`identity.service`, `invitation.service`, `checkin.service`, and `organizer-home` each
write `fetch(\`${apiBaseUrl()}/…\`, { cache: "no-store" })`.
**Recommendation:** add `publicFetch(path, init)` in `lib/api-server` (mirror of
`serverFetch`, no `Authorization`) so base URL + defaults live in one place.

### 2.7 — [P1] Date formatting duplicated and locale-inconsistent (DRY)
`event/events-list-view.tsx` inlines `formatStart` with `Intl.DateTimeFormat("en", …)`,
while `lib/datetime.ts` already offers `formatDateTimeInZone` (locale `en-GB`).
**Recommendation:** delete the inline formatter; use `lib/datetime`. Pick one locale.

### 2.8 — [P2] Error/empty state markup duplicated
"…unavailable" centered cards are re-authored in `invitation-view`, `ticket-view`
(`Centered` helper), `dashboard-view`, `checkin-view`, and the new error boundaries.
A shadcn `ui/empty.tsx` primitive already exists but is unused.
**Recommendation:** a shared `<StateMessage variant="error|empty">` (built on `ui/empty`)
for consistent UX and less markup.

### 2.9 — [P2] Landing page bypasses the design system
`app/page.tsx` hardcodes button styling (`<Link className="rounded-full bg-zinc-900 …">`)
instead of `Button asChild`. Design drift; no token reuse.

### 2.10 — [P2] Dead code / minor
- `components/shared/index.ts`: `Role` and `ApiResponse<T>` are unused → remove or wire up.
- `<Toaster/>` is mounted in both `(organizer)/layout` and `(guest)/layout` → hoist to root.
- Offline sync/attendance failures are swallowed (`catch {}`) with no user feedback in
  the validator console → surface at least a subtle indicator.

### 2.11 — [P2] Resilience & traceability of the fetch layer
`serverFetch` has no timeout, no retry for idempotent GETs, and does not propagate a
correlation id — yet the backend already emits MDC correlation ids and `report-error`
now exists on the client. **Recommendation:** add a timeout + optional GET retry, and
forward/propagate an `X-Correlation-Id` so a frontend error can be traced to a backend
log line end to end.

### 2.12 — [Option, not a defect] Adopt a client data layer
`useDashboard` is a manual `setInterval` poller with no backoff and no error surfacing;
each screen re-implements loading/error state. A data layer (TanStack Query / SWR) would
centralize caching, dedup, retry, and states — *but* the project deliberately stayed on
Server Actions + `fetch`. Keep as an explicit, deferred decision; revisit if client-side
data needs grow.

---

## 3. File-by-file report

Legend: ✅ good as-is · ✎ change recommended · ⚠ notable issue

### lib/
| File | Verdict | Notes / action |
|---|---|---|
| `api.ts` | ✅ | `apiBaseUrl()` clean, server-only. |
| `api-server.ts` | ✎ | Add `publicFetch` sibling (§2.6); consider timeout/retry/correlation id (§2.11). |
| `auth.ts` | ✅ | Correct httpOnly cookie handling; max-ages mirror backend. |
| `constants.ts` | ✅ | Good route/cookie SoT. Consider adding a `PROTECTED_ROUTES` list shared with `proxy.ts`. |
| `datetime.ts` | ✅ | Timezone-correct; make it the *only* date formatter (§2.7). |
| `support.ts` | ✅ | Env-driven, sane defaults. |
| `utils.ts` | ✅ | Standard `cn`. |
| `report-error.ts` | ✅ | New central sink; wire services/actions into it (§2.2). |

### components/shared, ui
| File | Verdict | Notes |
|---|---|---|
| `shared/index.ts` | ⚠ | `Role`, `ApiResponse<T>` are dead code (§2.10). Replace `ApiResponse` with a real `ActionResult<T>` (§2.2). |
| `shared/support-button.tsx` | ✅ | Correctly relocated to shared. |
| `shared/service-worker-register.tsx` | ✅ | Prod-only registration. |
| `ui/password-input.tsx` | ✅ | New; forwards RHF props + `aria-invalid`. |
| `ui/empty.tsx` | ✎ | Exists but unused — adopt for state messages (§2.8). |

### app/ (routing + boundaries)
| File | Verdict | Notes |
|---|---|---|
| `layout.tsx` | ✎ | Loads 4 font families (Geist, Geist_Mono, DM_Sans, Inter); trim to what the theme uses. (Currently WIP.) |
| `error.tsx` / `global-error.tsx` | ✅ | New route + root boundaries reporting via `report-error`. |
| `page.tsx` (landing) | ✎ | Use `Button asChild` instead of hardcoded styles (§2.9). |
| `(organizer|guest|validator)/*/page.tsx` | ✅ | Now pure shells returning a view. |
| `(organizer)/layout.tsx`, `(guest)/layout.tsx` | ✎ | Duplicate `<Toaster/>` → hoist to root (§2.10). |
| `(validator)/layout.tsx` | ✅ | Dark shell; no toaster by design. |
| `api/events/[id]/guests/export/route.ts` | ✅ | Correct authed streaming download via `serverFetch`. |
| `manifest.ts`, `offline/page.tsx`, `privacy/page.tsx` | ✅ | Static leaves; fine as-is. |
| `proxy.ts` | ✅ | Cheap gate; keep matcher in sync with `constants` (§2.1 note). |

### module: identity
| File | Verdict | Notes |
|---|---|---|
| `schema.ts` | ✅ | Zod login/register + inferred types. |
| `identity.service.ts` | ✎ | Adopt `ActionResult`/`publicFetch` (§2.2, §2.6). |
| `login-form.tsx`, `register-form.tsx` | ✅ | Exemplary RHF+Zod+Field+PasswordInput; own their layout. |
| `organizer-home.tsx` | ⚠ | Move `CurrentUser`/`Branding` to `schema.ts`; replace `authedGet` with `serverFetch` (§2.1, §2.5). |
| `index.ts` | ✅ | Clean barrel. |

### module: event
| File | Verdict | Notes |
|---|---|---|
| `schema.ts` | ✅ | Form schema + channel constants (make these the channel SoT, §2.3). |
| `event.service.ts` | ✎ | `ActionResult` (§2.2). |
| `event-wizard.tsx` | ✅ | Full RHF pattern (Select/Switch/Checkbox). |
| `new-event-view.tsx` | ✅ | Thin view. |
| `edit-event-view.tsx` | ⚠ | Move `EventResponse` into `schema.ts` (§2.1). |
| `events-list-view.tsx` | ⚠ | Move `EventListItem` to `schema.ts`; use `lib/datetime` not inline `formatStart` (§2.1, §2.7). |

### module: guest
| File | Verdict | Notes |
|---|---|---|
| `schema.ts` | ✎ | Holds `ImportResult`; also give it `Guest`/`Invitation` (§2.1). |
| `guest.service.ts` | ✎ | `ActionResult` (§2.2). |
| `guest-import.tsx` | ✅ | Clean file-upload action. |
| `send-invitations.tsx` | ⚠ | Local `CHANNELS` duplicates channel SoT (§2.3). |
| `guests-view.tsx` | ⚠ | Inline `Guest`/`Invitation`; hardcoded channel literals (§2.1, §2.3). |

### module: dashboard
| File | Verdict | Notes |
|---|---|---|
| `schema.ts` | ✅ | DTOs correctly in the contract layer. |
| `dashboard.service.ts` | ✎ | `ActionResult` (§2.2). |
| `useDashboard.ts` | ✎ | Hand-rolled poller; candidate for a data layer (§2.12); add error surfacing. |
| `event-dashboard.tsx`, `dashboard-view.tsx` | ✅ | Clean split (client polling vs server snapshot). |

### module: invitation
| File | Verdict | Notes |
|---|---|---|
| `schema.ts` | ✅ | `RsvpView` (extracted during refactor). |
| `invitation.service.ts` | ✎ | `ActionResult` + `publicFetch` (§2.2, §2.6). |
| `rsvp-actions.tsx`, `ticket-card.tsx`, `data-deletion.tsx` | ✅ | Good client action components; toast pattern consistent. |
| `invitation-view.tsx`, `ticket-view.tsx` | ✎ | Duplicated error/centered markup (§2.8). |

### module: checkin
| File | Verdict | Notes |
|---|---|---|
| `schema.ts` | ⚠ | `GuestMatch` == `RosterEntry` (§2.4). |
| `checkin.service.ts` | ✅ | Good `ServiceResult<T>` + `linkInvalid` handling — closest to the desired shared pattern; promote it to `lib` (§2.2). |
| `useGuestSearch.ts` | ✅ | Debounce + stale-response guard. |
| `useOfflineCheckin.ts` | ✅ | High quality; the app's most complex, best-tested-by-design logic. |
| `offline-db.ts` | ✅ | IndexedDB with per-link isolation. |
| `validator-console.tsx`, `guest-search.tsx`, `checkin-result.tsx`, `qr-scanner.tsx` | ✅ | Well-structured; lazy scanner. Surface swallowed sync errors (§2.10). |

---

## 4. Prioritized fix plan

- **P0 (contract integrity):**
  1. Generate `lib/api-types.ts` from `/v3/api-docs` (`openapi-typescript`); replace all
     hand-written response DTOs; parse/validate at the service boundary (§2.1).
  2. Introduce `lib/ActionResult` + `handle()` helper wired to `report-error`; delete
     dead `shared/ApiResponse`; refactor the six services onto it (§2.2).
- **P1 (DRY / consistency):** channel SoT (§2.3); `RosterEntry = GuestMatch` (§2.4);
  drop `authedGet` (§2.5); `publicFetch` (§2.6); single date formatter (§2.7).
- **P2 (polish / resilience):** shared state component on `ui/empty` (§2.8); landing page
  via `Button` (§2.9); remove dead code + hoist Toaster (§2.10); fetch timeout/retry +
  correlation id (§2.11); surface offline errors.
- **Deferred decision:** client data layer (§2.12) — only if client-side data needs grow.

None of P0–P2 touch the module boundaries established by the restructure; they are
consolidation into the layers that already exist.
