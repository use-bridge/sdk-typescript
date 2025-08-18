/**
 * The reason why the patient isn't eligible
 * TODO Pull this stuff out into 'Ineligibility', without "hard" prefix
 *   // TODO This list is stubbed
 */
export type IneligibleReasonCode = "NOT_ACTIVE" | "HMO" | "PROVIDERS"

/**
 * Explains why a patient isn't eligible
 */
export interface IneligibleReason {
  /**
   * Code for referencing this reason
   */
  code: IneligibleReasonCode
  /**
   * User-friendly message to display
   */
  message: string
}

/**
 * Map of ineligibility
 * TODO These are all stubbed
 */
export const IneligibleReasons: Record<IneligibleReasonCode, IneligibleReason> = {
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
