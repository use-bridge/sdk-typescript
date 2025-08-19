import { BridgeApi } from "@usebridge/api"

export * from "./config.js"
export * from "./us-states.js"

/**
 * Object representation of a date
 */
export interface DateObject {
  year: string
  month: string
  day: string
}

/**
 * Types the ID of a ServiceType
 */
export type ServiceTypeId = string

/**
 * Defines how the result of multiple ServiceTypes should be merged together
 *
 * UNION - Only one type is required to be eligible, and Provider's will be merged from all results
 * INTERSECTION - All types must be eligible, and Provider's must appear in all results
 */
export type ServiceTypeMergeStrategy = "UNION" | "INTERSECTION"

/**
 * Defines how an estimate is selected when multiple ServiceTypes are eligible
 *
 * HIGHEST - The highest estimate is selected
 * LOWEST - The lowest estimate is selected
 * SERVICE_TYPE - The estimate for a specific ServiceType is selected
 */
export type EstimateSelection =
  | { mode: "HIGHEST" | "LOWEST"; serviceTypeId?: never }
  | { mode: "SERVICE_TYPE"; serviceTypeId: string }

/**
 * Common Payer resource
 */
export type Payer = BridgeApi.payers.PayerGetV1Response & BridgeApi.search.SearchPayerV1ResponseItem

/**
 * Collection of Payers from the search results
 */
export type PayerSearchResults = BridgeApi.SearchPayerV1Response & { items: Payer[] }

/**
 * Policy resource
 */
export type Policy = BridgeApi.policies.v2.PolicyCreateV2Response

/**
 * Policy resource that's reached a resolved state
 */
export type ResolvedPolicy = Policy & { status: "CONFIRMED" | "INVALID" }

/**
 * ProviderEligibility resource
 */
export type ProviderEligibility = BridgeApi.ProviderEligibilityCreateV1Response

/**
 * ServiceEligibility resource
 */
export type ServiceEligibility = BridgeApi.serviceEligibility.v2.ServiceEligibilityCreateV2Response

/**
 * ServiceEligibility resource that's reached a resolved state
 */
export type ResolvedServiceEligibility = ServiceEligibility & { status: "ELIGIBLE" | "INELIGIBLE" }

/**
 * Common Provider resource
 */
export type Provider = BridgeApi.ProviderEligibilityCreateV1ResponseProvider &
  BridgeApi.serviceEligibility.ServiceEligibilityCreateV2ResponseProvider

/**
 * PatientResponsibility resource
 */
export type PatientResponsibility =
  BridgeApi.serviceEligibility.v2.ServiceEligibilityCreateV2ResponsePatientResponsibility

/**
 * ConditionalPatientResponsibility resource
 */
export type ConditionalPatientResponsibility =
  BridgeApi.serviceEligibility.v2.ServiceEligibilityCreateV2ResponseConditionalPatientResponsibility
