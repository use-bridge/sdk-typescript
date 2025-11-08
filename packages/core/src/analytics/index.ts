import type { AnalyticsHandler } from "./types.js"
import { Analytics } from "./analytics.js"

export * from "./types.js"
export type {
  AnalyticsEvent as AnalyticEvent,
  AnalyticsEventName as AnalyticEventName,
} from "./analytics-events.js"

let _analyticsPublisher: Analytics | undefined

/**
 * Sets the global AnalyticsHandler
 */
export function setAnalyticsHandler(analytics?: AnalyticsHandler, doNotShareAnalytics?: boolean) {
  _analyticsPublisher = new Analytics(analytics, doNotShareAnalytics)
}

/**
 * @returns the AnalyticsPublisher singleton
 */
export const analytics = () => {
  if (!_analyticsPublisher) throw new Error("AnalyticsPublisher not initialized")
  return _analyticsPublisher
}
