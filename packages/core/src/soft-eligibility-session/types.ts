import type {
  DateObject,
  EligibleProvider,
  ServiceTypeId,
  ServiceTypeMergeStrategy,
  UsStateCode,
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
  dateOfService?: DateObject | undefined
  /**
   * List of ServiceType IDs to check against
   */
  serviceTypeIds: ServiceTypeId[]
  /**
   * How to combine results of multiple ServiceTypes, defaults to UNION
   */
  mergeStrategy?: ServiceTypeMergeStrategy | undefined
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
 * Arguments to submit a Soft Eligibility request
 */
export interface SoftEligibilitySubmissionArgs {
  /**
   * The Bridge Payer ID for the request (pyr_xxx)
   */
  payerId: string
  /**
   * The patient's location at the time of the Service
   */
  state: UsStateCode
}

/**
 * Current state of a Soft Eligibility Session
 */
export interface SoftEligibilitySessionState {
  /**
   * The current status of the session, begins PENDING
   */
  status: SoftEligibilitySessionStatus

  /**
   * Arguments used to submit the request
   */
  args?: SoftEligibilitySubmissionArgs

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
