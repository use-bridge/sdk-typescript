import { createContext, type FC, type PropsWithChildren, useContext, useRef } from "react"
import {
  createEligibilityInputStore,
  type EligibilityInputState,
} from "./eligibility-input-store.js"
import { type StoreApi, useStore } from "zustand"
import { SoftEligibilityContext } from "../soft-eligibility/soft-eligibility-context.js"

/**
 * Context holding the EligibilityInputStore
 */
const EligibilityInputContext = createContext<StoreApi<EligibilityInputState> | null>(null)

/**
 * Provider for the EligibilityInputStore, eligibility input hooks should be nested within
 */
export const EligibilityInputProvider: FC<PropsWithChildren> = ({ children }) => {
  const storeRef = useRef<StoreApi<EligibilityInputState> | null>(null)
  const softEligibilityContext = useContext(SoftEligibilityContext)
  // const softEligibilityContext = useContext(HardEligibilityContext)
  if (!storeRef.current) {
    let requirePatient // TODO Remove this
    if (softEligibilityContext) requirePatient = false
    // if (hardEligibilityContext) requirePatient = true
    else throw new Error("Missing SoftEligibilityContext or HardEligibilityContext")
    storeRef.current = createEligibilityInputStore(requirePatient)
  }
  return (
    <EligibilityInputContext.Provider value={storeRef.current}>
      {children}
    </EligibilityInputContext.Provider>
  )
}

/**
 * Resolves the EligibilityInputStore from context
 */
export const useEligibilityInput = () => {
  const store = useContext(EligibilityInputContext)
  if (!store) throw new Error("useEligibilityInputStore must be within an EligibilityInputProvider")
  return useStore(store)
}
