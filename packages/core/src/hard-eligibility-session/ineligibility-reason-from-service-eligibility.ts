import { BridgeApi } from "@usebridge/api"
import type { HardEligibilityIneligibilityReason } from "./types.js"
import { filter, isEmpty } from "lodash-es"

/**
 * For a given list of ServiceEligibility, returns the ineligibility reason if the status is INELIGIBLE
 * TODO This should be smarter
 * @throw {Error} if no ineligible services are found
 */
export function ineligibilityReasonFromServiceEligibility(
  serviceEligibility: BridgeApi.ServiceEligibilityGetV1Response[],
): HardEligibilityIneligibilityReason {
  // If none are ineligible, throw an error (you shouldn't be calling this)
  const ineligibleServices = filter(serviceEligibility, { status: "INELIGIBLE" })
  if (isEmpty(ineligibleServices)) throw new Error("No ineligible services found")

  // TODO We need to be smart here and actually parse it
  return {
    code: "HMO",
    message: "Todo, there's work here",
  }
}
