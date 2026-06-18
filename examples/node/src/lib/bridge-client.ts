import { createBridgeClient, type BridgeClient } from "@usebridge/sdk"
import { consoleLogger } from "@usebridge/sdk-core"
import { env } from "./env.js"

let client: BridgeClient | undefined

export function getBridgeClient(): BridgeClient {
  if (!client) {
    client = createBridgeClient({
      publishableKey: env.BRIDGE_PUBLISHABLE_KEY,
      environment: env.BRIDGE_ENVIRONMENT,
      logger: consoleLogger,
    })
  }
  return client
}
