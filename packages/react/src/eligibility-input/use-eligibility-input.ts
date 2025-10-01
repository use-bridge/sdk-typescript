import { useContext } from "react"
import { EligibilityInputContext } from "./eligibility-input-context.js"
import { useStore } from "zustand"

/**
 * Resolves the EligibilityInputStore from context
 */
export const useEligibilityInput = () => {
  const store = useContext(EligibilityInputContext)
  if (!store) throw new Error("useEligibilityInputStore must be within an EligibilityInputProvider")
  return useStore(store)
}
