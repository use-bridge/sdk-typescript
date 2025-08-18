import type { EligibilityInputState } from "./eligibility-input-store.js"
import { useContext, useMemo } from "react"
import { HardEligibilityContext } from "../hard-eligibility/hard-eligibility-context.js"
import { useEligibilityInput } from "./use-eligibility-input.js"
import { useHardEligibilityState } from "../hard-eligibility/use-hard-eligibility-state.js"
import { useSoftEligibilityState } from "../soft-eligibility/index.js"
import { HardEligibility, SoftEligibility } from "@usebridge/sdk-core"

type Field = "firstName" | "lastName" | "dateOfBirth" | "memberId" | "payer" | "state"

type FieldState<F extends Field, T = EligibilityInputState[F]["value"]> = {
  value: T
  setValue: (value: T) => void
  isVisible: boolean
  isValid: boolean
  isRequired: boolean
  isDisabled: boolean
}

/**
 * Manages the input state for each field
 */
export function useEligibilityInputField<F extends Field, T = EligibilityInputState[F]["value"]>(
  field: F,
): FieldState<F, T> {
  const input = useEligibilityInput()
  const inputField = input[field]

  const { requirePatient } = input
  const { value, set } = inputField

  // Fetch the HardEligibility context, if it's present
  const hardEligibilityContext = useContext(HardEligibilityContext)

  // Disabled if either of the eligibility contexts are disabled
  let isDisabled = false

  // These are conditional hooks, but, they're safe to call because it's consistent
  try {
    const { status } = useHardEligibilityState()
    isDisabled = !HardEligibility.canSubmit(status)
    if (status === "WAITING_FOR_SERVICE_ELIGIBILITY") isDisabled = true
  } catch (err) {
    // We're here because there's no HardEligibilityContext, which is fine
  }
  try {
    const { status } = useSoftEligibilityState()
    isDisabled = !SoftEligibility.canSubmit(status)
  } catch (err) {
    // We're here because there's no SoftEligibilityContext, which is fine
  }

  // If this requires a patient, we *must* be in the HardEligibility context
  if (requirePatient && !hardEligibilityContext)
    throw new Error(`useEligibilityInputField("${field}") requires a HardEligibilityContext`)

  // These are dependent on state
  let isVisible, isRequired, isValid
  switch (field) {
    case "payer":
    case "state":
      isVisible = true
      isRequired = true
      isValid = Boolean(input[field].value)
      break
    case "firstName":
      isVisible = requirePatient
      isRequired = requirePatient
      isValid = Boolean(input.firstName.value.trim())
    case "lastName":
      isVisible = requirePatient
      isRequired = requirePatient
      isValid = Boolean(input.lastName.value.trim())
      break
    case "dateOfBirth":
      isVisible = requirePatient
      isRequired = requirePatient
      isValid = Boolean(input.dateOfBirth.value)
      break
    case "memberId":
      isVisible = requirePatient
      isRequired = Boolean(
        // Required if we have a Payer selected that requires a Member ID, we need it
        (requirePatient && input.payer.value?.memberId) ||
          // OR, if we have an error that's asking for us to force it
          hardEligibilityContext?.state.error?.forceMemberId,
      )
      isValid = Boolean(input.memberId.value.trim())
      break
    default:
      throw new Error(`Unknown field: ${field}`)
  }

  return useMemo(
    () => ({
      value: value as T,
      setValue: set as (value: T) => void,
      isVisible,
      isValid,
      isRequired,
      isDisabled,
    }),
    [value, set, isVisible, isValid, isRequired, isDisabled],
  )
}
