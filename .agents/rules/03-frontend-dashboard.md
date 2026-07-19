# Frontend Dashboard

## Scope

**Applies when:** Editing `frontend/src/**`, `frontend/vite.config.ts`, `frontend/.env.example`, or `frontend/Dockerfile`.

**Does not apply when:** Backend-only changes.

## Rationale

**Problem observed:** `App.tsx` owns fetch, state, and layout; error copy is Spanish while UI is English; charts correctly receive pre-computed data (Phase 2 → Architecture, Naming).

**Why this rule helps:** Filters, alerts, and dynamic period labels all touch the same files — this prevents sprawl.

## Requirements

### MUST

**Components:**

- One dashboard widget per file under `frontend/src/components/dashboard/`
- Define `interface XxxProps` above each export
- Accept `loading?: boolean`; render `Skeleton` when loading
- Use `aria-label` on major `<section>` elements (see `App.tsx` L57, L61)

**Data:**

- Import types from `@/lib/financial-types`
- Format via `formatCurrency` / `formatPercent` from `@/lib/financial-utils`
- Compute KPIs in `financial-utils.ts`; pass results as props
- Charts receive `MonthlyDataPoint[]` or similar — no API calls inside chart files

**API access:**

- Base URL: `import.meta.env.VITE_API_BASE_URL ?? ""`
- **Before adding a second endpoint:** create `frontend/src/lib/api/metrics.ts` and move existing fetch there
- Throw on `!response.ok` with English messages including status code

### SHOULD

- Use `cn()` from `@/lib/utils.ts` for conditional classes
- Follow existing grids: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` (KPIs), `xl:grid-cols-2` (charts)
- Drive `DashboardHeader` `period` from `/api/metrics/facets` instead of string literals

### MUST NOT

- Add static mock files that bypass the API for the main dashboard
- Call `fetch` from `components/dashboard/*`
- Show Spanish errors in an otherwise English UI

## Vite proxy

`vite.config.ts` L13 targets `http://backend:8000` (Docker service name). When editing proxy config:

- Docker Compose: `http://backend:8000`
- Host `npm run dev`: `http://localhost:8000`

Document in commit message if both paths are not yet supported.

## Repository anchors

| Status | Location | Notes |
|--------|----------|-------|
| Good example | `components/dashboard/kpi-row.tsx` | Props, formatters, loading |
| Good example | `lib/financial-utils.test.ts` | Util edge cases |
| Known gap | `App.tsx` L15–21, L29–43 | Fetch + errors to extract |
| Known gap | `App.tsx` L49 | Static period label |
| Target file | `lib/api/metrics.ts` | Create before Task A |

## Task examples

See [rule-validation.md](./rule-validation.md) → **Task A** (filter UI), **Task B** (error + period), **Task C** (alerts component)
