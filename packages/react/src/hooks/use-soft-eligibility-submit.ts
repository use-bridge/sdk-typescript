import { useSoftEligibilitySession } from "./lib//use-soft-eligibility.js"
import { useCallback } from "react"

/**
 * Returns a function to submit requests into the Soft Eligibility Session
 */
export function useSoftEligibilitySubmit() {
  const session = useSoftEligibilitySession()
  return useCallback(
    (...args: Parameters<typeof session.submit>) => session.submit(...args),
    [session],
  )
}
