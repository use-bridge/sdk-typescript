import { createContext } from "react"
import { type EligibilityInputState } from "./eligibility-input-store.js"
import { type StoreApi } from "zustand"

/**
 * Context holding the EligibilityInputStore
 */
export const EligibilityInputContext = createContext<StoreApi<EligibilityInputState> | null>(null)
