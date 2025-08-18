import type { HardEligibilityError } from "../types.js"
import type { Policy } from "../../types/index.js"
import { HardEligibilityErrors } from "../hard-eligibility-errors.js"

/**
 * Resolves the most-relevant HardEligibilityError from a Policy
 */
export function errorFromPolicy(policy: Policy): HardEligibilityError {
  if (policy.status !== "INVALID")
    throw new Error("Policy is not in an INVALID state, cannot resolve HardEligibilityError")
  // If there are no errors listed, but we're invalid, it's generic failure
  if (!policy.errors || policy.errors.length === 0) return HardEligibilityErrors.SERVER_ERROR
  // TODO Apply some logic to determine priority in this list
  // TODO Convert into the HardEligibilityError type
  return HardEligibilityErrors.NOT_FOUND_NAME
}
