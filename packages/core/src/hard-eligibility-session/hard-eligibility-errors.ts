import type { HardEligibilityError, HardEligibilityErrorCode } from "./types.js"

/**
 * Collection of supported hard eligibility errors
 */
export const HardEligibilityErrors: Record<HardEligibilityErrorCode, HardEligibilityError> = {
  NOT_FOUND_DATE_OF_BIRTH: {
    code: "NOT_FOUND_DATE_OF_BIRTH",
    message: "Not Found, Date of Birth",
    retryable: false,
    forceMemberId: false,
  },
  NOT_FOUND_NAME: {
    code: "NOT_FOUND_NAME",
    message: "Not Found, Name",
    retryable: false,
    forceMemberId: false,
  },
  NOT_FOUND_MEMBER_ID: {
    code: "NOT_FOUND_MEMBER_ID",
    message: "Not Found, Member ID",
    retryable: false,
    forceMemberId: true,
  },
  SERVER_ERROR: {
    code: "SERVER_ERROR",
    message: "Unexpected server error, please retry",
    retryable: true,
    forceMemberId: false,
  },
  PAYER_TIMEOUT: {
    code: "PAYER_TIMEOUT",
    message: "Payer timeout, please retry",
    retryable: true,
    forceMemberId: false,
  },
} as const
