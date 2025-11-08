import type { Logger } from "../logger/index.js"
import type { AnalyticsHandler } from "../analytics/index.js"

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
   * Analytics handler implementation
   */
  analyticsHandler?: AnalyticsHandler

  /**
   * By default, the SDK will collect analytics data and send directly to Bridge
   * Disables the Bridge analytics tracking
   * Still allows the AnalyticsHandler to be used
   */
  doNotShareAnalytics?: boolean

  /**
   * Environment to use, defaults to "production"
   */
  environment?: "production" | "sandbox" | string

  /**
   * Whether to bypass the key check (not possible in production)
   */
  unsafeApiKey?: boolean
}
