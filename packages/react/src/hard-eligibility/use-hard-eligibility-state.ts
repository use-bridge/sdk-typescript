import { useEffect, useState } from "react"
import { type HardEligibilitySessionState } from "@usebridge/sdk-core"
import { useHardEligibilitySession } from "./use-hard-eligibility.js"

/**
 * Resolves to the SoftEligibilitySessionState
 * Re-renders on state change
 */
export function useHardEligibilityState(): HardEligibilitySessionState {
  const session = useHardEligibilitySession()

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
