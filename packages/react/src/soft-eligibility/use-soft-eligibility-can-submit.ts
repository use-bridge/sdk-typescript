import { useEligibilityInputIsValid } from "../eligibility-input/index.js"
import { useSoftEligibilitySession } from "./use-soft-eligibility.js"

/**
 * Determines whether the user can submit soft eligibility, given input and state
 */
export function useSoftEligibilityCanSubmit() {
  const {
    state: { status },
  } = useSoftEligibilitySession()
  const inputIsValid = useEligibilityInputIsValid()

  // If there's a request in flight, we cannot
  if (status === "SUBMITTING") return false
  // If we're eligible, there's no need to submit
  if (status === "ELIGIBLE") return false

  // Otherwise, input must be valid
  return inputIsValid
}
