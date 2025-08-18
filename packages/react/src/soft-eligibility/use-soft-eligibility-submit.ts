import { useCallback } from "react"
import { useSoftEligibilitySession } from "./use-soft-eligibility.js"
import { useEligibilityInput } from "../eligibility-input/use-eligibility-input.js"

/**
 * Returns a function to submit requests into the Soft Eligibility Session
 * Parses the arguments required for the submission from the EligibilityInput
 */
export function useSoftEligibilitySubmit() {
  const session = useSoftEligibilitySession()
  const { payer, state } = useEligibilityInput()

  // Returns a function that grabs input and submits
  return useCallback(() => {
    // If it isn't ready, throw an error
    if (!payer.value) throw new Error("Payer is required")
    if (!state.value) throw new Error("State is required")
    // Translate into args and submit
    return session.submit({ payerId: payer.value.id, state: state.value })
  }, [session, payer, state])
}
