import { useCallback } from "react"
import { useBridgeSdk } from "../sdk/index.js"

/**
 * Hook returning a function that creates a new SoftEligibilitySession
 */
export function useCreateSoftEligibilitySession() {
  const bridgeSdk = useBridgeSdk()
  return useCallback(
    (...args: Parameters<typeof bridgeSdk.createSoftEligibilitySession>) =>
      bridgeSdk.createSoftEligibilitySession(...args),
    [bridgeSdk],
  )
}
