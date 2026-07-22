# SPECS.md - Finance Dashboard Features Implementation

## Overview

Implement three new frontend features for the finance dashboard application. All features must be built using existing design system components, Tailwind v4 classes, and the established API client patterns. Follow strict TypeScript practices, accessibility standards (ARIA labels, keyboard navigation), and responsive design (mobile-first).

**Core Requirements Across All Features:**
- Dates must always be handled and sent in `YYYY-MM-DD` string format.
- All date inputs must be native `<input type="date">` or equivalent shadcn/ui DatePicker components.
- Loading states, error handling (with user-friendly messages), and empty states are mandatory.
- Features must integrate with existing dashboard routing and state management (e.g., URL query params for filters where appropriate).
- Respect the global date range filter from Feature 1 in Features 2 and 3.
- Use the provided TypeScript types (defined below) exclusively — no `any`, `unknown`, or loose objects.

---

## Feature 1 — Date range filter on the home dashboard

Add two date inputs (`startDate` and `endDate`) at the top of the home dashboard, above existing charts/metrics.

**Behavior:**
- Both inputs are optional.
- When both are empty: show all historical data.
- When only `startDate` is set: filter from that date onward.
- When only `endDate` is set: filter up to that date.
- When both are set: filter the closed interval.
- Display the available date range (min/max) from the facets endpoint near the inputs, e.g., "Available data: 2023-01-01 to 2025-06-30".
- On filter change, update the URL query params and refetch affected data.
- The filter applies to all metrics/charts currently on the home dashboard.

**Relevant Endpoints:**
- `GET /api/metrics/facets` → for min/max dates.
- Existing metrics endpoints that now accept `?startDate=...&endDate=...`

---

## Feature 2 — Anomaly alerts table on the home dashboard

Below the existing charts on the home page, add a new section titled "Spending Anomalies" containing:
- A numeric input for threshold (0.01 to 1.0, default 0.3). Label: "Spike threshold (ratio)".
- A table with exactly four columns:
  1. **Period** (string, e.g., "2025-06")
  2. **Recorded Outcome** (number, currency formatted)
  3. **Rolling Avg (prev 3)** (number, currency formatted)
  4. **% Increase** (number, displayed as percentage with + sign and color: red for positive spikes)

**Behavior:**
- Fetch from `GET /api/metrics/alerts?threshold=0.3&startDate=...&endDate=...`
- Table must respect the global date range filter.
- If the alerts array is empty (for current threshold + date range), show explicit empty state: "No anomalies detected for the selected threshold and period." with a subtle illustration or icon.
- Threshold input: clamp values outside [0.01, 1.0] and show inline validation message.
- Auto-refresh table when threshold or date range changes (debounced).

---

## Feature 3 — B2B vs B2C comparison view

Create a new route/page: `/dashboard/b2b-b2c` (add to navigation).

**Layout:**
- Two side-by-side panels (B2B on left, B2C on right) on large screens; stacked on mobile.
- Each panel:
  - Header with business line name.
  - Table: Top 5 income categories.
    - Columns: Category Name, Total Income (currency), % of Group Total (percentage).
- Below both panels: Single comparison chart (bar or side-by-side columns) showing total income for B2B vs B2C.
- Shared date range filter (same as Feature 1) at the top of the page.

**Data:**
- Use `GET /api/metrics/categories/top?operation_type=income&limit=5&startDate=...&endDate=...` (call appropriately for each business line).
- Categories come from facets where relevant.

**Empty States:**
- If a panel's top-5 list is empty: show "No income categories found for this period."

---

## TypeScript Types

### Task: Create `frontend/specs/api-types.ts`

Create the file with strict TypeScript interfaces. Every property must include a JSDoc comment explaining its meaning, valid values, and format.

**Required exports:**
- `FacetsResponse`
- `AlertEntry`, `AlertsResponse`
- `CategoryEntry`, `TopCategoriesResponse`

### Task: Create `frontend/specs/param-types.ts`

**Required exports:**
- `DateRangeFilter`
- `AlertsParams`
- `TopCategoriesParams`

**Rules:**
- All date fields: `string` in `YYYY-MM-DD` format or `undefined`.
- Strict literal types where applicable (e.g., `operation_type`).
- No `any`, `object`, or loose types.

---

## Component Specifications

### Task: Create `frontend/specs/components.md`

Provide detailed component breakdowns including:

#### Feature 1 — DateRangeFilter
- Component name(s), props interface (with full JSDoc), layout description.
- How partial date selection (only start or only end) is handled.
- Display format for available range hint from `FacetsResponse`.

#### Feature 2 — AnomalyAlertsTable
- Component name(s), props.
- Exact column definitions, data types, and formatting rules.
- Empty state component/content when alerts array is empty.
- Threshold input validation behavior for out-of-range values.

#### Feature 3 — B2BVsB2CView + supporting components
- Main view component.
- `BusinessLinePanel` component.
- `TopCategoriesTable` component.
- `B2BVsB2CChart` component.
- Props for each (with JSDoc).
- Empty state per panel.
- Chart data structure and what the two data points represent (total B2B income vs total B2C income).

---

## Data Contract Documentation

### Task: Create `frontend/specs/README.md`

Document for each feature:
- Exact endpoint paths.
- Request params (referencing types from `param-types.ts`).
- Response shapes (referencing types from `api-types.ts`).
- All valid values, defaults, and constraints.
- **At least 2 edge cases per feature** with required UI behavior.

Include any assumptions about API behavior that must be validated during implementation.

---

## Deliverables Summary

1. `frontend/specs/api-types.ts`
2. `frontend/specs/param-types.ts`
3. `frontend/specs/components.md`
4. `frontend/specs/README.md`

**Do not** implement React components, hooks, or API calls in this specification phase. These files are pure documentation and type definitions that will guide subsequent implementation.

All new files must be placed under `frontend/specs/`. Ensure the documentation is precise, unambiguous, and exhaustive enough for an AI agent or junior developer to implement the features correctly without clarification.