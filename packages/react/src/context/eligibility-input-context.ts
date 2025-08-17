import type { UsStateCode } from "@usebridge/sdk-core"

/**
 * Manages input context for either eligibility check
 * Usage, is expected to be within a SoftEligibilityProvider or HardEligibilityProvider
 */
interface EligibilityInputContext {
  /**
   * Selected Payer ID
   */
  payerId?: string | null
  /**
   * Patient State
   */
  state?: UsStateCode | null
}
