import { useContext } from "react"
import { HardEligibilitySession } from "@usebridge/sdk-core"
import { HardEligibilityContext } from "./hard-eligibility-context.js"

/**
 * Resolves to the HardEligibilitySession from context
 */
export function useHardEligibilitySession(): HardEligibilitySession {
  const session = useContext(HardEligibilityContext)
  if (!session) throw new Error("useHardEligibilitySession must be within a SoftEligibilityContext")
  return session
}
