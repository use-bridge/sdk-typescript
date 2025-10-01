import { createContext } from "react"
import { HardEligibilitySession } from "@usebridge/sdk-core"

/**
 * Context for the HardEligibilitySession
 */
export const HardEligibilityContext = createContext<HardEligibilitySession | null>(null)
