"use client"

import { type BridgeSdkConfig, consoleLogger } from "@usebridge/sdk-core"
import { BridgeSdkProvider } from "@usebridge/sdk-react"
import { cleanEnv, str } from "envalid"

const env = cleanEnv(
  {
    NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    NEXT_PUBLIC_BRIDGE_ENVIRONMENT: process.env.NEXT_PUBLIC_BRIDGE_ENVIRONMENT,
  },
  {
    NEXT_PUBLIC_PUBLISHABLE_KEY: str({
      desc: "Bridge 'Publishable' API key, from Bridge Dashboard > Developers > API Keys",
    }),
    NEXT_PUBLIC_BRIDGE_ENVIRONMENT: str({
      desc: "BridgeSdk environment, either 'production' or 'sandbox'",
      default: "production",
      devDefault: "sandbox",
    }),
  },
)

const config: BridgeSdkConfig = {
  publishableKey: env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  environment: env.NEXT_PUBLIC_BRIDGE_ENVIRONMENT,
  logger: consoleLogger,
}

export const BridgeProvider = ({ children }: { children: React.ReactNode }) => {
  return <BridgeSdkProvider config={config}>{children}</BridgeSdkProvider>
}
