# Product Overview

**Last updated:** July 19, 2026  
**Evidence sources:** `README.md`, `frontend/src/`, `backend/app/routes.py`, `composer-review.md`

---

## What this product is

A **Financial Metrics Dashboard** — a single-page web application that displays executive financial KPIs and charts from mock transaction data. It is a 4Geeks Academy AI Engineering exercise starter template (`README.md` L18–26).

There is **no database** and **no authentication**. All financial data is generated in memory on the backend per request.

---

## Domain model

Each **financial movement** record contains:

| Field | Type | Values (evidence: `routes.py` L22–27, `financial-types.ts`) |
|-------|------|---------------------------------------------------------------|
| `create_date` | date / ISO string | Transaction date |
| `amount` | number | Monetary amount |
| `operation_type` | enum | `income`, `outcome` |
| `category` | enum | `suppliers`, `sales`, `operational`, `administrative`, `others` |
| `business_type` | enum | `B2B`, `B2C` |

Mock data generator (`generate_mock_movements` in `routes.py` L94–104):

- **360 movements** — 30 per month × 12 months
- **Deterministic** when `seed=42` is used (all route handlers use this seed)
- Dates are relative to `date.today()` via `_year_for_month` logic

---

## User-facing features (implemented)

Evidence: `frontend/src/App.tsx`, `frontend/src/components/dashboard/`

| Feature | Description | Data source |
|---------|-------------|-------------|
| Dashboard header | Title, subtitle, period badge | Static prop `period="2024 - Full Year"` (`App.tsx` L49) |
| KPI row (4 cards) | Total income, total outcome, profit, profit margin | Client-side `computeKPIs()` from `/api/metrics` response |
| Income vs. outcome chart | Line chart over time | Client-side `computeMonthlyData()` |
| Profit margin chart | Profit % line chart over time | Client-side `computeMonthlyData()` |
| Loading skeletons | Placeholder UI while fetching | `loading` prop on KPI/chart components |
| Error banner | Shown when fetch fails | Spanish message (`App.tsx` L37) |

---

## API capabilities (backend)

The backend exposes **10 GET routes** (`routes.py` L243–391):

| Endpoint | Purpose |
|----------|---------|
| `/health` | Liveness check |
| `/api/metrics` | All movements (optional date/category/type filters) |
| `/api/metrics/facets` | Filter options and min/max dates |
| `/api/metrics/summary` | Aggregates by day/week/month |
| `/api/metrics/categories/top` | Top N categories by operation type |
| `/api/metrics/comparison` | Period-over-period net comparison |
| `/api/metrics/alerts` | Outcome spike detection |
| `/api/metrics/b2b` | B2B-only movements |
| `/api/metrics/b2c` | B2C-only movements |

OpenAPI documentation is auto-generated at `http://localhost:8000/docs` (FastAPI default).

---

## Frontend–backend integration today

- **One endpoint consumed:** `GET /api/metrics` (`App.tsx` L16)
- **Fetch mechanism:** Inline `fetch()` in `App.tsx` L15–21 — no dedicated API client module yet
- **Dev proxy:** Vite forwards `/api` → `http://backend:8000` inside Docker (`vite.config.ts` L11–16)
- **Optional override:** `VITE_API_BASE_URL` documented in `frontend/.env.example`

Eight data endpoints exist on the backend but are **not wired to the UI**.

---

## Architecture (runtime)

```text
Browser → Frontend (Vite/React :5173)
              │  /api/* proxied
              ▼
          Backend (FastAPI :5678 debug, :8000 API)
              │
              ▼
          In-memory mock movements (seed=42)
```

Orchestrated locally via `docker compose up --build` (`README.md` L41–50).

---

## Agent and documentation artifacts

| Artifact | Location | Status |
|----------|----------|--------|
| Agent rules | `.agents/rules/` | 6 rule files + validation |
| Phase 1 review | `composer-review.md` | Complete |
| Phase 2 analysis | `docs/phase-2-engineering-practices.md` | Complete |
| Memory bank | `memory-bank/` | This directory |
| Agent skills | `.agents/skills/` | Not created |

---

## Intended audience

Students in 4Geeks Academy AI Engineering programs extending the dashboard with AI agent assistance (`README.md` L54). The README instructs students to fork, inspect with an AI agent, document rules and memory, and refine until conventions fit the workflow.
