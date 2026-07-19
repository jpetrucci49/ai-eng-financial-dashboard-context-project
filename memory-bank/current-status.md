# Current Status

**Last updated:** July 19, 2026  
**Evidence sources:** Application source, tests, `docs/phase-2-engineering-practices.md`, `.agents/rules/rule-validation.md`

---

## Exercise phase completion

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | Project summary | ✅ `composer-review.md` |
| 2 | Engineering practices analysis | ✅ `docs/phase-2-engineering-practices.md` |
| 3 | Agent rules + validation | ✅ `.agents/rules/` |
| 4 | Project memory bank | ✅ `memory-bank/` (this directory) |

---

## Implemented features

### Dashboard (frontend)

| Feature | Status | Evidence |
|---------|--------|----------|
| KPI cards (income, outcome, profit, margin) | ✅ | `kpi-row.tsx`, `kpi-card.tsx` |
| Income vs. outcome line chart | ✅ | `income-outcome-chart.tsx` |
| Profit margin line chart | ✅ | `profit-percent-chart.tsx` |
| Loading skeletons | ✅ | `Skeleton` in KPI/chart components |
| Error state on fetch failure | ✅ | `App.tsx` L51–55 |
| Date/category/B2B filters in UI | ❌ | No filter components |
| Alerts panel | ❌ | Backend endpoint exists; no UI |
| Dynamic period label | ❌ | Hardcoded `"2024 - Full Year"` (`App.tsx` L49) |

### API (backend)

| Capability | Status | Evidence |
|------------|--------|----------|
| Health check | ✅ | `GET /health` |
| Raw movements + filters | ✅ | `GET /api/metrics` |
| Facets (filter discovery) | ✅ | `GET /api/metrics/facets` |
| Period summaries | ✅ | `GET /api/metrics/summary` |
| Top categories | ✅ | `GET /api/metrics/categories/top` |
| Period comparison | ✅ | `GET /api/metrics/comparison` |
| Outcome alerts | ✅ | `GET /api/metrics/alerts` |
| B2B / B2C split endpoints | ✅ | `GET /api/metrics/b2b`, `/b2c` |
| Persistence (database) | ❌ | In-memory mock only |
| Authentication | ❌ | Open CORS, public routes |

### Frontend API consumption

| Endpoint | Used by UI |
|----------|:----------:|
| `GET /api/metrics` | ✅ |
| All other `/api/metrics/*` | ❌ |

### Tests

| Suite | Count | Coverage gap |
|-------|-------|--------------|
| Backend route tests | 15 | Helper functions tested only indirectly |
| Frontend util tests | 5 | No component or integration tests |
| CI enforcement | 0 | No GitHub Actions |

### DevOps

| Item | Status |
|------|--------|
| Docker Compose local dev | ✅ Works with `docker compose up --build` |
| Hot reload (bind mounts) | ✅ |
| Compose healthchecks | ❌ |
| Production deployment | ❌ Dev Dockerfiles only |
| Pinned Python deps | ❌ |

---

## Known gaps

### Functional

1. **Frontend uses 1 of 9 data endpoints** — richest work is wiring existing API to UI (`.agents/rules/01-api-and-module-boundaries.md`).
2. **No API client module** — `fetch` inline in `App.tsx`; should become `frontend/src/lib/api/metrics.ts`.
3. **Hardcoded period label** — contradicts rolling mock data dates.
4. **Spanish error message** — rest of UI is English (`App.tsx` L37).
5. **Unused dead code** — `frontend/src/lib/mock-data.ts` has no imports.
6. **No user filters** — date range, category, business type selectors missing despite backend support.

### Technical debt

1. **Monolithic `routes.py`** — models, mock data, analytics, and handlers in one file (~390 lines).
2. **Mock data regenerated per request** — deterministic but wasteful; no module cache.
3. **Duplicated B2B/B2C routes** — overlap with `business_type` filter on summary.
4. **Permissive CORS + credentials** — `main.py` L8–12; risky if auth added later.
5. **debugpy in default Docker CMD** — port 5678 always exposed.
6. **Vite proxy Docker-only** — `backend:8000` fails for host-native `npm run dev`.

### Documentation / agent

1. **No `.agents/skills/`** — referenced in `AGENTS.md` and README but not created.
2. **Debug port 5678** — not documented in README run instructions.

---

## Next priorities

Ordered by impact and alignment with `.agents/rules/rule-validation.md` validated tasks:

| Priority | Task | Rules | Effort |
|----------|------|-------|--------|
| 1 | Create `lib/api/metrics.ts`; extract fetch from `App.tsx` | 01, 03 | Small |
| 2 | Fix English error copy + dynamic period from facets | 00, 03 | Small |
| 3 | Add date range filter UI (Task A) | 01, 03, 04 | Medium |
| 4 | Add alerts panel (Task C) | 01, 03 | Medium |
| 5 | Add Compose backend healthcheck (Task E) | 05 | Small |
| 6 | Delete unused `mock-data.ts` (Task F) | 00, 01 | Trivial |
| 7 | Cache mock data in backend (Task D) | 01, 02 | Small |
| 8 | Pin Python dependencies | 02, 05 | Small |
| 9 | Extract backend services from `routes.py` | 01, 02 | Medium |

---

## Environment notes

- **Docker Desktop** must be running before `docker compose up --build`.
- Duplicate Docker networks named `*_default` can block Compose startup; remove duplicates if encountered.
- Frontend proxy requires Docker service name `backend` unless `VITE_API_BASE_URL` is set.

---

## Decisions to preserve

Documented in `.agents/rules/` and validated in Phase 3:

- Deterministic mock data via `seed=42`
- Shared domain types across frontend and backend
- Pure utility functions for KPI/chart math
- Docker Compose as primary local dev path
- Consume existing backend endpoints before adding new routes
- English UI copy for user-facing strings

---

## When to update this document

Update `current-status.md` when:

- A new dashboard feature ships (filters, alerts, etc.)
- API endpoints are added or consumed
- Test counts or CI setup change
- Docker/deployment configuration changes
- A validated task from `rule-validation.md` is completed — move it from priorities to implemented
