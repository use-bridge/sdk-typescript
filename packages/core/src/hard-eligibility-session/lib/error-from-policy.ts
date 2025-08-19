import type { HardEligibilityError } from "../types.js"
import type { Policy } from "../../types/index.js"
import { Strings } from "../../lib/strings.js"
import { logger } from "../../logger/sdk-logger.js"

/**
 * Resolves the most-relevant HardEligibilityError from a Policy
 */
export function errorFromPolicy(policy: Policy): HardEligibilityError {
  if (policy.status !== "INVALID")
    throw new Error("Policy is not in an INVALID state, cannot resolve HardEligibilityError")

  // Expected Policy errors are documented at: https://docs.usebridge.com/eligibility/api/policy-errors
  // The first error in the list is the most relevant one
  const policyError = policy.errors?.at(0)?.code
  const policyErrorCode = policyError ?? "GENERIC_ERROR" // It's unexpected, but maybe we don't get a code

  switch (policyErrorCode) {
    case "PATIENT_NAME":
    case "SUBSCRIBER_NAME":
      return {
        code: "NOT_FOUND_NAME",
        message: Strings.policyError.NOT_FOUND_NAME,
        retryable: false,
        forceMemberId: true,
      }
    case "DOB_INVALID":
    case "DOB":
      return {
        code: "NOT_FOUND_DATE_OF_BIRTH",
        message: Strings.policyError.NOT_FOUND_DATE_OF_BIRTH,
        retryable: false,
        forceMemberId: true,
      }
    case "MEMBER_ID":
      return {
        code: "NOT_FOUND_MEMBER_ID",
        message: Strings.policyError.NOT_FOUND_MEMBER_ID,
        retryable: false,
        forceMemberId: true,
      }
    case "PAYER_ERROR":
      return {
        code: "PAYER_ERROR",
        message: Strings.policyError.PAYER_ERROR,
        retryable: true,
        forceMemberId: false,
      }
    case "TIMEOUT":
      return {
        code: "TIMEOUT",
        message: Strings.policyError.TIMEOUT,
        retryable: true,
        forceMemberId: false,
      }

    default: // We expect a finite set of codes here, but they can change, log it
      logger()?.warn(`Unexpected policy error: ${policyError}, returning generic error`)
    case "GENERIC_ERROR":
      return {
        code: "SERVER_ERROR",
        message: Strings.policyError.SERVER_ERROR,
        retryable: true,
        forceMemberId: false,
      }
  }
}
