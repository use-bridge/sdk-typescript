import { useCallback, useMemo } from "react"
import { useEligibilityInput } from "../eligibility-input/use-eligibility-input.js"
import {
  HardEligibility,
  type ClinicalInfo,
  type HardEligibilitySessionState,
  dateToDateObject,
} from "@usebridge/sdk-core"
import { useHardEligibilitySession } from "../hard-eligibility/use-hard-eligibility.js"
import { useEligibilityInputIsValid } from "../eligibility-input/index.js"
import { useHardEligibilityState } from "./use-hard-eligibility-state.js"

interface HardEligibilitySubmitCallbackArgs {
  clinicalInfo?: ClinicalInfo
}

/**
 * Returns a function to submit requests into the Hard Eligibility Session
 * Parses the arguments required for the submission from the EligibilityInput
 */
export function useHardEligibilitySubmit(): {
  isDisabled: boolean
  submit: () => Promise<HardEligibilitySessionState>
} {
  const session = useHardEligibilitySession()
  const { state, payer, firstName, lastName, dateOfBirth, memberId } = useEligibilityInput()

  const { status } = useHardEligibilityState()

  const usesExistingPolicy = session.usesExistingPolicy
  const inputIsValid = usesExistingPolicy ? Boolean(state.value) : useEligibilityInputIsValid()

  const isDisabled = !inputIsValid || !HardEligibility.canSubmit(status)

  const submit = useCallback(
    ({ clinicalInfo }: HardEligibilitySubmitCallbackArgs = {}) => {
      if (!state.value) throw new Error("State is required")

      const submitArgs: Parameters<typeof session.submit>[0] = {
        state: state.value,
        clinicalInfo,
      }

      if (!session.usesExistingPolicy) {
        if (!payer.value || !firstName.value || !lastName.value || !dateOfBirth.value) {
          throw new Error("Patient information is required")
        }
        submitArgs.patient = {
          payerId: payer.value.id,
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
          dateOfBirth: dateToDateObject(dateOfBirth.value),
          memberId: memberId.value?.trim() || undefined,
        }
      }

      return session.submit(submitArgs)
    },
    [session, state, payer, firstName, lastName, dateOfBirth, memberId],
  )

  return useMemo(() => ({ isDisabled, submit }), [isDisabled, submit])
}
