"use client"

import { type FC, type PropsWithChildren, useEffect, useRef } from "react"
import { BridgeSdk, type BridgeSdkConfig } from "@usebridge/sdk-core"
import { BridgeSdkContext } from "../context/bridge-sdk-context.js"

interface BridgeSdkProviderProps extends PropsWithChildren {
  /**
   * Config for the BridgeSdk
   */
  config: BridgeSdkConfig
  /**
   * Whether to prefetch payers, defaults to true
   */
  prefetchPayers?: boolean
}

// If we're prefetching, kick off some obvious searches to fill the cache
function usePrefetchPayers(bridgeSdk: BridgeSdk, enabled: boolean) {
  // If we're prefetching, kick off a search for empty and BUCA and populate our cache
  useEffect(() => {
    if (enabled) {
      void Promise.all(
        ["", "b", "u", "c", "a"].map((query) => bridgeSdk.payerSearch({ query, limit: 10 })),
      )
    }
  }, [bridgeSdk, enabled])
}

/**
 * Creates and provides a BridgeSdk to the hooks nested within
 * Initializes with the first 'config' passed through to it
 */
export const BridgeSdkProvider: FC<BridgeSdkProviderProps> = ({
  config,
  prefetchPayers = true,
  children,
}) => {
  const { current } = useRef(new BridgeSdk(config))
  usePrefetchPayers(current, prefetchPayers)
  return <BridgeSdkContext.Provider value={current}>{children}</BridgeSdkContext.Provider>
}
