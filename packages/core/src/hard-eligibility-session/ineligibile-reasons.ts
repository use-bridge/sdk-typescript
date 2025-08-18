/**
 * The reason why the patient isn't eligible
 * TODO Pull this stuff out into 'Ineligibility', without "hard" prefix
 *   // TODO This list is stubbed
 */
export type IneligibilityReasonCode = "NOT_ACTIVE" | "HMO" | "PROVIDERS"

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

/**
 * Map of ineligibility
 * TODO These are all stubbed
 */
export const IneligibilityReasons: Record<IneligibilityReasonCode, IneligibilityReason> = {
  NOT_ACTIVE: {
    code: "NOT_ACTIVE",
    message: "Plan is not active",
  },
  HMO: {
    code: "HMO",
    message: "HMO plan, no providers found",
  },
  PROVIDERS: {
    code: "PROVIDERS",
    message: "No providers found for this plan",
  },
} as const
