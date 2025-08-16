import type { FC, PropsWithChildren } from "react"
import { SoftEligibilitySession } from "@usebridge/sdk-core"
import { SoftEligibilityContext } from "../context/index.js"

interface SoftEligibilityProviderProps extends PropsWithChildren {
  session: SoftEligibilitySession
}

/**
 * Provides the context for SoftEligibility hooks
 */
export const SoftEligibilityProvider: FC<SoftEligibilityProviderProps> = ({
  session,
  children,
}) => <SoftEligibilityContext.Provider value={session}>{children}</SoftEligibilityContext.Provider>
