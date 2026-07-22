# Finance Dashboard Features — Data Contracts

API and UI contract reference for Features 1–3 defined in [`SPECS.md`](../../SPECS.md).

**Type definitions:**

| File | Contents |
|------|----------|
| [`api-types.ts`](./api-types.ts) | Response interfaces |
| [`param-types.ts`](./param-types.ts) | Request query parameter types |
| [`components.md`](./components.md) | Component breakdowns and props |

**Backend source of truth:** `backend/app/routes.py` (Pydantic models and `Query` parameters).

---

## Naming convention: URL vs API

| Layer | Date keys | Example |
|-------|-----------|---------|
| Browser URL (Features 1–3) | camelCase | `?startDate=2024-01-01&endDate=2024-06-30` |
| FastAPI query string | snake_case | `?start_date=2024-01-01&end_date=2024-06-30` |

The API client must translate camelCase URL state to snake_case when calling the backend. Types in `param-types.ts` use **snake_case** because they describe wire params sent to FastAPI.

---

## Feature 1 — Date range filter (home dashboard)

### Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/metrics/facets` | Load `min_date` / `max_date` hint and valid enum values |
| GET | `/api/metrics` | Refetch movements for KPIs and charts with date filters |

### Request parameters

**`GET /api/metrics/facets`** — no query parameters.

**`GET /api/metrics`** — extends [`DateRangeFilter`](./param-types.ts):

| Param | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `start_date` | `string` | No | none | `YYYY-MM-DD`; inclusive lower bound |
| `end_date` | `string` | No | none | `YYYY-MM-DD`; inclusive upper bound |

Existing optional params (`category`, `operation_type`) are unchanged; Feature 1 does not expose them in the UI.

### Response shapes

| Endpoint | Type | Notes |
|----------|------|-------|
| `/api/metrics/facets` | [`FacetsResponse`](./api-types.ts) | Single object |
| `/api/metrics` | `FinancialMovement[]` | Existing type in `@/lib/financial-types` |

### Defaults and valid values

- Empty date filter → all movements returned (backend returns full seeded dataset).
- Facets dates reflect the mock dataset bounds, not calendar year labels in the UI header.

### Edge cases and required UI behavior

1. **Facets fail but metrics succeed** — Show date inputs without min/max hint; allow manual entry. Display non-blocking warning: "Could not load available date range."
2. **Start date after end date** — Block refetch; show inline validation on the filter component. Do not write invalid pair to URL.
3. **URL contains malformed date** — Strip invalid params on page load; treat as unset.
4. **Only start or only end set** — Send single param to API; backend filters open-ended (verified in `filter_movements_by_date`).

### Assumptions to validate during implementation

- Facets endpoint is called once on home dashboard mount (not on every date keystroke).
- Home charts recompute from filtered movements client-side via existing `computeKPIs` / `computeMonthlyData` helpers.

---

## Feature 2 — Anomaly alerts table (home dashboard)

### Endpoint

| Method | Path |
|--------|------|
| GET | `/api/metrics/alerts` |

### Request parameters

Uses [`AlertsParams`](./param-types.ts):

| Param | Type | Required | Default | Constraints |
|-------|------|----------|---------|-------------|
| `threshold` | `number` | No | `0.3` | Backend: `>= 0`; UI clamps to `[0.01, 1.0]` |
| `start_date` | `string` | No | none | `YYYY-MM-DD` from shared date filter |
| `end_date` | `string` | No | none | `YYYY-MM-DD` from shared date filter |
| `group_by` | `"day" \| "week" \| "month"` | No | `"month"` | Not exposed in UI; backend default applies |
| `business_type` | `"B2B" \| "B2C"` | No | none | Not exposed in UI |

### Response shape

| Type | Description |
|------|-------------|
| [`AlertsResponse`](./api-types.ts) | JSON array of [`AlertEntry`](./api-types.ts) |

### Field semantics

| Field | Meaning |
|-------|---------|
| `period` | Bucket label; with default `group_by=month`, format is `YYYY-MM` |
| `outcome_total` | Sum of outcome movements in that bucket |
| `baseline_average` | Mean outcome of **all prior buckets** in the filtered series (not last 3 only) |
| `increase_ratio` | `(outcome_total - baseline_average) / baseline_average` when baseline > 0 |

### Edge cases and required UI behavior

1. **Empty alerts array** — Render [`AnomalyAlertsEmptyState`](./components.md) with exact copy from component spec. Do not show table headers only.
2. **Threshold clamped** — When user enters `0` or `2`, clamp and show inline validation message before debounced refetch.
3. **Date range excludes all outcome spikes** — Empty state (same as no alerts); not an error.
4. **API error** — Section-level error banner in English; keep threshold input enabled for retry.
5. **Very large increase_ratio** — Display as percentage with `+` prefix; red styling for any value > 0.

### Assumptions to validate during implementation

- UI column "Rolling Avg (prev 3)" maps to `baseline_average`; label is simplified display copy (see JSDoc on `AlertEntry.baseline_average`).
- Debounce threshold changes (~300ms) before calling the API to avoid request storms.
- Alerts respect shared URL date filter from Feature 1 on the home page.

---

## Feature 3 — B2B vs B2C comparison view

### Endpoints

| Method | Path | Calls per page load |
|--------|------|---------------------|
| GET | `/api/metrics/facets` | 1 (shared date hint) |
| GET | `/api/metrics/categories/top` | 2 (one per segment) |

### Request parameters

**Facets** — same as Feature 1.

**Top categories** — uses [`TopCategoriesParams`](./param-types.ts):

| Param | Type | Required | Feature 3 value | Constraints |
|-------|------|----------|-----------------|-------------|
| `operation_type` | `"income" \| "outcome"` | No | `"income"` | Default backend: `"outcome"` |
| `limit` | `number` | No | `5` | Integer `1`–`20` |
| `start_date` | `string` | No | from URL | `YYYY-MM-DD` |
| `end_date` | `string` | No | from URL | `YYYY-MM-DD` |
| `business_type` | `"B2B" \| "B2C"` | No | `"B2B"` or `"B2C"` per panel | Required for side-by-side comparison |

Example B2B request:

```http
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B&start_date=2024-01-01&end_date=2024-12-31
```

Example B2C request: same with `business_type=B2C`.

### Response shapes

| Endpoint | Type |
|----------|------|
| `/api/metrics/facets` | [`FacetsResponse`](./api-types.ts) |
| `/api/metrics/categories/top` | [`TopCategoriesResponse`](./api-types.ts) |

Each panel consumes one `TopCategoriesResponse` array.

### Chart data derivation

| Chart point | Calculation |
|-------------|-------------|
| B2B bar | Sum of `total_amount` in B2B `TopCategoriesResponse` (≤ 5 rows) |
| B2C bar | Sum of `total_amount` in B2C `TopCategoriesResponse` (≤ 5 rows) |

This is **top-category partial income**, not guaranteed full segment income. Document in UI helper text if totals seem low.

### Edge cases and required UI behavior

1. **Panel returns zero rows** — Show panel empty state: "No income categories found for this period." Hide table; chart bar value = 0.
2. **One panel empty, other populated** — Populated panel shows table; empty panel shows empty state; chart still renders both bars.
3. **Both panels fail API** — Full-page error with retry; date filter remains interactive.
4. **Single panel fails** — Error inside failed panel only; successful panel still renders.
5. **Date filter narrows to zero movements** — Both panels likely empty; chart shows empty state message.
6. **Category `"sales"` dominates B2C** — Table may show one category at 100% of group total; formatting still applies.

### Assumptions to validate during implementation

- Income categories for outcomes-only categories (e.g. `suppliers`) never appear when `operation_type=income` (backend filters by operation type).
- Parallel fetch of B2B and B2C top-category requests is acceptable (two concurrent GETs).
- Navigation entry and route `/dashboard/b2b-b2c` must be added (React Router or equivalent — not present in repo today).
- Percent-of-group column uses sum of displayed rows only, not `/api/metrics/summary`.

---

## Cross-feature dependencies

```text
Feature 1 (date range URL state)
    │
    ├──► Home dashboard metrics + charts (GET /api/metrics)
    ├──► Feature 2 alerts (GET /api/metrics/alerts + DateRangeFilter)
    └──► Feature 3 page (GET /api/metrics/categories/top × 2 + DateRangeFilter)
```

Facets (`GET /api/metrics/facets`) supports Features 1 and 3 date hints; it is not required for Feature 2 table data.

---

## TypeScript strictness

- Import feature types from `frontend/specs/` during implementation (or re-export from `@/lib/types` if preferred).
- Do not use `any`, `unknown`, or un typed `object` for API payloads.
- Extend existing domain unions (`OperationType`, `Category`, `BusinessType`) from `@/lib/financial-types` — do not fork conflicting literals.

---

## Verification checklist (implementation phase)

- [ ] API client maps URL `startDate`/`endDate` → `start_date`/`end_date`
- [ ] All date inputs emit `YYYY-MM-DD`
- [ ] Feature 2 threshold clamped to `[0.01, 1.0]`
- [ ] Feature 3 fires two `categories/top` requests with distinct `business_type`
- [ ] Empty states use exact copy from `components.md`
- [ ] Loading and error states on every async section
- [ ] ARIA labels on tables, charts, and filter controls
