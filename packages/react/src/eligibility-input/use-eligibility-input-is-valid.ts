import { useEligibilityInput } from "./eligibility-input-context.js"

/**
 * Determines whether the input is valid or not
 */
export function useEligibilityInputIsValid(): boolean {
  const {
    payer,
    state,
    firstName,
    lastName,
    dateOfBirth,
    memberId,
    requirePatient,
    forceMemberId,
  } = useEligibilityInput()
  // Payer and State are always required
  if (!payer.value) return false
  if (!state.value) return false

  // If patient is not required, we can skip the patient validation
  if (!requirePatient) return true

  // These must be valid
  if (!firstName.value) return false
  if (!lastName.value) return false
  if (!dateOfBirth.value) return false

  // If forced or payer requires it, memberId must be present
  if ((forceMemberId || payer.value.memberId) && !memberId.value) return false

  return true
}
