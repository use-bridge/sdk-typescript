import { useCallback } from "react"
import { useBridgeSdk } from "../sdk/index.js"

/**
 * Hook returning a function that creates a new HardEligibilitySession
 */
export function useCreateHardEligibilitySession() {
  const bridgeSdk = useBridgeSdk()
  return useCallback(
    (...args: Parameters<typeof bridgeSdk.createHardEligibilitySession>) =>
      bridgeSdk.createHardEligibilitySession(...args),
    [bridgeSdk],
  )
}
