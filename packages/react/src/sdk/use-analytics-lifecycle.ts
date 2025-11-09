import { useEffect } from "react"
import type { BridgeSdk } from "@usebridge/sdk-core"

/**
 * Hooks into the components/page, best we can, to try and make sure we flush these events
 */
export function useAnalyticsLifecycle(bridgeSdk: BridgeSdk) {
  // When this component (which is the root of Bridge), flush
  useEffect(() => {
    return () => {
      bridgeSdk._analytics.flush()
    }
  }, [bridgeSdk])
  // Hook into the visibility event, flush when we're  hidden
  useEffect(() => {
    const flush = (e: any) => {
      if (e.visibilityState === "hidden") bridgeSdk._analytics.flush()
    }
    if (typeof window !== "undefined") window.addEventListener("visibilitychange", flush)
    return () => {
      if (typeof window !== "undefined") window.removeEventListener("visibilitychange", flush)
    }
  }, [bridgeSdk])
}
