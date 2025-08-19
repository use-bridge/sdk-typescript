import { filter, isEmpty } from "lodash-es"
import type { IneligibilityReason } from "../ineligibile-reasons.js"
import type { ServiceEligibility } from "../../types/index.js"
import { Strings } from "../../lib/strings.js"

/**
 * For a given list of ServiceEligibility, returns the ineligibility reason if the status is INELIGIBLE
 * @throw {Error} if no ineligible services are found
 */
export function ineligibilityReasonFromServiceEligibility(
  serviceEligibility: ServiceEligibility[],
): IneligibilityReason {
  // If none are ineligible, throw an error (you shouldn't be calling this)
  const ineligibleServices = filter(serviceEligibility, { status: "INELIGIBLE" })
  if (isEmpty(ineligibleServices)) throw new Error("No ineligible services found")

  // TODO We're waiting on backend support for codes here, beyond just a 'message' value
  // Until then, we're stuck just passing through a 'DENIED' code with the first message we see
  const firstMessage = ineligibleServices.find((e) => e.messages?.at(0))
  if (firstMessage) return { code: "DENIED", message: firstMessage.messages![0] }

  // If there are no ineligibility messages, and we have providers, patient isn't actually ineligible (unexpected usage)
  if (ineligibleServices.some((e) => e.providers?.length))
    throw new Error("Patient may not be ineligible")

  // This means we're ineligible because there are no providers enrolled
  return { code: "PROVIDERS", message: Strings.ineligibility.NO_PROVIDERS }
}
