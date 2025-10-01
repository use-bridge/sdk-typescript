import { useCallback, useMemo } from "react"
import { useEligibilityInput } from "../eligibility-input/use-eligibility-input.js"
import {
  dateToDateObject,
  HardEligibility,
  type HardEligibilitySessionState,
} from "@usebridge/sdk-core"
import { useHardEligibilitySession } from "../hard-eligibility/use-hard-eligibility.js"
import { useEligibilityInputField, useEligibilityInputIsValid } from "../eligibility-input/index.js"
import { useHardEligibilityState } from "./use-hard-eligibility-state.js"

/**
 * Returns a function to submit requests into the Hard Eligibility Session
 * Parses the arguments required for the submission from the EligibilityInput
 */
export function useHardEligibilitySubmit(): {
  isDisabled: boolean
  submit: () => Promise<HardEligibilitySessionState>
} {
  const session = useHardEligibilitySession()
  const { payer, state, firstName, lastName, memberId, dateOfBirth } = useEligibilityInput()
  const { isVisible: isMemberIdVisible, isRequired: isMemberIdRequired } =
    useEligibilityInputField("memberId")

  // Whether this is ready or not
  const { status } = useHardEligibilityState()
  const inputIsValid = useEligibilityInputIsValid()
  const isDisabled = !inputIsValid || !HardEligibility.canSubmit(status)

  // Function that grabs input and submits
  const submit = useCallback(() => {
    // If it isn't ready, throw an error
    if (!payer.value) throw new Error("Payer is required")
    if (!state.value) throw new Error("State is required")
    if (!firstName.value) throw new Error("First name is required")
    if (!lastName.value) throw new Error("Last name is required")
    if (!dateOfBirth.value) throw new Error("Date of birth is required")
    if (isMemberIdRequired && !memberId.value) throw new Error("Member ID is required")

    // Translate into args and submit
    return session.submit({
      payerId: payer.value.id,
      state: state.value,
      firstName: firstName.value,
      lastName: lastName.value,
      memberId: isMemberIdVisible ? memberId.value : undefined,
      dateOfBirth: dateToDateObject(dateOfBirth.value),
    })
  }, [session, payer, state, firstName, lastName, dateOfBirth, memberId])

  return useMemo(() => ({ isDisabled, submit }), [isDisabled, submit])
}
