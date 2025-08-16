import { useContext } from "react"
import { SoftEligibilitySession } from "@usebridge/sdk-core"
import { SoftEligibilityContext } from "../../context/soft-eligibility-context.js"

/**
 * Resolves to the SoftEligibilitySession from context
 */
export function useSoftEligibilitySession(): SoftEligibilitySession {
  const session = useContext(SoftEligibilityContext)
  if (!session) throw new Error("useSoftEligibilitySession must be within a SoftEligibilityContext")
  return session
}
