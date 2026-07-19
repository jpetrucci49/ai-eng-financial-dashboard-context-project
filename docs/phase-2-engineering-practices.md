# Phase 2 — Engineering Practices Analysis

**Project:** Financial Metrics Dashboard  
**Date:** July 18, 2026  
**Phase:** 2 — Analyze engineering practices  
**Related:** Phase 1 summary in [`composer-review.md`](../composer-review.md)

This document reviews engineering practices in the codebase, groups findings by category, and defines a **proposed rule set** for Phase 3 implementation. It does not create `.agents/rules/` files — that is Phase 3.

---

## Method

Findings were derived by reading application source, tests, Docker configuration, and documentation. Each item cites verifiable evidence from the repository. Good practices are patterns worth preserving; risky practices are gaps or anti-patterns that a rule set should address.

---

## Architecture

### Good practices

1. **Clear frontend/backend separation** — Independent directories (`frontend/`, `backend/`), separate Dockerfiles, and orchestration via `docker-compose.yml` without cross-importing source trees.

2. **Pure business logic extracted from transport** — Backend helpers (`filter_movements`, `summarize_movements`) and frontend utilities (`computeKPIs`, `computeMonthlyData` in `frontend/src/lib/financial-utils.ts`) are testable without HTTP or React.

3. **Thin application entry point** — `backend/app/main.py` only configures CORS, mounts the router, and sets the app title; routing lives in `routes.py`.

4. **Component composition** — Dashboard UI is split into focused files under `frontend/src/components/dashboard/` (`kpi-row.tsx`, `income-outcome-chart.tsx`, etc.) rather than one monolithic view.

5. **Typed API contracts** — FastAPI routes declare `response_model`; frontend interfaces in `frontend/src/lib/financial-types.ts` mirror backend enums (`OperationType`, `Category`, `BusinessType`).

### Risky practices

1. **Monolithic routes module** — `backend/app/routes.py` (~390 lines) combines Pydantic models, mock generation, analytics helpers, and all handlers. Increases merge conflict risk and makes boundaries hard to enforce.

2. **Mock data regenerated on every request** — Each endpoint calls `generate_mock_movements(seed=42)` independently. Deterministic but wasteful; no module-level cache or injected data source.

3. **Duplicated B2B/B2C endpoints** — `/api/metrics/b2b` and `/api/metrics/b2c` repeat filtering already available via `business_type` on `/api/metrics/summary`. Endpoint proliferation without new capability.

4. **Frontend-backend contract underutilized** — Backend exposes nine data endpoints; frontend consumes one (`GET /api/metrics` in `frontend/src/App.tsx` L16). Unused API surface creates confusion about product scope.

5. **No API client layer** — `fetch` is called inline in `App.tsx` (L15–21). As endpoints grow, URL construction and error handling will duplicate across components.

---

## Naming and Conventions

### Good practices

1. **Intent-revealing function names** — Backend helpers use descriptive verbs: `ensure_chronological_order`, `detect_outcome_alerts`, `build_top_categories`.

2. **Consistent frontend file naming** — Dashboard components use kebab-case filenames with PascalCase exports (`kpi-row.tsx` → `KPIRow`).

3. **Private helper prefix** — Internal backend helpers use a leading underscore (`_build_movement`, `_year_for_month`).

4. **Literal types for domain enums** — Python `Literal` and TypeScript union types constrain valid category and operation values.

5. **Path alias for imports** — Vite and TypeScript `@/` alias (`frontend/vite.config.ts` L19–21) keeps imports stable as `src/` grows.

### Risky practices

1. **Hardcoded UI label vs. dynamic data** — `App.tsx` L49 passes `period="2024 - Full Year"` while mock data is generated relative to `date.today()` in `routes.py`.

2. **Mixed language in user-facing strings** — Error message in `App.tsx` L37 is Spanish; all other UI copy is English.

3. **Dead code retained** — `frontend/src/lib/mock-data.ts` exists but has no imports anywhere in the frontend tree.

4. **Silent error swallowing** — `App.tsx` L35 uses `catch ()` without logging or preserving the original error.

5. **Inconsistent dash in defaults** — `dashboard-header.tsx` default period uses an em dash (`2024 — Full Year`); `App.tsx` passes a hyphenated variant.

---

## Testing

### Good practices

1. **Deterministic test fixtures** — `generate_mock_movements(seed=42)` in `backend/tests/test_routes.py` produces reproducible outputs.

2. **Broad backend route coverage** — 15 tests in `test_routes.py` exercise health, filtering, facets, summary, comparison, alerts, and B2B/B2C endpoints.

3. **Behavior-focused assertions** — Tests verify sort order, filter correctness, and response shape keys rather than implementation details.

4. **Frontend edge-case coverage** — `financial-utils.test.ts` verifies zero-income profit margin and cross-year monthly ordering.

5. **Integration via TestClient** — Backend tests run against the real FastAPI app instance, validating the full request/response stack.

### Risky practices

1. **No component or integration tests on frontend** — React components, loading states, and fetch error UI are untested.

2. **Backend helpers tested only indirectly** — `detect_outcome_alerts` and `summarize_movements` lack dedicated unit tests.

3. **No CI pipeline** — Tests exist locally but are not enforced on pull requests.

4. **Hardcoded dates in comparison test** — `test_metrics_comparison_returns_delta_fields` uses fixed dates (`2025-03-01`) that may drift as mock data rolls with `date.today()`.

5. **No coverage thresholds** — `pytest-cov` and Vitest coverage tooling are present but no minimum coverage is configured.

---

## Documentation

### Good practices

1. **Bilingual README** — `README.md` and `README.es.md` support the 4Geeks Academy audience.

2. **Self-documenting API** — FastAPI auto-generates OpenAPI docs at `/docs` with query parameters and response schemas.

3. **Inline KPI helper text** — `kpi-row.tsx` includes `helperText` on each card explaining the metric.

4. **Environment template** — `frontend/.env.example` documents optional `VITE_API_BASE_URL`.

5. **Agent entry point** — `AGENTS.md` directs AI agents to rules, skills, and memory bank locations.

### Risky practices

1. **No API consumer guide** — README lists URLs but not which endpoints the dashboard uses or how to extend it.

2. **No architecture or data-flow doc in repo** — New contributors must read source to understand mock data → chart flow (Phase 1 review fills this gap externally).

3. **Debug port undocumented in README** — Backend exposes debugpy on port 5678 via Docker; README omits it.

4. **Agent scaffolding referenced but absent** — `AGENTS.md` points to `.agents/rules` and `memory-bank/` which do not exist yet (expected exercise deliverables).

5. **Phase deliverables not tracked in repo** — No index linking Phase 1 review to subsequent phase artifacts until students add them.

---

## Developer Experience (DX)

### Good practices

1. **One-command local startup** — `docker compose up --build` in README starts both services with hot reload via bind mounts.

2. **Vite proxy for API calls** — Dev server proxies `/api` to the backend, avoiding CORS configuration in Docker (`vite.config.ts` L11–16).

3. **Anonymous `node_modules` volume** — `docker-compose.yml` preserves container dependencies on bind mounts.

4. **Standard npm scripts** — Frontend exposes `dev`, `build`, `lint`, `test`, and `test:coverage`.

5. **TypeScript project references** — Separate `tsconfig.app.json` and `tsconfig.node.json` isolate app vs. tooling config.

### Risky practices

1. **Unpinned Python dependencies** — `backend/requirements.txt` lists packages without version pins; builds may not be reproducible.

2. **Vite proxy hardcoded to Docker hostname** — `vite.config.ts` L13 targets `http://backend:8000`, which fails for host-native `npm run dev` outside Compose.

3. **No compose healthchecks** — `depends_on` does not wait for backend readiness; frontend may fail its first API call on cold start.

4. **Dev-only Dockerfiles with no production path** — Both images run dev servers (Vite, uvicorn `--reload`, debugpy); no multi-stage build.

5. **No task runner** — Common workflows (test all, lint all) are not scripted at repo root.

---

## Security and Operations

### Good practices

1. **Query parameter validation** — FastAPI `Query` constraints enforce bounds (`limit` ge=1 le=20, `threshold` ge=0 on alert routes).

2. **Response model enforcement** — All routes declare `response_model`, ensuring output matches schemas.

3. **Secrets excluded from git** — `.gitignore` excludes `.env*` while allowing `.env.example`.

4. **No secrets in source** — No API keys or credentials hardcoded in the repository.

5. **Health endpoint** — `GET /health` supports basic liveness checks.

### Risky practices

1. **Permissive CORS with credentials** — `main.py` L8–12 sets `allow_origins=["*"]` with `allow_credentials=True`; insecure if auth is added later.

2. **Debug listener in default container command** — `backend/Dockerfile` starts debugpy on `0.0.0.0:5678` in all environments.

3. **No authentication** — All endpoints are public (acceptable for mock data only).

4. **No rate limiting** — No throttling if deployed beyond local dev.

5. **No dependency vulnerability scanning** — No Dependabot or audit step in CI.

---

## Summary matrix

| Category | Good practices | Risky practices |
|----------|:--------------:|:---------------:|
| Architecture | 5 | 5 |
| Naming & conventions | 5 | 5 |
| Testing | 5 | 5 |
| Documentation | 5 | 5 |
| Developer experience | 5 | 5 |
| Security & operations | 5 | 5 |

**Overall:** Strong starter template with clear stack separation and backend test coverage. Primary risks are dev-only security defaults, monolithic backend structure, frontend-backend feature mismatch, and missing operational guardrails.

---

## Proposed rule set (for Phase 3)

The following rules are **specifications** to implement as files under `.agents/rules/` in Phase 3. Each rule maps a risky practice to an enforceable convention while preserving identified good patterns.

### Rule 1 — Global conventions

| Attribute | Detail |
|-----------|--------|
| **Scope** | All repository changes |
| **Rationale** | Prevents mixed-language UX, dead code, and scope creep |
| **Preserve** | Shared domain vocabulary; pure calculation functions; deterministic `seed=42` in tests |
| **Require** | Sync TypeScript types when backend models change; English UI copy; run pytest/npm test before finishing logic changes |
| **Forbid** | Databases/auth/production infra without explicit task; duplicate filter-only routes; empty `catch` blocks; hardcoded period labels contradicting API data |

### Rule 2 — API and module boundaries

| Attribute | Detail |
|-----------|--------|
| **Scope** | API endpoints, frontend data fetching, refactors of `routes.py` |
| **Rationale** | Addresses monolithic routes, unused endpoints, inline fetch |
| **Preserve** | Thin `main.py`; REST grouping under `/api/metrics/*`; sorted movement responses |
| **Require** | Create `frontend/src/lib/api/metrics.ts` before adding a second API consumer; thin route handlers; prefer query params over new paths |
| **Forbid** | `fetch()` in dashboard components; static mock files feeding the live dashboard; new B2x-only routes when `business_type` param exists |

### Rule 3 — Backend FastAPI

| Attribute | Detail |
|-----------|--------|
| **Scope** | `backend/**` |
| **Rationale** | Keeps new backend work aligned with existing FastAPI patterns |
| **Preserve** | `APIRouter`; Pydantic `response_model`; `Literal` enums; `Query` bounds |
| **Require** | pytest case for every new endpoint or filter; `seed=42` in handlers; pin versions when touching `requirements.txt` |
| **Forbid** | Raw dict responses; ORM/database without explicit task; widening CORS without documentation |

### Rule 4 — Frontend dashboard

| Attribute | Detail |
|-----------|--------|
| **Scope** | `frontend/src/**`, `vite.config.ts` |
| **Rationale** | Next features (filters, alerts) touch the same files; prevents sprawl |
| **Preserve** | Component composition; `loading` + Skeleton; `aria-label` on sections; formatters in `financial-utils.ts` |
| **Require** | One widget per file in `components/dashboard/`; charts receive pre-computed props only; extract fetch to API module |
| **Forbid** | Spanish user errors in English UI; fetch in leaf components; hardcoded period strings |

### Rule 5 — Testing

| Attribute | Detail |
|-----------|--------|
| **Scope** | `backend/tests/**`, `frontend/src/**/*.test.ts` |
| **Rationale** | Maps change types to minimum test expectations |
| **Preserve** | Deterministic fixtures; TestClient integration; Vitest for utils |
| **Require** | New backend route → status 200 + shape + one filter test; new util → happy path + edge case; bug fix → regression test |
| **Forbid** | Skipping tests for new `/api/metrics/*` handlers; network-dependent unit tests |

### Rule 6 — Docker and dependencies

| Attribute | Detail |
|-----------|--------|
| **Scope** | Compose, Dockerfiles, `requirements.txt`, CORS, README run instructions |
| **Rationale** | Local dev reliability and dev-only security awareness |
| **Preserve** | Compose as primary workflow; `/health` endpoint; `.env.example`; lockfile for npm |
| **Require** | Document ports 5173, 8000, 5678; never commit `.env`; add backend healthcheck when editing compose |
| **Forbid** | Committing secrets; production Docker half-implementations; removing `node_modules` anonymous volume without reason |

---

## Proposed Phase 3 file layout

When implementing rules in Phase 3, create:

```text
.agents/rules/
├── README.md
├── 00-global-conventions.md
├── 01-api-and-module-boundaries.md
├── 02-backend-fastapi.md
├── 03-frontend-dashboard.md
├── 04-testing.md
└── 05-docker-and-dependencies.md
```

Each file should include **Scope**, **Rationale**, **Requirements** (MUST/SHOULD/MUST NOT), and **Repository anchors** pointing to real files (e.g. `App.tsx` L35–38 for error handling gap).

Optional in Phase 3: `rule-validation.md` walking real tasks (date filters, alerts panel, compose healthcheck) through the rules to confirm they guide actionable work.

---

## Phase boundaries

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | Project summary (`composer-review.md`) | Complete |
| 2 | Practices analysis + proposed rules (this document) | Complete |
| 3 | `.agents/rules/` implementation + validation | Not started |
| 4 | `memory-bank/` product/tech/status docs | Not started |

---

## Evidence index

| Finding | Primary evidence |
|---------|------------------|
| Inline fetch | `frontend/src/App.tsx` L15–21 |
| Spanish error | `frontend/src/App.tsx` L37 |
| Hardcoded period | `frontend/src/App.tsx` L49 |
| Permissive CORS | `backend/app/main.py` L8–12 |
| Unpinned deps | `backend/requirements.txt` |
| Docker-only proxy | `frontend/vite.config.ts` L13 |
| 15 backend tests | `backend/tests/test_routes.py` |
| 5 frontend util tests | `frontend/src/lib/financial-utils.test.ts` |
| Unused mock file | `frontend/src/lib/mock-data.ts` (no imports) |
