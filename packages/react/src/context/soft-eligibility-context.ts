import { SoftEligibilitySession } from "@usebridge/sdk-core"
import { createContext } from "react"

/**
 * React context for a SoftEligibilitySession
 */
export const SoftEligibilityContext = createContext<SoftEligibilitySession | null>(null)
