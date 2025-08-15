import { createContext } from "react"
import type { BridgeSdk } from "@usebridge/sdk-core"

/**
 * React context for a BridgeSdk
 */
export const BridgeSdkContext = createContext<BridgeSdk | null>(null)
