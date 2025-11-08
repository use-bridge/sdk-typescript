import { logger } from "../logger/sdk-logger.js"
import type { AnalyticsEvent, AnalyticsEventName } from "./analytics-events.js"
import type { AnalyticsHandler } from "./types.js"
import { BridgeAnalytics } from "./bridge-analytics.js"

/**
 * Publishes analytics events to Bridge, and the AnalyticsHandler interface
 */
export class Analytics {
  constructor(
    private readonly analytics?: AnalyticsHandler,
    private readonly doNotShareAnalytics?: boolean,
  ) {}

  /**
   * Tracks an event
   */
  event<T extends AnalyticsEventName>(event: T, data: AnalyticsEvent<T>): void {
    // Send to Bridge
    try {
      BridgeAnalytics.onEvent(event, data)
    } catch (err) {
      logger()?.error("Analytics.event.bridge.error", { event, data, err })
    }
    // Push through to the handler
    try {
      this.analytics?.onEvent(event, data)
    } catch (err) {
      logger()?.error("Analytics.event.handler.error", { event, data, err })
    }
  }

  /**
   * Tracks a fatal error, then throws
   * @throws the error it was given
   */
  fatal(error: Error): never {
    // Send to Bridge
    try {
      BridgeAnalytics.onError(error)
    } catch (err) {
      logger()?.error("Analytics.fatal.bridge.error", { error, err })
    }
    // Push through to the handler
    try {
      this.analytics?.onError(error)
    } catch (err) {
      logger()?.error("Analytics.fatal.handler.error", { error, err })
    }
    // Throw this error, we're not resolving
    throw error
  }
}
