/**
 * The reason why the patient isn't eligible
 * TODO We're waiting on backend support for ineligibility codes to expand this
 */
export type IneligibilityReasonCode =
  // Generic eligibility denial, with unknown code, but we're passing through the message (V1)
  | "DENIED"
  // Policy-level eligibility, but no providers enrolled
  | "PROVIDERS"
  // Soft check indicates patient would be ineligible (out of network)
  | "OUT_OF_NETWORK"

/**
 * Explains why a patient isn't eligible
 */
export interface IneligibilityReason {
  /**
   * Code for referencing this reason
   */
  code: IneligibilityReasonCode
  /**
   * User-friendly message to display
   */
  message: string
}
