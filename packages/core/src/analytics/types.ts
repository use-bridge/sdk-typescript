/**
 * Event type for analytics tracking
 */
export type EventType = "example.a" | "example.b"

/**
 * Analytics handler interface
 */
export interface AnalyticsHandler {
  /**
   * Called when an analytics event occurs
   * @param event The type of event
   * @param data Additional data associated with the event
   */
  onEvent(event: EventType, data: object): void
}
