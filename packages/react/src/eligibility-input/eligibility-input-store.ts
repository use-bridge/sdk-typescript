import { createStore } from "zustand"
import type { UsStateCode } from "@usebridge/sdk-core"
import { BridgeApi } from "@usebridge/api"

/**
 * State within the EligibilityInputStore
 */
export interface EligibilityInputState {
  requirePatient: boolean

  payer: {
    value: BridgeApi.SearchPayerV1ResponseItem | null
    set: (payer: BridgeApi.SearchPayerV1ResponseItem | null) => void
  }

  state: {
    value: UsStateCode | null
    set: (state: UsStateCode | null) => void
  }

  firstName: {
    value: string
    set: (firstName: string) => void
  }

  lastName: {
    value: string
    set: (lastName: string) => void
  }

  dateOfBirth: {
    value: Date | null
    set: (dateOfBirth: Date | null) => void
  }

  memberId: {
    value: string
    set: (memberId: string) => void
  }

  forceMemberId: boolean
  setForceMemberId: (force: boolean) => void
}

export function createEligibilityInputStore(requirePatient: boolean) {
  return createStore<EligibilityInputState>()((set, get) => ({
    requirePatient,
    payer: {
      value: null,
      set: (payer) => set((state) => ({ ...state, payer: { ...state.payer, value: payer } })),
    },
    state: {
      value: null,
      set: (state) => set((s) => ({ ...s, state: { ...s.state, value: state } })),
    },
    firstName: {
      value: "",
      set: (firstName) => set((s) => ({ ...s, firstName: { ...s.firstName, value: firstName } })),
    },
    lastName: {
      value: "",
      set: (lastName) => set((s) => ({ ...s, lastName: { ...s.lastName, value: lastName } })),
    },
    dateOfBirth: {
      value: null,
      set: (dateOfBirth) =>
        set((s) => ({ ...s, dateOfBirth: { ...s.dateOfBirth, value: dateOfBirth } })),
    },
    memberId: {
      value: "",
      set: (memberId) => set((s) => ({ ...s, memberId: { ...s.memberId, value: memberId } })),
    },

    forceMemberId: false,
    setForceMemberId: (force) => set((s) => ({ ...s, forceMemberId: force })),
  }))
}
