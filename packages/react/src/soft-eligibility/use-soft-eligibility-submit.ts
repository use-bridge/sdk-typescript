import { useCallback, useMemo } from "react"
import { useSoftEligibilitySession } from "./use-soft-eligibility.js"
import { useEligibilityInput } from "../eligibility-input/use-eligibility-input.js"
import { SoftEligibility, type SoftEligibilitySessionState } from "@usebridge/sdk-core"
import { useEligibilityInputIsValid } from "../eligibility-input/index.js"
import { useSoftEligibilityState } from "./use-soft-eligibility-state.js"

/**
 * Returns a function to submit requests into the Soft Eligibility Session
 * Parses the arguments required for the submission from the EligibilityInput
 */
export function useSoftEligibilitySubmit(): {
  isDisabled: boolean
  submit: () => Promise<SoftEligibilitySessionState>
} {
  const session = useSoftEligibilitySession()
  const { payer, state } = useEligibilityInput()

  // Whether this is ready or not
  const { status } = useSoftEligibilityState()
  const inputIsValid = useEligibilityInputIsValid()
  const isDisabled = !inputIsValid || !SoftEligibility.canSubmit(status)

  // Function that grabs input and submits
  const submit = useCallback(() => {
    // If it isn't ready, throw an error
    if (!payer.value) throw new Error("Payer is required")
    if (!state.value) throw new Error("State is required")
    // Translate into args and submit
    return session.submit({ payerId: payer.value.id, state: state.value })
  }, [session, payer, state])

  return useMemo(
    () => ({
      isDisabled,
      submit,
    }),
    [isDisabled, submit],
  )
}
