# Rule Validation (Phase 3)

**Date:** July 18, 2026  
**Source:** Rules derived from [`docs/phase-2-engineering-practices.md`](../docs/phase-2-engineering-practices.md)

Six real tasks from this repository were walked through each rule file. Every rule guides at least two tasks. Ambiguities found during validation were refined in the rule text (see [Refinements](#refinements-applied)).

---

## Task A: Add date range filter UI

**Goal:** Filter dashboard by date using existing backend endpoints.

**Rules:** 00, 01, 03, 04

| Step | Rule | Guided action |
|------|------|---------------|
| 1 | 01 MUST | Create `frontend/src/lib/api/metrics.ts` with `fetchMetrics(params)` and `fetchFacets()` |
| 2 | 01 MUST | Use `GET /api/metrics/facets` for date bounds — do not add a new backend route |
| 3 | 03 MUST | Add `components/dashboard/date-filter.tsx` with props only; no fetch inside |
| 4 | 03 SHOULD | Pass `start_date` / `end_date` query params to `fetchMetrics` |
| 5 | 03 SHOULD | Set `DashboardHeader` period from facets, not `"2024 - Full Year"` |
| 6 | 00 MUST | English UI copy |
| 7 | 04 MUST | Add util tests if date-format helpers are extracted |

**Result:** Pass — Rule 01 blocks duplicate routes and forces API module creation before UI work.

---

## Task B: Fix error message and period label

**Goal:** Fix `App.tsx` Spanish error, empty catch, and hardcoded period.

**Rules:** 00, 03

| Step | Rule | Guided action |
|------|------|---------------|
| 1 | 00 MUST NOT | Replace L37 with English error message |
| 2 | 00 MUST NOT | Use `catch (err)` and log error — not empty `catch ()` |
| 3 | 00 MUST NOT | Remove `period="2024 - Full Year"` at L49 |
| 4 | 03 SHOULD | Derive period from facets or formatted date range |
| 5 | 00 MUST | Run `npm test` if utils change |

**Result:** Pass — Rules cite exact lines (`App.tsx` L35–38, L49).

---

## Task C: Add alerts panel via `/api/metrics/alerts`

**Goal:** Display outcome spike alerts on the dashboard.

**Rules:** 00, 01, 02, 03, 04

| Step | Rule | Guided action |
|------|------|---------------|
| 1 | 01 SHOULD | Use existing `GET /api/metrics/alerts` — check `threshold`, `group_by` params |
| 2 | 01 MUST | Add `fetchAlerts()` to `lib/api/metrics.ts`; add `MetricsAlert` to `financial-types.ts` |
| 3 | 03 MUST | Create `components/dashboard/alerts-panel.tsx` with `alerts` + `loading` props |
| 4 | 02 MUST | Do not change backend unless response shape is insufficient |
| 5 | 04 MUST NOT | No component render tests until `@testing-library/react` is added |
| 6 | 00 MUST NOT | No auth or database |

**Result:** Pass — Rule 01 "consume existing endpoint first" applies directly.

---

## Task D: Cache mock data in backend

**Goal:** Avoid regenerating 360 movements on every request.

**Rules:** 00, 01, 02, 04

| Step | Rule | Guided action |
|------|------|---------------|
| 1 | 01 SHOULD | Module-level cache in `routes.py` or extract to `data/mock_movements.py` |
| 2 | 02 MUST | Keep `generate_mock_movements(seed=42)` as generator; cache output |
| 3 | 01 MUST | Keep route handlers thin after extraction |
| 4 | 04 MUST | All 15 existing pytest cases must still pass |
| 5 | 00 MUST NOT | No Redis/DB |

**Result:** Pass — Small cache allowed in `routes.py`; >30 lines triggers service extraction (Rule 01).

---

## Task E: Add Docker Compose healthcheck

**Goal:** Frontend waits for backend readiness on cold start.

**Rules:** 05, 00

| Step | Rule | Guided action |
|------|------|---------------|
| 1 | 05 SHOULD | Add backend healthcheck hitting `/health` |
| 2 | 05 SHOULD | Set `depends_on.backend.condition: service_healthy` on frontend |
| 3 | 05 MUST | Document ports 5173, 8000, 5678 if README updated |
| 4 | 05 MUST NOT | Do not remove `node_modules` anonymous volume |
| 5 | 00 | Doc/infra only — skip app test runs |

**Result:** Pass — Rule 05 uses Python urllib healthcheck (no curl in slim image).

---

## Task F: Remove dead `mock-data.ts`

**Goal:** Delete unused static mock file.

**Rules:** 00, 01

| Step | Rule | Guided action |
|------|------|---------------|
| 1 | 00 SHOULD | Confirm no imports of `mock-data` |
| 2 | 01 MUST NOT | Do not wire static mock into dashboard instead of API |
| 3 | 00 SHOULD | Delete `frontend/src/lib/mock-data.ts` |
| 4 | 00 MUST | Run `npm test` after deletion |

**Result:** Pass — Global rule names the exact file.

---

## Coverage matrix

| Rule file | A | B | C | D | E | F |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|
| 00-global-conventions | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| 01-api-and-module-boundaries | ✓ | — | ✓ | ✓ | — | ✓ |
| 02-backend-fastapi | — | — | ✓ | ✓ | — | — |
| 03-frontend-dashboard | ✓ | ✓ | ✓ | — | — | — |
| 04-testing | ✓ | ✓ | ✓ | ✓ | — | ✓ |
| 05-docker-and-dependencies | — | — | — | — | ✓ | — |

---

## Refinements applied

| Ambiguity in Phase 2 proposal | Resolution in rule files |
|------------------------------|--------------------------|
| "Create services/ when file grows" — no threshold | **>30 lines** of non-route logic triggers extraction (`01-api-and-module-boundaries.md`) |
| Component tests required? | Blocked until `@testing-library/react` in `package.json` (`04-testing.md`) |
| Healthcheck example used curl | Python urllib one-liner in slim image (`05-docker-and-dependencies.md`) |
| Vite proxy dual-environment vague | Explicit `backend:8000` vs `localhost:8000` targets (`03-frontend-dashboard.md`) |
| When to skip tests | Doc-only edits to `.agents/` or `docs/` skip test runs (`00-global-conventions.md`) |

---

## Re-validation checklist

Re-run validation when:

- A new rule file is added (use `RULE-TEMPLATE.md`)
- `@testing-library/react` is installed (update Task C expectations)
- `routes.py` is split into `services/` (update Task D anchors)
- Production deployment is in scope (add Task G for auth/CORS)
