import { useCallback } from "react"
import { useBridgeSdk } from "../sdk/index.js"
import type { PayerSearchResults } from "@usebridge/sdk-core"

/**
 * Hook that returns a function to search for Payers
 */
export function usePayerSearch() {
  const sdk = useBridgeSdk()

  return useCallback(
    (...args: Parameters<typeof sdk.payerSearch>): Promise<PayerSearchResults> =>
      sdk.payerSearch(...args),
    [sdk],
  )
}
