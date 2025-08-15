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
type ApiClientPayerSearchResponse = { items: { id: string; name: string }[] }

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
  async payerSearch(args: {
    query: string
    limit?: number
  }): Promise<ApiClientPayerSearchResponse> {
    // TODO Implement the real API call
    await new Promise((resolve) => setTimeout(resolve, 200))
    return {
      items: [
        { id: "1", name: `Payer ${args.query} 1` },
        { id: "2", name: `Payer ${args.query} 2` },
        { id: "3", name: `Payer ${args.query} 3` },
        { id: "4", name: `Payer ${args.query} 4` },
        { id: "5", name: `Payer ${args.query} 5` },
      ]
        .filter((item) => item.name.toLowerCase().includes(args.query.toLowerCase()))
        .slice(0, args.limit ?? 10),
    }
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
