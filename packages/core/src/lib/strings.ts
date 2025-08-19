/**
 * User-facing strings
 */
export const Strings = {
  ineligibility: {
    NO_PROVIDERS: "No providers are enrolled in this plan",
  },
  policyError: {
    NOT_FOUND_NAME: "Insurance not found, check the patient name",
    NOT_FOUND_DATE_OF_BIRTH: "Insurance not found, check the date of birth",
    NOT_FOUND_MEMBER_ID: "Insurance not found, check the Member ID",
    PAYER_ERROR: "Payer system error, please try again",
    SERVER_ERROR: "An unexpected error occurred, please try again",
    TIMEOUT: "Payer took too long to respond, please try again",
  },
} as const
