import { useEligibilityInput } from "./eligibility-input-context.js"
import { useMemo } from "react"
import type { Payer } from "@usebridge/sdk-core"

/**
 * Value and setter for the Payer being selected in the Eligibility Input
 */
export function useEligibilityInputPayer(): [Payer | null, (payer: Payer | null) => void] {
  const {
    payer: { value, set },
  } = useEligibilityInput()
  return useMemo(() => [value, set], [value, set])
}
