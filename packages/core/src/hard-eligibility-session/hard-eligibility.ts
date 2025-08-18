import type { HardEligibilitySessionStatus } from "./types.js"

/**
 * Helpers workers with hard eligibility sessions.
 */
export const HardEligibility = {
  /**
   * Whether this state allows user to submit
   */
  canSubmit(status: HardEligibilitySessionStatus): boolean {
    if (status === "WAITING_FOR_POLICY") return false
    if (status === "WAITING_FOR_SERVICE_ELIGIBILITY") return false
    if (status === "ELIGIBLE") return false
    if (status === "INELIGIBLE") return false
    return true
  },
}
