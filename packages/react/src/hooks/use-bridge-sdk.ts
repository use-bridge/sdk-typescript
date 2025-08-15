import { BridgeSdkContext } from "../context/bridge-sdk-context.js"
import { useContext } from "react"

/**
 * Hook to access the BridgeSdk instance from the context
 */
export function useBridgeSdk() {
  const context = useContext(BridgeSdkContext)
  if (!context) throw new Error("useBridgeSdk must be used within a BridgeSdkProvider")
  return context
}
