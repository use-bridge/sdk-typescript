import { useBridgeSdk } from "./use-bridge-sdk.js"
import { useCallback } from "react"

/**
 * Hook that returns a function to search for Payers
 */
export function usePayerSearch() {
  const sdk = useBridgeSdk()
  return useCallback(
    (...args: Parameters<typeof sdk.payerSearch>) => sdk.payerSearch(...args),
    [sdk],
  )
}
