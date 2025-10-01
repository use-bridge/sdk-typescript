"use client"

import { createContext, type FC, type PropsWithChildren, useContext, useRef } from "react"
import { BridgeSdk, type BridgeSdkConfig } from "@usebridge/sdk-core"
import { usePrefetchPayers } from "./use-prefetch-payers.js"

const BridgeSdkContext = createContext<BridgeSdk | null>(null)

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
  return <BridgeSdkContext.Provider value={current}> {children} </BridgeSdkContext.Provider>
}

/**
 * Hook to access the BridgeSdk instance from the context
 */
export function useBridgeSdk() {
  const context = useContext(BridgeSdkContext)
  if (!context) throw new Error("useBridgeSdk must be used within a BridgeSdkProvider")
  return context
}
