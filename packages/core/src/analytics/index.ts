import { Analytics, type AnalyticsConfig } from "./analytics.js"

export * from "./types.js"
export type {
  AnalyticsEvent as AnalyticEvent,
  AnalyticsEventName as AnalyticEventName,
} from "./analytics-events.js"

let _analyticsPublisher: Analytics | undefined

/**
 * Sets the global AnalyticsHandler
 */
export function configureAnalytics(args: AnalyticsConfig) {
  _analyticsPublisher = new Analytics(args)
}

/**
 * @returns the AnalyticsPublisher singleton
 */
export const analytics = () => {
  if (!_analyticsPublisher) throw new Error("AnalyticsPublisher not configured")
  return _analyticsPublisher
}
