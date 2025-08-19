import type { HardEligibilityError } from "../types.js"
import { Strings } from "../../lib/strings.js"

/**
 * Generic timeout error messaging
 */
export const EligibilityTimeout: HardEligibilityError = {
  code: "TIMEOUT",
  message: Strings.policyError.TIMEOUT,
  retryable: true,
  forceMemberId: false,
} as const
