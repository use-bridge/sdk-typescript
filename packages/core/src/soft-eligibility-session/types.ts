import type {
  DateObject,
  EligibleProvider,
  ServiceTypeId,
  ServiceTypeMergeStrategy,
} from "../types/index.ts"

/**
 * Should be the API's 'ProviderEligibility' resource
 * TODO We're waiting on the API Client, use those instead
 */
type ApiClientProviderEligibility = object

/**
 * Configures the Soft Eligibility Session
 */
export interface SoftEligibilitySessionConfig {
  /**
   * The date of service to check against, defaults to today
   */
  serviceTypeIds: ServiceTypeId[]
  /**
   * List of ServiceType IDs to check against
   */
  mergeStrategy?: ServiceTypeMergeStrategy
  /**
   * How to combine results of multiple ServiceTypes, defaults to UNION
   */
  dateOfService?: DateObject
}

/**
 * Status of the Session
 */
export type SoftEligibilitySessionStatus =
  | "PENDING" // Nothing has been submitted yet
  | "SUBMITTING" // The request is processing
  | "ERROR" // The most recent request failed, it may be retried
  | "INELIGIBLE" // The most recent request resolved to be ineligible
  | "ELIGIBLE" // The most recent request resolved to be eligible

/**
 * Possible actions that can be taken on a soft eligibility session
 *
 * RETRY = It's possible to retry a new request
 */
export type SoftEligibilitySessionAction = "RETRY"

/**
 * Current state of a Soft Eligibility Session
 */
export interface SoftEligibilitySessionState {
  /**
   * Unique ID for this session
   */
  id: string

  /**
   * The current status of the session, begins PENDING
   */
  status: SoftEligibilitySessionStatus

  /**
   * If defined, hints for the next action that should be taken
   */
  nextAction?: SoftEligibilitySessionAction

  /**
   * If the status is ELIGIBLE, this contains the final set of EligibleProviders
   */
  providers?: ReadonlyArray<EligibleProvider>

  /**
   * If the status is INELIGIBLE or ELIGIBLE, this contains the final set of ProviderEligibility resources
   * The key of the object is each ServiceType ID
   */
  providerEligibility?: Record<ServiceTypeId, ApiClientProviderEligibility>
}
