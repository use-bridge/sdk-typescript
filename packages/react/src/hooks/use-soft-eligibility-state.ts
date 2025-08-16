import { useEffect, useState } from "react"
import { type SoftEligibilitySessionState } from "@usebridge/sdk-core"
import { useSoftEligibilitySession } from "./lib/use-soft-eligibility.js"

/**
 * Resolves to the SoftEligibilitySessionState
 * Re-renders on state change
 */
export function useSoftEligibilityState(): SoftEligibilitySessionState {
  const session = useSoftEligibilitySession()

  // We're tracking the state value internally, start with what the `session gives us
  const [state, setState] = useState(session.state)

  // Listen in for events, the payload is the state object itself
  useEffect(() => {
    session.on("update", setState)
    return () => {
      session.removeListener("update", setState)
    }
  }, [session])

  return state
}
