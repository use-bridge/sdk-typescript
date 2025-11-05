import type {
  ClinicalInfo,
  ConditionalPatientResponsibility,
  DateObject,
  EstimateSelection,
  PatientResponsibility,
  Policy,
  ResolvedProvider,
  ServiceEligibility,
  ServiceTypeId,
  ServiceTypeMergeStrategy,
  UsStateCode,
} from "../types/index.js"
import type { IneligibilityReason } from "./ineligibile-reasons.js"

/**
 * Patient information required to create a new Policy
 */
export interface HardEligibilityPatientInput {
  payerId: string
  firstName: string
  lastName: string
  dateOfBirth: DateObject
  memberId?: string
}

/**
 * Common fields shared by both session config variants
 */
export interface HardEligibilitySessionConfigBase {
  /**
   * List of ServiceType IDs to check against
   */
  serviceTypeIds: ServiceTypeId[]
  /**
   * How to combine results of multiple ServiceTypes, defaults to UNION
   */
  mergeStrategy?: ServiceTypeMergeStrategy
  /**
   * How to select an estimate when multiple ServiceTypes are eligible, defaults to HIGHEST
   */
  estimateSelection?: EstimateSelection
  /**
   * The date of service to check against, defaults to today
   */
  dateOfService?: DateObject
  /**
   * Time to wait for a Policy to be resolved until we consider it a timeout
   * Defaults to 20s
   */
  policyTimeoutMs?: number
  /**
   * Time to wait for a ServiceEligibility to be resolved after the Policy, before considering timeout
   * Defaults to 20s
   */
  eligibilityTimeoutMs?: number
  /**
   * Interval between polling for updates, defaults to 1s
   */
  pollingIntervalMs?: number
}

/**
 * Configures the Hard Eligibility Session
 * Either provide an existing Policy ID, or omit patient info (will be provided on submit)
 */
export type HardEligibilitySessionConfig =
  | (HardEligibilitySessionConfigBase & {
      /**
       * Use an existing Policy ID instead of creating a new Policy
       * The Policy is assumed to exist and be valid
       */
      policyId: string
    })
  | HardEligibilitySessionConfigBase

/**
 * Error code for hard eligibility issues
 */
export type HardEligibilityErrorCode =
  | "NOT_FOUND_NAME" // Patient wasn't, hints at name mismatch
  | "NOT_FOUND_MEMBER_ID" // Patient wasn't found, hints at Member ID mismatch
  | "NOT_FOUND_DATE_OF_BIRTH" // Patient wasn't found, hints at Date of Birth mismatch
  | "PAYER_ERROR" // Payer returned server error, retry
  | "SERVER_ERROR" // Unexpected server error, retry
  | "TIMEOUT" // Payer timed out

/**
 * Describes the error that should be displayed to the user
 */
export interface HardEligibilityError {
  /**
   * Error code, if customizing the messages
   */
  code: HardEligibilityErrorCode

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
  forceMemberId?: boolean
}

/**
 * Current status of a Hard Eligibility Session
 */
export type HardEligibilitySessionStatus =
  | "PENDING" // Nothing has been submitted yet
  | "SERVER_ERROR" // An unexpected server error occurred, retry
  | "TIMEOUT" // Policy/ServiceEligibility resolution took too long, may retry with same inputs
  | "WAITING_FOR_POLICY" // Policy was created, waiting for resolution
  | "POLICY_ERROR" // Policy resolution finished, with an error, retry with same or new inputs
  | "WAITING_FOR_SERVICE_ELIGIBILITY" // ServiceEligibility was created, waiting for resolution
  | "INELIGIBLE" // ServiceEligibility resolved, patient is not eligible due to plan/providers
  | "ELIGIBLE" // The patient is eligible, there are Providers

/**
 * Hint at the next action to take
 */
export type HardEligibilitySessionAction =
  | "RETRY" // It's possible to retry with the same inputs
  | "INPUT" // New input is required from the patient to progress
  | "INPUT_MEMBER_ID" // New input is required, and the Member ID should be collected

/**
 * Arguments for submitting a request within a Hard Eligibility Session
 */
export interface HardEligibilitySubmissionArgs {
  /**
   * The patient's location at the time of the Service
   * Required for ServiceEligibility creation
   */
  state: UsStateCode
  /**
   * Clinical information to influence eligibility
   */
  clinicalInfo?: ClinicalInfo
  /**
   * Patient information to create a new Policy
   * Required when session config does not include a policyId
   */
  patient?: HardEligibilityPatientInput
}

/**
 * The expected PatientResponsibility for an ELIGIBLE HardEligibilitySession
 */
export interface HardEligibilityPatientResponsibility {
  /**
   * The primary estimate for the patient
   */
  estimate: PatientResponsibility
  /**
   * A conditional estimate, if applicable
   */
  conditionalEstimate?: ConditionalPatientResponsibility
}

/**
 * Current state of a Hard Eligibility Session
 */
export interface HardEligibilitySessionState {
  /**
   * The current status of the session, begins PENDING
   */
  status: HardEligibilitySessionStatus

  /**
   * The arguments used to submit the latest request
   */
  args?: HardEligibilitySubmissionArgs

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
  policy?: Policy

  /**
   * If the ServiceEligibility resolved to eligible/ineligible, this contains the final set of ServiceEligibility
   * The key of the object is each ServiceType ID
   */
  serviceEligibility?: Record<ServiceTypeId, ServiceEligibility>

  /**
   * If eligible, the final patient responsibility determination
   */
  patientResponsibility?: HardEligibilityPatientResponsibility

  /**
   * If the status is ELIGIBLE, this contains the final set of EligibleProviders
   */
  providers?: ResolvedProvider[]

  /**
   * If the patient is INELIGIBLE, this contains the reason
   */
  ineligibilityReason?: IneligibilityReason
}
