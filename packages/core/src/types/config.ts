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
}
