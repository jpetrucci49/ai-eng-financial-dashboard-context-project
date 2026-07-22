/**
 * TypeScript interfaces for API response bodies used by dashboard features.
 * Shapes mirror Pydantic models in `backend/app/routes.py`.
 */

import type {
  BusinessType,
  Category,
  OperationType,
} from '../src/lib/financial-types'

/**
 * Response body for `GET /api/metrics/facets`.
 * Used by Feature 1 (date range hint) and Feature 3 (valid category labels).
 */
export interface FacetsResponse {
  /**
   * Distinct movement directions available in the dataset.
   * Valid values: `"income"` or `"outcome"`.
   */
  operation_types: OperationType[]

  /**
   * Distinct customer segments available in the dataset.
   * Valid values: `"B2B"` or `"B2C"`.
   */
  business_types: BusinessType[]

  /**
   * Distinct financial categories available in the dataset.
   * Valid values: `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"`.
   */
  categories: Category[]

  /**
   * Earliest movement date in the dataset (inclusive lower bound for filters).
   * Format: ISO calendar date `YYYY-MM-DD` (e.g. `"2024-01-10"`).
   */
  min_date: string

  /**
   * Latest movement date in the dataset (inclusive upper bound for filters).
   * Format: ISO calendar date `YYYY-MM-DD` (e.g. `"2025-12-28"`).
   */
  max_date: string
}

/**
 * One spending anomaly row from `GET /api/metrics/alerts`.
 * Used by Feature 2 (anomaly alerts table).
 */
export interface AlertEntry {
  /**
   * Aggregated time bucket for the alert.
   * Format depends on backend `group_by` (default `"month"`):
   * - `"day"`: `YYYY-MM-DD`
   * - `"week"`: `YYYY-Www` (e.g. `"2025-W23"`)
   * - `"month"`: `YYYY-MM` (e.g. `"2025-06"`)
   */
  period: string

  /**
   * Total outcome amount recorded in this period.
   * Non-negative number; format as currency in the UI.
   */
  outcome_total: number

  /**
   * Rolling baseline outcome average computed from all prior periods in the filtered series.
   * Non-negative number; format as currency in the UI.
   * **Note:** The UI column label "Rolling Avg (prev 3)" is display copy; the API value is
   * the mean of every prior period, not strictly the last three.
   */
  baseline_average: number

  /**
   * Relative increase of `outcome_total` over `baseline_average`.
   * Decimal ratio, not a percentage: `0.3` = 30% above baseline; `1.0` = 100% above baseline.
   * Display in UI as a signed percentage (e.g. `+42.5%`).
   */
  increase_ratio: number
}

/**
 * Response body for `GET /api/metrics/alerts`.
 * Ordered array of anomaly entries; empty when no period exceeds the threshold.
 */
export type AlertsResponse = AlertEntry[]

/**
 * One ranked category row from `GET /api/metrics/categories/top`.
 * Used by Feature 3 (B2B vs B2C top income tables).
 */
export interface CategoryEntry {
  /**
   * Category name for the aggregated movements.
   * Valid values: `"suppliers"`, `"sales"`, `"operational"`, `"administrative"`, `"others"`.
   */
  category: Category

  /**
   * Operation direction included in this aggregate.
   * Feature 3 requests `"income"` for both panels.
   */
  operation_type: OperationType

  /**
   * Sum of movement amounts for this category within the filtered scope.
   * Non-negative number; used for currency display and percentage-of-total calculations in the UI.
   */
  total_amount: number
}

/**
 * Response body for `GET /api/metrics/categories/top`.
 * Up to `limit` entries sorted by `total_amount` descending.
 */
export type TopCategoriesResponse = CategoryEntry[]
