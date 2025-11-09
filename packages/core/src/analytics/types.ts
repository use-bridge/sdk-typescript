import type { AnalyticsEvent, AnalyticsEventName } from "./analytics-events.js"

/**
 * Analytics handler interface
 */
export interface AnalyticsHandler {
  /**
   * Called when an analytics event occurs
   * @param event The type of event
   * @param data Additional data associated with the event
   */
  onEvent<T extends AnalyticsEventName>(event: T, data: AnalyticsEvent<T>): void

  /**
   * Called when the AnalyticsHandler hits an error
   * @param error The error that occurred
   */
  onError(error: Error): void

  /**
   * Called when there's a hint to force a flush
   */
  flush(): void
}
