import { logger } from "../logger/sdk-logger.js"
import type { AnalyticsEvent, AnalyticsEventName } from "./analytics-events.js"
import type { AnalyticsHandler } from "./types.js"
import { v4 as uuidv4 } from "uuid"
import debounce from "debounce"
import { chunk } from "lodash-es"

export interface AnalyticsConfig {
  publishableKey: string
  analyticsHandler?: AnalyticsHandler
  doNotShare?: boolean
  baseUrl: string
}

interface Entry {
  id: string
  stableId: string
  type: "event" | "error"
  timestamp: Date
  index: number
  context: object
  payload: object
}

/**
 * Publishes analytics events to Bridge, and the AnalyticsHandler interface
 */
export class Analytics {
  private _stableId: string | undefined
  private entries: Entry[] = []
  private index = 0
  private debouncedSubmitEntries: ReturnType<typeof debounce>

  constructor(private readonly config: AnalyticsConfig) {
    // Create a debounced version of submitEntries
    this.debouncedSubmitEntries = debounce(() => {
      this.submitEntries()
    }, 1_000)
  }

  /**
   * Batches up the queue and submits to our track API
   */
  private submitEntries(): void {
    // In case this gets bloated, chunk it up
    const batches = chunk(this.entries, 100)
    // Clear out the entries queue
    this.entries.length = 0
    // Submit each batch to our Track API
    async function submit(analytics: Analytics) {
      await Promise.allSettled(
        batches.map(async (entryBatch) => {
          try {
            const trackUrl = new URL(
              "/api/tracking/sdk/events/v1",
              analytics.config.baseUrl,
            ).toString()
            await fetch(trackUrl, {
              method: "POST",
              body: JSON.stringify({ events: entryBatch }),
              keepalive: true,
              priority: "low",
              headers: {
                "Content-Type": "application/json",
                "X-API-Key": analytics.config.publishableKey,
              },
            })
          } catch (err) {
            // If it fails for any reason, put them back in the queue and try again later
            const firstEntryId = entryBatch[0].id
            const batchSize = entryBatch.length
            logger()?.error("Analytics.submitEntries.error", { firstEntryId, batchSize, err })
            analytics.entries.push(...entryBatch)
            setTimeout(() => analytics.debouncedSubmitEntries(), 5_000 + Math.random() * 5_000)
          }
        }),
      )
    }
    void submit(this)
  }

  // Attempts to manage a basic stable ID
  private getStableId(): string {
    // If we have one already, use it
    if (this._stableId) return this._stableId
    // Fetch from local storage, and use that if it exists
    try {
      const existing = window.localStorage.getItem("bridge.stableId")
      if (existing) {
        this._stableId = existing
        return this._stableId
      }
    } catch (err) {
      // If this fails, don't stress about it
      logger()?.info("Analytics.getStableId.local-storage.error", { err })
    }
    // Generate something new
    this._stableId = uuidv4()
    // Save to local storage
    try {
      window.localStorage.setItem("bridge.stableId", this._stableId)
    } catch (err) {
      // We can also eat this, if it fails
      logger()?.info("Analytics.getStableId.local-storage.error", { err })
    }
    // Return the ID
    return this._stableId
  }

  private entry(): Omit<Entry, "type" | "payload"> {
    const context =
      typeof window !== "undefined"
        ? { location: window.location.href, userAgent: window.navigator.userAgent }
        : {}
    return {
      id: uuidv4(),
      stableId: this.getStableId(),
      index: this.index++,
      timestamp: new Date(),
      context,
    }
  }

  /**
   * Tracks an event
   */
  event<T extends AnalyticsEventName>(event: T, data: AnalyticsEvent<T>): void {
    // If this is server-side rendering, do nothing
    if (typeof window === "undefined") return
    // Send to Bridge
    try {
      if (!this.config.doNotShare) {
        this.entries.push({ ...this.entry(), type: "event", payload: { event, data } })
        this.debouncedSubmitEntries()
      }
    } catch (err) {
      logger()?.error("Analytics.event.bridge.error", { event, data, err })
    }
    // Push through to the handler
    try {
      this.config.analyticsHandler?.onEvent(event, data)
    } catch (err) {
      logger()?.error("Analytics.event.handler.error", { event, data, err })
    }
  }

  /**
   * Tracks a fatal error, then throws
   * @throws the error it was given
   */
  fatal(error: Error): never {
    // If this is server-side rendering, do nothing
    if (typeof window === "undefined") throw error
    // Send to Bridge
    try {
      if (!this.config.doNotShare) {
        this.entries.push({ ...this.entry(), type: "error", payload: { error } })
        this.debouncedSubmitEntries()
      }
    } catch (err) {
      logger()?.error("Analytics.fatal.bridge.error", { error, err })
    }
    // Push through to the handler
    try {
      this.config.analyticsHandler?.onError(error)
    } catch (err) {
      logger()?.error("Analytics.fatal.handler.error", { error, err })
    }
    // Throw this error, we're not resolving
    throw error
  }

  /**
   * Attempts to force a flush of data
   */
  flush(): void {
    try {
      this.debouncedSubmitEntries.trigger()
    } catch (err) {
      logger()?.error("Analytics.flush.bridge.error", { err })
    }
    try {
      this.config.analyticsHandler?.flush()
    } catch (err) {
      logger()?.error("Analytics.flush.handler.error", { err })
    }
  }
}
