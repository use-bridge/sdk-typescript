"use client"

import { type FC, type PropsWithChildren, useRef } from "react"
import { BridgeSdk, type BridgeSdkConfig } from "@usebridge/sdk-core"
import { BridgeSdkContext } from "../context/bridge-sdk-context.js"

interface BridgeSdkProviderProps extends PropsWithChildren {
  config: BridgeSdkConfig
}

/**
 * Creates and provides a BridgeSdk to the hooks nested within
 * Initializes with the first 'config' passed through to it
 */
export const BridgeSdkProvider: FC<BridgeSdkProviderProps> = ({ config, children }) => {
  const { current } = useRef(new BridgeSdk(config))
  return <BridgeSdkContext.Provider value={current}>{children}</BridgeSdkContext.Provider>
}
