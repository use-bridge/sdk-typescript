import { useEligibilityInputField } from "./use-eligibility-input-field.js"

/**
 * Aggregated determination of whether all inputs are valid
 */
export function useEligibilityInputIsValid(): boolean {
  const fields = [
    useEligibilityInputField("payer"),
    useEligibilityInputField("state"),
    useEligibilityInputField("firstName"),
    useEligibilityInputField("lastName"),
    useEligibilityInputField("dateOfBirth"),
    useEligibilityInputField("memberId"),
  ]
  return fields.every(({ isVisible, isValid }) => !isVisible || (isVisible && isValid))
}
