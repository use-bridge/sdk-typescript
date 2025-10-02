import { BridgeSdk } from "@usebridge/sdk-core"
import { useEffect } from "react"

// If we're prefetching, kick off some obvious searches to fill the cache
export function usePrefetchPayers(bridgeSdk: BridgeSdk, enabled: boolean) {
  // If we're prefetching, kick off a search for empty and BUCA and populate our cache
  useEffect(() => {
    if (enabled) {
      void Promise.all(
        ["", "b", "u", "a"].map((query) => bridgeSdk.payerSearch({ query, limit: 10 })),
      )
    }
  }, [bridgeSdk, enabled])
}
