# Component Specifications

Implementation guide for the three finance dashboard features defined in [`SPECS.md`](../../SPECS.md). These are **specifications only** — no React implementation in this phase.

Types referenced below live in [`api-types.ts`](./api-types.ts) and [`param-types.ts`](./param-types.ts).

---

## Shared conventions

| Topic | Rule |
|-------|------|
| Date values | Always `YYYY-MM-DD` strings in state, URL params, and API requests |
| Date inputs | Native `<input type="date">` or shadcn/ui DatePicker equivalent |
| Currency | Use existing `formatCurrency` from `@/lib/financial-utils` |
| Percentages | One decimal place unless noted; prefix positive spikes with `+` |
| Loading | Skeleton or spinner; disable inputs while fetching |
| Errors | User-friendly English message; preserve error for logging |
| Accessibility | `aria-label` on sections, tables, and form controls; keyboard-navigable inputs |
| Responsive | Mobile-first; stack side-by-side layouts below `xl` breakpoint |

### URL date query params (Features 1–3)

Browser URL keys use **camelCase** for readability:

| URL key | Maps to API param | Type |
|---------|-------------------|------|
| `startDate` | `start_date` | `YYYY-MM-DD` or absent |
| `endDate` | `end_date` | `YYYY-MM-DD` or absent |

Partial selection rules (Feature 1):

| `startDate` | `endDate` | Filter behavior |
|:-----------:|:---------:|-----------------|
| empty | empty | No date filter (all historical data) |
| set | empty | From `startDate` onward (inclusive) |
| empty | set | Through `endDate` (inclusive) |
| set | set | Closed interval `[startDate, endDate]` |

Invalid URL dates (malformed strings) should be ignored and cleared from the URL on load.

---

## Feature 1 — Date range filter

### `DateRangeFilter`

**File (implementation):** `frontend/src/components/dashboard/date-range-filter.tsx`

**Purpose:** Two optional date inputs above existing KPI/charts on the home dashboard; syncs filter to URL and triggers data refetch.

#### Props

```typescript
interface DateRangeFilterProps {
  /**
   * Current inclusive start date from URL/state.
   * Format: `YYYY-MM-DD`. `undefined` when input is empty.
   */
  startDate?: string

  /**
   * Current inclusive end date from URL/state.
   * Format: `YYYY-MM-DD`. `undefined` when input is empty.
   */
  endDate?: string

  /**
   * Available bounds from `GET /api/metrics/facets`.
   * Used for hint text and `min`/`max` attributes on date inputs.
   */
  facets: FacetsResponse | null

  /** True while facets or dependent metrics are loading. */
  loading?: boolean

  /**
   * Called when either input changes after a valid parse.
   * Pass `undefined` for a cleared field.
   */
  onChange: (range: { startDate?: string; endDate?: string }) => void
}
```

#### Layout

```text
┌─────────────────────────────────────────────────────────────┐
│  [ Start date ▼ ]   [ End date ▼ ]                          │
│  Available data: {min_date} to {max_date}   (from facets)   │
└─────────────────────────────────────────────────────────────┘
```

- Place **above** `DashboardHeader` or immediately below it — above KPI row and charts.
- Hint line format: `Available data: 2023-01-01 to 2025-06-30` using `facets.min_date` and `facets.max_date`.
- When `facets` is null and not loading, omit hint or show "Available data: loading…".

#### Input behavior

- `<input type="date">` with `min={facets.min_date}` and `max={facets.max_date}` when facets loaded.
- **Start only:** pass only `start_date` to metrics API; leave end open.
- **End only:** pass only `end_date` to metrics API; leave start open.
- **Validation:** If user sets `startDate > endDate`, show inline error: "Start date must be on or before end date." Do not refetch until valid or one field is cleared.
- On valid change: update URL (`?startDate=&endDate=`) and refetch home dashboard data (`GET /api/metrics` with mapped snake_case params).

#### Supporting hook (implementation note)

`useDateRangeFromUrl()` — read/write `startDate`/`endDate` search params; not part of this spec file set but expected during implementation.

---

## Feature 2 — Anomaly alerts table

### `AnomalyAlertsSection`

**File (implementation):** `frontend/src/components/dashboard/anomaly-alerts-section.tsx`

**Purpose:** Section wrapper with title, threshold control, and table below home dashboard charts.

#### Props

```typescript
interface AnomalyAlertsSectionProps {
  /** Alerts returned from the API for the current threshold and date range. */
  alerts: AlertEntry[]

  /** Current threshold ratio (0.01–1.0). Controlled by parent/URL state. */
  threshold: number

  /** Shared date range from Feature 1 (URL camelCase form). */
  dateRange: { startDate?: string; endDate?: string }

  loading?: boolean
  error?: string | null

  /** Debounced threshold updates (300ms recommended). */
  onThresholdChange: (threshold: number) => void
}
```

#### Layout

```text
┌─────────────────────────────────────────────────────────────┐
│  Spending Anomalies                                         │
│  Spike threshold (ratio): [ 0.3 ]                           │
│  ┌──────────┬──────────────────┬──────────────────┬────────┐│
│  │ Period   │ Recorded Outcome │ Rolling Avg …    │ % Inc. ││
│  ├──────────┼──────────────────┼──────────────────┼────────┤│
│  │ 2025-06  │ $12,400          │ $8,200           │ +51.2% ││
│  └──────────┴──────────────────┴──────────────────┴────────┘│
└─────────────────────────────────────────────────────────────┘
```

### `AnomalyAlertsTable`

**Purpose:** Renders exactly four columns for `AlertEntry[]`.

#### Props

```typescript
interface AnomalyAlertsTableProps {
  alerts: AlertEntry[]
  loading?: boolean
}
```

#### Column definitions

| # | Header (UI) | Field | Type | Formatting |
|---|-------------|-------|------|------------|
| 1 | Period | `period` | `string` | Display as returned (e.g. `"2025-06"`) |
| 2 | Recorded Outcome | `outcome_total` | `number` | `formatCurrency`; right-align |
| 3 | Rolling Avg (prev 3) | `baseline_average` | `number` | `formatCurrency`; right-align |
| 4 | % Increase | `increase_ratio` | `number` | `(increase_ratio * 100)` with one decimal, prefix `+` for positive values; **red text** when value > 0; right-align |

- Use semantic `<table>` with `<thead>` / `<tbody>`.
- `aria-label="Spending anomaly alerts"`.

### `AnomalyAlertsEmptyState`

**Purpose:** Shown when `alerts.length === 0` and not loading.

**Content (exact copy):**

> No anomalies detected for the selected threshold and period.

- Include a subtle icon (e.g. `lucide-react` `CheckCircle` or `Activity`).
- `role="status"` for screen readers.

### `ThresholdInput`

**Purpose:** Numeric input for spike threshold.

#### Props

```typescript
interface ThresholdInputProps {
  /** Current value in range [0.01, 1.0]. */
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}
```

#### Validation behavior

| Input | Behavior |
|-------|----------|
| Value < 0.01 | Clamp to `0.01`; show inline message: "Minimum threshold is 0.01." |
| Value > 1.0 | Clamp to `1.0`; show inline message: "Maximum threshold is 1.0." |
| Non-numeric | Reject input; keep previous value |
| Default | `0.3` when param absent |

- Label: **Spike threshold (ratio)** (visible `<label>` associated with input).
- `step="0.01"`, `min="0.01"`, `max="1.0"`.
- Debounce parent `onChange` by ~300ms before refetch.

---

## Feature 3 — B2B vs B2C comparison view

**Route:** `/dashboard/b2b-b2c`  
**File (implementation):** `frontend/src/pages/b2b-b2c-view.tsx` (or `src/components/dashboard/b2b-b2c-view.tsx` + router entry)

### `B2BVsB2CView`

**Purpose:** Page shell with shared date filter, two business-line panels, and comparison chart.

#### Props

```typescript
interface B2BVsB2CViewProps {
  /** Top income categories for B2B (`business_type: "B2B"`). */
  b2bCategories: CategoryEntry[]

  /** Top income categories for B2C (`business_type: "B2C"`). */
  b2cCategories: CategoryEntry[]

  /** Shared date range from URL (Feature 1 pattern). */
  dateRange: { startDate?: string; endDate?: string }

  facets: FacetsResponse | null
  loading?: boolean
  error?: string | null

  onDateRangeChange: (range: { startDate?: string; endDate?: string }) => void
}
```

#### Layout

```text
┌─────────────────────────────────────────────────────────────┐
│  [ DateRangeFilter — same component as Feature 1 ]          │
├──────────────────────────┬──────────────────────────────────┤
│  B2B panel               │  B2C panel          (xl: row)   │
│  TopCategoriesTable      │  TopCategoriesTable              │
├──────────────────────────┴──────────────────────────────────┤
│  B2BVsB2CChart — total income comparison bar chart          │
└─────────────────────────────────────────────────────────────┘
```

- Below `xl`: stack B2B panel above B2C panel.
- Add navigation link label: **B2B vs B2C** pointing to `/dashboard/b2b-b2c`.

### `BusinessLinePanel`

**Purpose:** Header + table for one business segment.

#### Props

```typescript
interface BusinessLinePanelProps {
  /**
   * Display name shown in panel header.
   * Values: `"B2B"` or `"B2C"`.
   */
  businessLine: BusinessType

  /** Top categories for this segment (max 5 from API). */
  categories: CategoryEntry[]

  loading?: boolean
}
```

- Header text: `"B2B"` or `"B2C"` with optional subtitle "Top 5 income categories".
- Render `TopCategoriesTable` or panel empty state when `categories.length === 0`.

#### Panel empty state

**Exact copy:** `No income categories found for this period.`

### `TopCategoriesTable`

**Purpose:** Ranked income categories for one panel.

#### Props

```typescript
interface TopCategoriesTableProps {
  categories: CategoryEntry[]
  loading?: boolean
}
```

#### Column definitions

| # | Header | Source | Formatting |
|---|--------|--------|------------|
| 1 | Category Name | `category` | Title-case or mapped label (e.g. `"sales"` → `"Sales"`) |
| 2 | Total Income | `total_amount` | `formatCurrency`; right-align |
| 3 | % of Group Total | computed | `(total_amount / sum(all total_amount)) * 100` one decimal + `%`; right-align |

- Percent denominator = sum of `total_amount` in the **returned list** (top 5), not global income.
- `aria-label={`Top income categories for ${businessLine}`}` on table.

### `B2BVsB2CChart`

**Purpose:** Single bar (or grouped column) chart comparing aggregate income between segments.

#### Props

```typescript
interface B2BVsB2CChartProps {
  /**
   * Two data points for the chart.
   * Each `value` = sum of `total_amount` from that segment's TopCategoriesResponse.
   */
  data: B2BVsB2CChartDataPoint[]

  loading?: boolean
}

interface B2BVsB2CChartDataPoint {
  /** `"B2B"` or `"B2C"`. */
  segment: BusinessType

  /**
   * Sum of `total_amount` across the segment's top-5 category rows.
   * Represents partial total income (top categories only), not full ledger income.
   */
  value: number
}
```

#### Chart rules

- Library: **Recharts** (consistent with existing dashboard charts).
- X-axis: segment labels (`B2B`, `B2C`).
- Y-axis: currency-formatted totals.
- Tooltip shows formatted currency.
- `aria-label="B2B versus B2C income comparison chart"`.
- When both values are `0`, show empty chart state: "No income data for the selected period."

---

## Component file map (implementation phase)

| Component | Suggested path |
|-----------|----------------|
| `DateRangeFilter` | `src/components/dashboard/date-range-filter.tsx` |
| `AnomalyAlertsSection` | `src/components/dashboard/anomaly-alerts-section.tsx` |
| `AnomalyAlertsTable` | `src/components/dashboard/anomaly-alerts-table.tsx` |
| `AnomalyAlertsEmptyState` | `src/components/dashboard/anomaly-alerts-empty-state.tsx` |
| `ThresholdInput` | `src/components/dashboard/threshold-input.tsx` |
| `B2BVsB2CView` | `src/pages/b2b-b2c-view.tsx` |
| `BusinessLinePanel` | `src/components/dashboard/business-line-panel.tsx` |
| `TopCategoriesTable` | `src/components/dashboard/top-categories-table.tsx` |
| `B2BVsB2CChart` | `src/components/dashboard/b2b-b2c-chart.tsx` |

Prop interfaces should be exported from the same files or from `src/lib/types/dashboard-features.ts` during implementation — do not duplicate shapes already defined in `frontend/specs/`.
