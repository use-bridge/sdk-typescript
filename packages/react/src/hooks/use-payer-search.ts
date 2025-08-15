import { useBridgeSdk } from "./use-bridge-sdk.js"
import { useCallback } from "react"
import { Bridge } from "@usebridge/api"

/**
 * Hook that returns a function to search for Payers
 */
export function usePayerSearch() {
  const sdk = useBridgeSdk()

  return useCallback(
    (...args: Parameters<typeof sdk.payerSearch>): Promise<Bridge.SearchPayerV1Response> =>
      sdk.payerSearch(...args),
    [sdk],
  )
}
