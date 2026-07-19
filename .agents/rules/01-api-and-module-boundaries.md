# API and Module Boundaries

## Scope

**Applies when:**

- Adding or changing endpoints under `/api/metrics`
- Adding frontend features that call the backend
- Refactoring `backend/app/routes.py`
- Adding dashboard components that display metrics

**Does not apply when:** CSS-only changes with no data contract impact.

## Rationale

**Problem observed:** `routes.py` mixes models, mock generation, analytics, and handlers (~390 lines). Frontend uses inline `fetch` in `App.tsx` while eight backend endpoints are unused (Phase 2 → Architecture).

**Why this rule helps:** Defines where new code goes before the monolith becomes harder to extend — the most likely next tasks in this project.

## Requirements

### MUST

**Backend — add logic in this order:**

1. Pydantic model (in `routes.py`; extract to `models.py` when adding 2+ new models)
2. Pure helper or service function
3. Thin route handler: load mock data → filter → return with `response_model`

**Frontend — before adding a second API call:**

1. Create `frontend/src/lib/api/metrics.ts` with typed fetch functions
2. Add types to `financial-types.ts` if the response shape is new
3. Call API functions from `App.tsx` — never from chart/KPI leaf components

**API design:**

- Group under `/api/metrics/*` (existing: `facets`, `summary`, `categories/top`, `comparison`, `alerts`)
- Prefer query params (`start_date`, `end_date`, `category`, `operation_type`, `business_type`) over new path-only duplicates
- Return movement lists sorted by `create_date` via `ensure_chronological_order`

### SHOULD

- Extract to `backend/app/services/metrics.py` when adding **>30 lines** of non-route logic
- Consume an **existing** backend endpoint before proposing a new one (check `/docs` first)
- Cache `generate_mock_movements(seed=42)` at module level when touching mock performance

### MUST NOT

- Put `fetch()` in `frontend/src/components/dashboard/*`
- Feed the live dashboard from static frontend mock files
- Add `/api/metrics/b2x` routes when `business_type` query param suffices

## Repository anchors

| Status | Location | Notes |
|--------|----------|-------|
| Good example | `backend/app/main.py` | Thin entry: CORS + router only |
| Good example | `backend/app/routes.py` `get_metrics_facets` | Ready for filter UI |
| Good example | `frontend/src/components/dashboard/kpi-row.tsx` | Presentation only; no fetch |
| Known gap | `frontend/src/App.tsx` L15–21 | Inline fetch; extract first |
| Known gap | `backend/app/routes.py` | Monolithic; extract on next major task |
| Target file | `frontend/src/lib/api/metrics.ts` | **Create before Task A** |

## Task examples

See [rule-validation.md](./rule-validation.md) → **Task A** (date filters), **Task C** (alerts panel), **Task D** (mock cache)
