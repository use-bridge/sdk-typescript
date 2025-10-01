import { HardEligibilitySession } from "@usebridge/sdk-core"
import { HardEligibilityContext } from "./hard-eligibility-context.js"
import { EligibilityInputProvider } from "../eligibility-input/eligibility-input-provider.js"
import type { FC, PropsWithChildren } from "react"

interface HardEligibilityProviderProps extends PropsWithChildren {
  session: HardEligibilitySession
}

/**
 * Provides the context for HardEligibility hooks
 */
export const HardEligibilityProvider: FC<HardEligibilityProviderProps> = ({
  session,
  children,
}) => (
  <HardEligibilityContext.Provider value={session}>
    <EligibilityInputProvider>{children}</EligibilityInputProvider>
  </HardEligibilityContext.Provider>
)
