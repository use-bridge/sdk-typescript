import type {
  SoftEligibilitySessionConfig,
  SoftEligibilitySessionStatus,
  SoftEligibilitySubmissionArgs,
} from "../soft-eligibility-session/types.js"
import type {
  HardEligibilitySessionConfig,
  HardEligibilitySubmissionArgs,
  HardEligibilitySessionStatus,
  HardEligibilityError,
  HardEligibilityPatientResponsibility,
} from "../hard-eligibility-session/types.js"
import type { IneligibilityReason } from "../hard-eligibility-session/ineligibile-reasons.js"
import type { UsStateCode } from "../types/us-states.js"

interface InputFieldState {
  value: unknown
  isVisible: boolean
  isValid: boolean
  isRequired: boolean
  isDisabled: boolean
}

// Defines the analytics events
interface AnalyticsEvents {
  // Fired immediately on successful SDK create
  "sdk.initialized": {
    environment: string
  }
  // Fired if there's an error on SDK create
  "sdk.error": {
    message: string
  }
  // Payer searches
  "input.payer.search": {
    query: string
    limit?: number
    resultCount: number
    cacheHit: boolean
    durationMs: number
  }
  // Input state changes
  "input.state.updated": {
    firstName: InputFieldState
    lastName: InputFieldState
    dateOfBirth: InputFieldState
    memberId: InputFieldState
    payer: InputFieldState
    state: InputFieldState
    isValid: boolean
  }
  // Soft Eligibility Session initialized
  "soft_eligibility.session.created": {
    sessionId: string
    config: SoftEligibilitySessionConfig
  }
  // Soft Eligibilty Session starts submit
  "soft_eligibility.session.submit": {
    sessionId: string
    args: SoftEligibilitySubmissionArgs
  }
  // Soft Eligibility Session state updated
  "soft_eligibility.session.updated": {
    sessionId: string
    status: SoftEligibilitySessionStatus
    providers?: number
  }
  // Soft Eligibility Session complete, ineligible
  "soft_eligibility.session.complete.ineligible": {
    sessionId: string
    dateOfService: string
    payerId: string
    state: UsStateCode
  }
  // Soft Eligibility Session complete, eligible
  "soft_eligibility.session.complete.eligible": {
    sessionId: string
    dateOfService: string
    payerId: string
    state: UsStateCode
    providerCount: number
  }
  // Hard Eligibility Session initialized
  "hard_eligibility.session.created": {
    sessionId: string
    config: HardEligibilitySessionConfig
  }
  // Hard Eligibility Session starts submit
  "hard_eligibility.session.submit": {
    sessionId: string
    args: HardEligibilitySubmissionArgs
  }
  // Hard Eligibility state update
  "hard_eligibility.session.updated": {
    sessionId: string
    status: HardEligibilitySessionStatus
    policyId: string | null
    serviceEligibilityIds: string[]
    error: HardEligibilityError | null
  }
  // Hard Eligibility Session complete, ineligible
  "hard_eligibility.session.complete.ineligible": {
    sessionId: string
    dateOfService: string
    state: UsStateCode
    policyId: string
    serviceEligibilityIds: string[]
    ineligibilityReason: IneligibilityReason | null
    submitCount: number
    durationMs: number
    durationSinceFirstSubmitMs: number
  }
  // Hard Eligibility Session complete, eligible
  "hard_eligibility.session.complete.eligible": {
    sessionId: string
    dateOfService: string
    state: UsStateCode
    providerCount: number
    policyId: string
    serviceEligibilityIds: string[]
    patientResponsibility: HardEligibilityPatientResponsibility
    submitCount: number
    durationMs: number
    durationSinceFirstSubmitMs: number
  }
}

/**
 * The name of an analytics event
 */
export type AnalyticsEventName = keyof AnalyticsEvents

/**
 * Data for a specific analytics event
 */
export type AnalyticsEvent<T extends AnalyticsEventName = AnalyticsEventName> = AnalyticsEvents[T]
