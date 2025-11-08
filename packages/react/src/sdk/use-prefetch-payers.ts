import { BridgeSdk } from "@usebridge/sdk-core"
import { useEffect, useRef } from "react"

// If we're prefetching, kick off some obvious searches to fill the cache
export function usePrefetchPayers(bridgeSdk: BridgeSdk, enabled: boolean) {
  // If we're prefetching, kick off a search for empty and BUCA and populate our cache
  const fetched = useRef(false)
  useEffect(() => {
    if (fetched.current) return
    if (enabled) {
      void Promise.all(
        ["", "b", "u", "a"].map((query) => bridgeSdk.payerSearch({ query, limit: 10 })),
      )
      fetched.current = true
    }
  }, [bridgeSdk, enabled])
}
