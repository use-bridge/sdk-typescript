import type { BridgeSdkConfig, PayerSearchResults } from "./types/index.js"
import {
  SoftEligibilitySession,
  type SoftEligibilitySessionConfig,
} from "./soft-eligibility-session/index.js"
import {
  HardEligibilitySession,
  type HardEligibilitySessionConfig,
} from "./hard-eligibility-session/index.js"
import { BridgeApiClient } from "@usebridge/api"
import { setLogger } from "./logger/sdk-logger.js"

function getClientEnvironment(environment: string): string {
  switch (environment) {
    case "production":
      return "https://app.usebridge.com"
    case "sandbox":
      return "https://app.usebridge.xyz"
    default:
      return environment
  }
}

/**
 * Determine whether we'll accept this API key
 */
function isApiKeyValid(apiKey: string, environment: string, unsafeApiKey?: boolean): boolean {
  // If it's a publishable key, it's always ok
  if (apiKey.startsWith("pk_")) return true
  // If we're in production, we'll throw an error if the key doesn't start with 'pk_'
  if (environment === "production") {
    // unsafeApiKey cannot be used in production (throw an error)
    if (unsafeApiKey) throw new Error("unsafeApiKey cannot be used in production")
    // Production requires PK
    return false
  }
  // Outside production, we'll allow unsafeApikey
  if (unsafeApiKey) return true
  // Otherwise, not OK
  return false
}

/**
 * The BridgeSdk is the main entry point for configuring and using @usebridge/usebridge-core
 */
export class BridgeSdk {
  #client: BridgeApiClient
  #payerSearchCache: Map<string, PayerSearchResults> = new Map()

  constructor({ environment, publishableKey, unsafeApiKey, logger }: BridgeSdkConfig) {
    // Parse the environment
    const env = environment ?? "production"
    // Require a new-format API key, that's got the publishable prefix
    if (!isApiKeyValid(publishableKey, env, unsafeApiKey)) {
      throw new Error("Invalid API key, must begin with 'pk_'")
    }
    this.#client = new BridgeApiClient({
      apiKey: publishableKey,
      environment: getClientEnvironment(env),
    })
    setLogger(logger)
  }

  /**
   * Runs a Payer search against the Bridge API
   * @param query the query, may be an empty string
   * @param limit the maximum number of results to return, defaults to 10
   */
  async payerSearch({
    query,
    limit = 10,
  }: {
    query: string
    limit?: number
  }): Promise<PayerSearchResults> {
    const cacheKey = query.toLowerCase()
    const cached = this.#payerSearchCache.get(cacheKey)
    if (cached) return cached
    const result = await this.#client.search.payerSearch({ query, limit })
    this.#payerSearchCache.set(cacheKey, result)
    return result
  }

  /**
   * Creates a new Soft Eligibility Session
   */
  createSoftEligibilitySession(config: SoftEligibilitySessionConfig): SoftEligibilitySession {
    return new SoftEligibilitySession(this.#client, config)
  }

  /**
   * Creates a new Hard Eligibility Session
   */
  createHardEligibilitySession(config: HardEligibilitySessionConfig): HardEligibilitySession {
    return new HardEligibilitySession(this.#client, config)
  }
}
