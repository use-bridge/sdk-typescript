import { type FC, type PropsWithChildren, useContext, useRef } from "react"
import { type StoreApi } from "zustand"
import {
  createEligibilityInputStore,
  type EligibilityInputState,
} from "./eligibility-input-store.js"
import { SoftEligibilityContext } from "../soft-eligibility/soft-eligibility-context.js"
import { EligibilityInputContext } from "./eligibility-input-context.js"
import { HardEligibilityContext } from "../hard-eligibility/index.js"

/**
 * Provider for the EligibilityInputStore, eligibility input hooks should be nested within
 */
export const EligibilityInputProvider: FC<PropsWithChildren> = ({ children }) => {
  const storeRef = useRef<StoreApi<EligibilityInputState> | null>(null)
  const softEligibilityContext = useContext(SoftEligibilityContext)
  const hardEligibilityContext = useContext(HardEligibilityContext)
  if (!storeRef.current) {
    let requirePatient
    if (softEligibilityContext) requirePatient = false
    if (hardEligibilityContext) requirePatient = true
    else throw new Error("Missing SoftEligibilityContext or HardEligibilityContext")
    storeRef.current = createEligibilityInputStore(requirePatient)
  }
  return (
    <EligibilityInputContext.Provider value={storeRef.current}>
      {children}
    </EligibilityInputContext.Provider>
  )
}
