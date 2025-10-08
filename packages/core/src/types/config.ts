import type { Logger } from "../logger/index.js"

/**
 * Configures the client
 */
export interface BridgeSdkConfig {
  /**
   * Publishable Bridge API key
   */
  publishableKey: string

  /**
   * Logger implementation
   */
  logger?: Logger

  /**
   * Environment to use, defaults to "production"
   */
  environment?: "production" | "sandbox" | string

  /**
   * Whether to bypass the key check (not possible in production)
   */
  unsafeApiKey?: boolean
}
