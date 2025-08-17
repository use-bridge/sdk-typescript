import { useEligibilityInput } from "./eligibility-input-context.js"
import { useMemo } from "react"
import { BridgeApi } from "@usebridge/api"

/**
 * Value and setter for the Payer being selected in the Eligibility Input
 */
export function useEligibilityInputPayer(): [
  BridgeApi.SearchPayerV1ResponseItem | null,
  (payer: BridgeApi.SearchPayerV1ResponseItem | null) => void,
] {
  const {
    payer: { value, set },
  } = useEligibilityInput()
  return useMemo(() => [value, set], [value, set])
}
