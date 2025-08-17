import { useCallback } from "react"
import { BridgeApi } from "@usebridge/api"
import { useBridgeSdk } from "../sdk/index.js"

/**
 * Hook that returns a function to search for Payers
 */
export function usePayerSearch() {
  const sdk = useBridgeSdk()

  return useCallback(
    (...args: Parameters<typeof sdk.payerSearch>): Promise<BridgeApi.SearchPayerV1Response> =>
      sdk.payerSearch(...args),
    [sdk],
  )
}
