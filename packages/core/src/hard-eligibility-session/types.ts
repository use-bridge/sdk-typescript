// TODO Replace with a reference to generated API client, Policy response
import type {
  DateObject,
  EstimateSelection,
  ServiceTypeId,
  ServiceTypeMergeStrategy,
} from "../types/index.js"

type ApiClientPolicy = object

// TODO Replace with a reference to generated API client, ServiceEligibility response
type ApiClientServiceEligibility = object

/**
 * Configures the Hard Eligibility Session
 */
export interface HardEligibilitySessionConfig {
  /**
   * The date of service to check against, defaults to today
   */
  serviceTypeIds: ServiceTypeId[]
  /**
   * List of ServiceType IDs to check against
   */
  mergeStrategy?: ServiceTypeMergeStrategy
  /**
   * How to select an estimate when multiple ServiceTypes are eligible, defaults to HIGHEST
   */
  estimateSelection?: EstimateSelection
  /**
   * How to combine results of multiple ServiceTypes, defaults to UNION
   */
  dateOfService?: DateObject
}

/**
 * Describes the error that should be displayed to the user
 */
export interface HardEligibilityError {
  /**
   * Error code, if customizing the messages
   */
  code:
    | "NOT_FOUND_DATE_OF_BIRTH" // Patient wasn't found, hints at Date of Birth mismatch
    | "NOT_FOUND_NAME" // Patient wasn't found, hints at name mismatch
    | "NOT_FOUND_MEMBER_ID" // Patient wasn't found, hints at Member ID mismatch
    | "SERVER_ERROR" // Unexpected server error, retry
    | "PAYER_TIMEOUT" // Error reported from the payer, retry
  // TODO There are more here

  /**
   * User-friendly message to display
   */
  message: string

  /**
   * Whether this is retryable with the same input
   */
  retryable: boolean

  /**
   * Whether to require the Member ID, even if the Payer does not require it
   */
  requireMemberId?: boolean
}

/**
 * Current status of a Hard Eligibility Session
 */
export type HardEligibilitySessionStatus =
  | "PENDING" // Nothing has been submitted yet
  | "SUBMITTING_POLICY" // Policy is being submitted, wait for results
  | "POLICY_TIMEOUT" // Policy resolution took too long, retry with same inputs
  | "POLICY_ERROR" // Policy resolution finished, with an error, retry with same or new inputs
  | "POLICY_NOT_FOUND" // Policy resolution finished, could not be resolved, retry with new inputs
  | "SUBMITTING_SERVICE_ELIGIBILITY" // ServiceEligibility is being submitted, wait for results
  | "SERVICE_ELIGIBILITY_TIMEOUT" // ServiceEligibility did not resolve in time, retry with same inputs
  | "INELIGIBLE_PLAN" // ServiceEligibility resolved, the plan is not eligible
  | "INELIGIBLE_PROVIDERS" // ServiceEligibility resolved, the plan is eligible, but there are no Providers
  | "ELIGIBLE" // The patient is eligible, there are Providers

/**
 * Hint at the next action to take
 */
export type HardEligibilitySessionAction =
  | "RETRY" // It's possible to retry with the same inputs
  | "INPUT" // New input is required from the patient to progress
  | "INPUT_MEMBER_ID" // New input is required, and the Member ID should be collected

/**
 * Current state of a Hard Eligibility Session
 */
export interface HardEligibilitySessionState {
  /**
   * Unique ID for this session
   */
  id: string

  /**
   * The current status of the session, begins PENDING
   */
  status: HardEligibilitySessionStatus

  /**
   * If appropriate, hints to the next action that should be taken
   */
  nextAction?: HardEligibilitySessionAction

  /**
   * If applicable, details the error that should be displayed to the user
   */
  error?: HardEligibilityError

  /**
   * The most recent Policy, if applicable
   */
  policy?: ApiClientPolicy

  /**
   * If the ServiceEligibility resolved to eligible/ineligible, this contains the final set of ServiceEligibility
   * The key of the object is each ServiceType ID
   */
  serviceEligibility?: Record<ServiceTypeId, ApiClientServiceEligibility>
}
