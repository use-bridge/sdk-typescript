import type { BridgeSdkConfig } from "./types/index.js"
import {
  SoftEligibilitySession,
  type SoftEligibilitySessionConfig,
} from "./soft-eligibility-session/index.js"
import {
  HardEligibilitySession,
  type HardEligibilitySessionConfig,
} from "./hard-eligibility-session/index.js"

// TODO This should be the result of the PayerSearch API, exposed from the generated Bridge API SDK
type ApiClientPayerSearchResponse = object

/**
 * The BridgeSdk is the main entry point for configuring and using @usebridge/usebridge-core
 */
export class BridgeSdk {
  constructor(private readonly config: BridgeSdkConfig) {}

  /**
   * Runs a Payer search against the Bridge API
   * @param query the query, may be an empty string
   * @param limit the maximum number of results to return, defaults to 10
   */
  payerSearch(args: { query: string; limit?: number }): Promise<ApiClientPayerSearchResponse> {
    // TODO Cache the query results, for identical args
    throw new Error("TODO")
  }

  /**
   * Creates a new Soft Eligibility Session
   */
  createSoftEligibilitySession(config: SoftEligibilitySessionConfig): SoftEligibilitySession {
    return new SoftEligibilitySession(this.config, config)
  }

  /**
   * Creates a new Hard Eligibility Session
   */
  createHardEligibilitySession(config: HardEligibilitySessionConfig): HardEligibilitySession {
    return new HardEligibilitySession(this.config, config)
  }
}
