# Global Conventions

## Scope

**Applies when:** Any application code or configuration in this repository is created or modified.

**Does not apply when:** Editing only `.agents/rules/**` or `docs/**` markdown — skip test-run requirements for doc-only edits.

## Rationale

**Problem observed:** Mixed-language UI copy, dead mock files, and duplicate API routes create confusion about the source of truth for financial data (Phase 2 → Naming, Architecture).

**Why this rule helps:** Keeps the dashboard exercise focused on wiring existing backend capabilities without accidental scope expansion.

## Requirements

### MUST

- Use shared domain terms in both stacks: `OperationType`, `Category`, `BusinessType`, `FinancialMovement`. Adding a field requires updating `backend/app/routes.py` models **and** `frontend/src/lib/financial-types.ts`.
- Keep KPI and aggregation math in pure functions (`frontend/src/lib/financial-utils.ts`, backend helpers). React components and route handlers orchestrate; they do not implement formulas.
- Use `seed=42` whenever generating mock movements in tests or demos.
- Run tests before finishing logic changes:
  - Backend: `cd backend && pytest`
  - Frontend: `cd frontend && npm test`
- Write user-visible UI strings in **English**. README may stay bilingual.

### SHOULD

- Match existing import style: `@/` alias in frontend; `from app.routes import ...` in backend tests.
- Remove unused files when found (e.g. `frontend/src/lib/mock-data.ts` has no imports).

### MUST NOT

- Add PostgreSQL, auth, or production deployment unless the task explicitly requests it.
- Add routes that differ only by one filter when a query param exists (see `/api/metrics/b2b` vs `business_type` on summary).
- Use empty `catch` blocks — surface a user message and retain the error for debugging.
- Hardcode dashboard period labels when `/api/metrics/facets` exposes dynamic date ranges.

## Repository anchors

| Status | Location | Notes |
|--------|----------|-------|
| Good example | `frontend/src/lib/financial-utils.ts` | Pure KPI/chart calculations |
| Good example | `frontend/src/lib/financial-types.ts` | Mirrors backend enums |
| Known gap | `frontend/src/App.tsx` L35–38 | Spanish error; empty `catch` |
| Known gap | `frontend/src/App.tsx` L49 | Hardcoded period vs rolling mock data |
| Known gap | `frontend/src/lib/mock-data.ts` | Unused; remove when cleaning |

## Task examples

See [rule-validation.md](./rule-validation.md) → **Task B** (error copy + period), **Task F** (dead code)
