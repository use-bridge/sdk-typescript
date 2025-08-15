/**
 * Defines how the result of multiple ServiceTypes should be merged together
 *
 * UNION - Only one type is required to be eligible, and Provider's will be merged from all results
 * INTERSECTION - All types must be eligible, and Provider's must appear in all results
 */
export type ServiceTypeMergeStrategy = "UNION" | "INTERSECTION"

/**
 * Defines how an estimate is selected when multiple ServiceTypes are eligible
 *
 * HIGHEST - The highest estimate is selected
 * LOWEST - The lowest estimate is selected
 * SERVICE_TYPE - The estimate for a specific ServiceType is selected
 */
export type EstimateSelection =
  | { mode: "HIGHEST" | "LOWEST" }
  | { mode: "SERVICE_TYPE"; serviceTypeId: string }
