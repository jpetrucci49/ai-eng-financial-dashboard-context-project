# Backend FastAPI

## Scope

**Applies when:** Editing any file under `backend/`.

**Does not apply when:** Frontend-only or agent-documentation changes.

## Rationale

**Problem observed:** Unpinned dependencies and permissive CORS are acceptable for local mock data but risky if the API evolves (Phase 2 → Security, DX).

**Why this rule helps:** New backend work can copy patterns directly from existing handlers in `routes.py`.

## Requirements

### MUST

- Register routes on `APIRouter` in `routes.py`; mount via `app.include_router(router)` in `main.py`
- Declare `response_model=` on every GET handler
- Use `Literal` types for domain enums — not bare `str`
- Constrain numeric query params (see `get_top_categories` `limit` ge=1 le=20; `get_metrics_alerts` `threshold` ge=0)
- Call `generate_mock_movements(seed=42)` in handlers; sort movement lists with `ensure_chronological_order`
- Add a pytest case in `backend/tests/test_routes.py` for every new endpoint or filter

### SHOULD

- Keep route bodies under ~15 lines: generate → filter → transform → return
- Pin versions when touching `requirements.txt` (`package==x.y.z`)
- Derive test dates from API responses instead of hardcoding `"2025-03-01"`

### MUST NOT

- Return raw dicts without Pydantic models
- Add database/ORM code without an explicit persistence task
- Enable debugpy in non-dev Dockerfile stages
- Widen CORS without noting it in commit message or future memory docs

## Repository anchors

| Status | Location | Notes |
|--------|----------|-------|
| Good example | `routes.py` `get_top_categories` | `response_model`, bounded `limit` |
| Good example | `routes.py` `filter_movements` | Reusable filter pipeline |
| Good example | `tests/test_routes.py` | 15 tests; copy for new endpoints |
| Known gap | `requirements.txt` | Unpinned packages |
| Known gap | `main.py` L8–12 | `allow_origins=["*"]` + `allow_credentials=True` |
| Known gap | `backend/Dockerfile` | debugpy on `0.0.0.0:5678` always on |

## Pattern for new endpoints

```python
@router.get("/api/metrics/example", response_model=list[MetricsSummaryItem])
def get_example(
    group_by: GroupBy = Query(default="month"),
    start_date: date | None = Query(default=None),
) -> list[MetricsSummaryItem]:
    movements = generate_mock_movements(seed=42)
    filtered = filter_movements(movements, start_date, None, None, None)
    return summarize_movements(filtered, group_by)
```

## Task examples

See [rule-validation.md](./rule-validation.md) → **Task C** (reuse alerts endpoint), **Task D** (mock cache)
