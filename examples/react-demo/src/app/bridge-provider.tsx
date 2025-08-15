"use client"

import { type BridgeSdkConfig, consoleLogger } from "@usebridge/sdk-core"
import { BridgeSdkProvider } from "@usebridge/sdk-react"

const config: BridgeSdkConfig = {
  publishableKey: "abc",
  logger: consoleLogger,
}

export const BridgeProvider = ({ children }: { children: React.ReactNode }) => {
  return <BridgeSdkProvider config={config}>{children}</BridgeSdkProvider>
}
