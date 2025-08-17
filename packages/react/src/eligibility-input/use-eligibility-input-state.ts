import { useEligibilityInput } from "./eligibility-input-context.js"
import { useMemo } from "react"
import type { UsStateCode } from "@usebridge/sdk-core"

/**
 * Manages state for the State Code being selected
 */
export function useEligibilityInputState(): [
  UsStateCode | null,
  (state: UsStateCode | null) => void,
] {
  const {
    state: { value, set },
  } = useEligibilityInput()
  return useMemo(() => [value, set], [value, set])
}
