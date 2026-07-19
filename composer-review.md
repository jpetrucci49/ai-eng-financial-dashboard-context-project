# Project Review: Financial Metrics Dashboard

**Review date:** July 15, 2026  
**Reviewer:** Composer (Cursor AI Agent)  
**Repository:** `ai-eng-financial-dashboard-context-project`

---

## Executive Summary

This repository is a **4Geeks Academy AI Engineering exercise** — a financial metrics dashboard built with a React + TypeScript frontend and a FastAPI backend. The project serves mock financial data and renders KPI cards and charts in a single-page application.

The codebase is small (~39 tracked files), well-structured, and intentionally incomplete in several areas. Per the README, students are expected to use AI agents to inspect the project, document rules and a memory bank, and extend the application. The backend exposes a rich analytics API; the frontend currently consumes only a fraction of it.

---

## Architecture Overview

```
Browser
   │
   ▼
Frontend (React + Vite)  :5173
   │
   │  /api/* proxied to backend:8000
   ▼
Backend (FastAPI)        :8000
   │
   ▼
In-memory mock data (360 financial movements)
```

### Frontend

| Layer | Technology |
|-------|------------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3.8 |
| Icons | lucide-react |
| UI primitives | shadcn/ui-style (Card, Skeleton) |
| Testing | Vitest 4 |

**Key components:**

| Component | Role |
|-----------|------|
| `App.tsx` | Fetches data, computes KPIs and chart data, renders layout |
| `DashboardHeader` | Title and period badge |
| `KPIRow` / `KPICard` | Four KPI cards: income, outcome, profit, margin |
| `IncomeOutcomeChart` | Line chart for income vs. outcome |
| `ProfitPercentChart` | Line chart for profit margin percentage |

**API integration:** The frontend makes a single request to `GET /api/metrics`. The base URL defaults to a relative path; Vite's dev proxy forwards `/api` to `http://backend:8000` inside Docker Compose.

### Backend

| Layer | Technology |
|-------|------------|
| Framework | FastAPI |
| Server | Uvicorn (with `--reload`) |
| Validation | Pydantic |
| Debugging | debugpy on port 5678 |
| Testing | pytest, pytest-cov, httpx |

**Architecture notes:**

- All route logic lives in a single file (`backend/app/routes.py`, ~392 lines).
- No database — data is generated in memory via `generate_mock_movements(seed=42)`.
- Pydantic models are defined inline in the routes module.
- Mock data produces 360 movements (30 per month × 12 months), with dates relative to `date.today()`.

---

## API Surface

| Method | Endpoint | Description | Used by frontend |
|--------|----------|-------------|------------------|
| GET | `/health` | Health check | No |
| GET | `/api/metrics` | All movements (with optional filters) | **Yes** |
| GET | `/api/metrics/facets` | Available filter values and date range | No |
| GET | `/api/metrics/summary` | Aggregated totals by day/week/month | No |
| GET | `/api/metrics/categories/top` | Top N categories by operation type | No |
| GET | `/api/metrics/comparison` | Period-over-period net comparison | No |
| GET | `/api/metrics/alerts` | Outcome spike detection | No |
| GET | `/api/metrics/b2b` | B2B-only movements | No |
| GET | `/api/metrics/b2c` | B2C-only movements | No |

The backend is significantly more capable than the current UI. Eight of nine data endpoints are unused.

---

## Project Structure

```
ai-eng-financial-dashboard-context-project/
├── AGENTS.md                 # Agent guidance (points to .agents/, memory-bank)
├── README.md / README.es.md  # Bilingual documentation and run instructions
├── docker-compose.yml        # Dev orchestration (frontend + backend)
├── .gitignore
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── src/
│       ├── App.tsx
│       ├── components/dashboard/   # KPI cards, charts, header
│       ├── components/ui/          # Card, Skeleton
│       └── lib/                    # Types, utils, tests
└── backend/
    ├── Dockerfile
    ├── requirements.txt
    ├── app/
    │   ├── main.py           # FastAPI app + CORS
    │   └── routes.py         # All API routes and mock data logic
    └── tests/
        ├── conftest.py
        └── test_routes.py
```

---

## Docker Configuration

Both Dockerfiles target **local development**, not production deployment.

| Service | Base image | Exposed ports | Startup command |
|---------|------------|---------------|-----------------|
| Frontend | `node:24-alpine` | 5173 | Vite dev server |
| Backend | `python:3.13-slim` | 8000, 5678 | Uvicorn via debugpy with `--reload` |

**Compose configuration:**

- Bind mounts enable hot reload for both services.
- An anonymous volume preserves `node_modules` inside the frontend container.
- `depends_on` links frontend to backend (no healthcheck-based readiness).

**Gaps in Docker setup:**

- No healthchecks on services.
- No environment variable configuration in compose.
- debugpy exposed in the default backend command.
- No production build or multi-stage Dockerfile.

---

## Test Coverage

### Backend (`backend/tests/test_routes.py`)

15 test functions covering:

- Mock data generation (360 records, sorted output)
- Date filtering helpers
- All major API endpoints
- Query parameter filtering (category, operation type, business type, dates)

**Not tested:** Pure helper functions in isolation (`summarize_movements`, `detect_outcome_alerts`, etc.) — only exercised indirectly through route tests.

### Frontend (`frontend/src/lib/financial-utils.test.ts`)

5 test cases across three describe blocks:

- `computeKPIs` (2 tests)
- `computeMonthlyData` (1 test)
- Currency and percent formatters (2 tests)

**Not tested:** React components, `App.tsx` fetch logic, chart rendering.

### Tooling

- Frontend: `npm run test:coverage` (Vitest + v8 coverage)
- Backend: `pytest-cov` listed in requirements, but no coverage config or CI integration

---

## Configuration

| File | Purpose |
|------|---------|
| `frontend/.env.example` | Optional `VITE_API_BASE_URL` override |
| `.gitignore` | Ignores `.env*`, `node_modules`, `dist`, Python caches, venvs, coverage artifacts |
| `backend/requirements.txt` | Unpinned Python dependencies (installs latest compatible on each build) |
| `frontend/package.json` | Pinned Node dependencies via `package-lock.json` |

No backend environment file exists. The backend has no configurable environment variables.

---

## Agent and Documentation Setup

`AGENTS.md` directs AI agents to consult:

1. `./.agents/rules` — work instructions
2. `./.agents/skills` — agent skills
3. `./memory-bank` — project memory (if present)

| Expected path | Status |
|---------------|--------|
| `.agents/rules/` | **Not present** |
| `.agents/skills/` | **Not present** |
| `memory-bank/` | **Not present** |

Per the README, populating these directories is an intentional exercise deliverable for students.

---

## Gaps and Observations

### Functional gaps

| Area | Detail |
|------|--------|
| Frontend API usage | Only 1 of 9 endpoints consumed |
| UI controls | No date range, category, or B2B/B2C filters |
| Hardcoded period label | Header shows "2024 - Full Year" but backend generates rolling-year data |
| Unused code | `frontend/src/lib/mock-data.ts` is not imported anywhere |
| Routing | Single-page app; no React Router |
| Authentication | None; CORS allows all origins (`allow_origins=["*"]`) |
| Persistence | All data regenerated in memory per request |
| Language consistency | Error message in Spanish; rest of UI in English |

### Operational gaps

| Area | Detail |
|------|--------|
| CI/CD | No GitHub Actions or pre-commit hooks |
| Production deployment | Dev-only Dockerfiles; no build stage or static serving |
| Dependency pinning | Python packages unpinned in `requirements.txt` |
| API client | Raw `fetch` in `App.tsx`; no abstraction layer |
| Error handling | No error boundaries or retry logic in the frontend |
| Component tests | No React component or E2E test suite |

---

## Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Code structure | Strong | Clear separation of frontend/backend; consistent conventions |
| Backend completeness | High | Rich API with filtering, aggregation, alerts, and B2B/B2C split |
| Frontend completeness | Low | Minimal dashboard; most backend features unused |
| Test coverage | Moderate | Backend routes well tested; frontend limited to utility functions |
| Docker setup | Adequate | Works for local dev; not production-ready |
| Agent scaffolding | Incomplete | By design — student exercise deliverable |
| Documentation | Adequate | README covers setup; no architecture or API consumer docs |

---

## Recommendations

1. **Start Docker Desktop** before running `docker compose up --build`.
2. **Populate agent scaffolding** — create `.agents/rules/`, `.agents/skills/`, and `memory-bank/` per the README exercise goals.
3. **Wire up unused API endpoints** — facets, summary, comparison, and alerts would add significant dashboard value.
4. **Add UI filters** — date range, category, and business type selectors to leverage existing backend query parameters.
5. **Pin Python dependencies** — add version constraints to `requirements.txt` for reproducible builds.
6. **Add healthchecks** to `docker-compose.yml` so the frontend waits for a ready backend.
7. **Unify language** — align error messages with the rest of the English UI, or localize consistently.
8. **Remove dead code** — delete or integrate `frontend/src/lib/mock-data.ts`.

---

## Conclusion

This is a well-structured starter template for a financial dashboard exercise. The backend is feature-rich with mock analytics endpoints; the frontend is a minimal consumer showing KPIs and two charts. Agent scaffolding, memory bank, CI, production Docker configuration, and most API features remain for students to build or integrate.

The project is ready for local development once Docker Desktop is running. The immediate blocker (`Cannot connect to the Docker daemon`) is an environment issue, not a project code defect.
