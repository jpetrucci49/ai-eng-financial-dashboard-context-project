/**
 * TypeScript types for query parameters sent to metrics API endpoints.
 * Wire names use snake_case to match FastAPI `Query` arguments in `backend/app/routes.py`.
 *
 * **URL vs API:** Feature specs use camelCase URL keys (`startDate`, `endDate`) in the browser.
 * The API client must map those values to `start_date` / `end_date` when building request URLs.
 */

import type { BusinessType, OperationType } from '../src/lib/financial-types'

/**
 * Optional inclusive date bounds applied to metrics endpoints.
 * Dates are calendar strings in `YYYY-MM-DD` format or omitted.
 */
export interface DateRangeFilter {
  /**
   * Inclusive start date filter.
   * Format: `YYYY-MM-DD`. Omit to include all data from the beginning of the range.
   */
  start_date?: string

  /**
   * Inclusive end date filter.
   * Format: `YYYY-MM-DD`. Omit to include all data through the end of the range.
   */
  end_date?: string
}

/**
 * Query parameters for `GET /api/metrics/alerts` (Feature 2).
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum relative outcome increase above baseline required to return an alert.
   * Valid range: `>= 0` on the backend; UI clamps input to `[0.01, 1.0]`.
   * Decimal ratio: `0.3` means 30% above baseline.
   * Default when omitted: `0.3`.
   */
  threshold?: number
}

/**
 * Query parameters for `GET /api/metrics/categories/top` (Feature 3).
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Movement direction to rank categories by amount.
   * Feature 3 uses `"income"` for both B2B and B2C panels.
   * Default when omitted: `"outcome"`.
   */
  operation_type?: OperationType

  /**
   * Maximum number of categories to return, highest amounts first.
   * Valid range: integer `1`–`20` inclusive.
   * Feature 3 uses `5`.
   * Default when omitted: `5`.
   */
  limit?: number

  /**
   * Optional business segment filter.
   * Feature 3 calls this endpoint twice: once with `"B2B"`, once with `"B2C"`.
   * Omit to include both segments (not used on the comparison page).
   */
  business_type?: BusinessType
}
