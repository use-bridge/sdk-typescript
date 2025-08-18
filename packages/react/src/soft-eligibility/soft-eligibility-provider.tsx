import { type FC, type PropsWithChildren } from "react"
import { SoftEligibilitySession } from "@usebridge/sdk-core"
import { SoftEligibilityContext } from "./soft-eligibility-context.js"
import { EligibilityInputProvider } from "../eligibility-input/eligibility-input-provider.js"

interface SoftEligibilityProviderProps extends PropsWithChildren {
  session: SoftEligibilitySession
}

/**
 * Provides the context for SoftEligibility hooks
 */
export const SoftEligibilityProvider: FC<SoftEligibilityProviderProps> = ({
  session,
  children,
}) => (
  <SoftEligibilityContext.Provider value={session}>
    <EligibilityInputProvider>{children}</EligibilityInputProvider>
  </SoftEligibilityContext.Provider>
)
