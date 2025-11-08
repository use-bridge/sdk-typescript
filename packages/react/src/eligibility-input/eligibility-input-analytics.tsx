import { useEffect, useMemo } from "react"
import { useBridgeSdk } from "../sdk/index.js"
import type { AnalyticEvent } from "@usebridge/sdk-core"
import { useEligibilityInputField } from "./use-eligibility-input-field.js"
import { useEligibilityInputIsValid } from "./use-eligibility-input-is-valid.js"
import { omit } from "lodash-es"

/**
 * Returns just the state properties of a field (without setValue)
 */
function useEligibilityInputFieldState<F extends Parameters<typeof useEligibilityInputField>[0]>(
  field: F,
) {
  const fieldState = useEligibilityInputField(field)
  return useMemo(
    () => omit(fieldState, "setValue"),
    [
      fieldState.value,
      fieldState.isVisible,
      fieldState.isValid,
      fieldState.isRequired,
      fieldState.isDisabled,
    ],
  )
}

/**
 * Monitors changes in the EligibilityInputStore and passes it through to analytics
 */
export const EligibilityInputAnalytics = () => {
  const { _analytics: analytics } = useBridgeSdk()

  const firstName = useEligibilityInputFieldState("firstName")
  const lastName = useEligibilityInputFieldState("lastName")
  const dateOfBirth = useEligibilityInputFieldState("dateOfBirth")
  const memberId = useEligibilityInputFieldState("memberId")
  const payer = useEligibilityInputFieldState("payer")
  const state = useEligibilityInputFieldState("state")
  const isValid = useEligibilityInputIsValid()

  // Take the React package state, translate into the analytics event
  const payload: AnalyticEvent<"input.state.updated"> = useMemo(
    () => ({ firstName, lastName, dateOfBirth, memberId, payer, state, isValid }),
    [firstName, lastName, dateOfBirth, memberId, payer, state, isValid],
  )

  // Whenever this payload changes, send it through to analytics
  useEffect(() => {
    analytics.event("input.state.updated", payload)
  }, [analytics, payload])

  return null
}
