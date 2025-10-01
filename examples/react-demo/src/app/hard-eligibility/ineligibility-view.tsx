import { useHardEligibilityState } from "@usebridge/sdk-react"

/**
 * Displays ineligibility reasons
 */
export const IneligibilityView = () => {
  const { ineligibilityReason } = useHardEligibilityState()
  if (!ineligibilityReason) return null

  return <pre>{JSON.stringify(ineligibilityReason, null, 2)}</pre>
}
