import type { AnalyticsEvent, AnalyticsEventName } from "./analytics-events.js"
import type { AnalyticsHandler } from "./types.js"

/**
 * This handler publishes analytics events directly to Bridge
 */
export const BridgeAnalytics: AnalyticsHandler = {
  onEvent<T extends AnalyticsEventName>(event: T, data: AnalyticsEvent<T>): void {
    // TODO: Implement
  },
  onError(error: Error): void {
    // TODO: Implement
  },
}
