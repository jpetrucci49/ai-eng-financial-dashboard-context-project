# Testing

## Scope

**Applies when:** Adding or changing behavior in `backend/app/**` or `frontend/src/**` (excluding pure CSS).

**Does not apply when:** Documentation-only edits.

## Rationale

**Problem observed:** Backend routes are well covered; frontend has utility tests only; some tests use hardcoded dates (Phase 2 → Testing).

**Why this rule helps:** Maps each change type to a minimum test agents can run with existing pytest + vitest — no extra setup.

## Requirements

### MUST — minimum by change type

| Change | Minimum test |
|--------|--------------|
| New backend route or query param | Status 200, response shape keys, one filter assertion |
| New backend pure function | Fixed input/output (may live in `test_routes.py` until split) |
| New frontend util in `lib/` | Co-located `*.test.ts`: happy path + one edge case |
| Bug fix | Regression test that fails without the fix |

### MUST — style

- Backend: `TestClient(app)`; name tests `test_<unit>_<behavior>`
- Frontend: Vitest `describe`/`it`; explicit fixtures (see `financial-utils.test.ts`)
- Mock data: `generate_mock_movements(seed=42)`
- No network calls in unit tests

### SHOULD

- Derive backend test dates from `/api/metrics` responses, not fixed `"2025-03-01"`
- Run `pytest` / `npm test` before marking work complete

### MUST NOT

- Skip tests for new `/api/metrics/*` handlers
- Add component render tests until `@testing-library/react` is in `frontend/package.json` (not installed today)

## Repository anchors

| Status | Location | Notes |
|--------|----------|-------|
| Good example | `test_routes.py` `test_metrics_endpoint_filters_by_category` | Filter assertion pattern |
| Good example | `financial-utils.test.ts` zero-income case | Edge case pattern |
| Weak example | `test_metrics_comparison_returns_delta_fields` | Hardcoded dates |
| Not available | Component render tests | Requires testing-library |

## Commands

```bash
cd backend && pytest
cd frontend && npm test
```

## Task examples

See [rule-validation.md](./rule-validation.md) → **Task A**, **Task C**, **Task F**
