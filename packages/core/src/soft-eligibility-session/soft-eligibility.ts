import type { SoftEligibilitySessionStatus } from "./types.js"

/**
 * Helpers working with soft eligibility sessions
 */
export const SoftEligibility = {
  /**
   * Whether the user is able to submit in the given state
   */
  canSubmit(status: SoftEligibilitySessionStatus): boolean {
    if (status === "ELIGIBLE") return false
    if (status === "INELIGIBLE") return false
    if (status === "SUBMITTING") return false
    return true
  },
}
