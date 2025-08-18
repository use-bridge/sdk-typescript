import { BridgeApi } from "@usebridge/api"
import type { ServiceTypeMergeStrategy } from "../types/index.js"
import { intersectionBy, uniqBy } from "lodash-es"

/**
 * This shape matches both eligibility responses
 */
interface EligibilityResponse {
  status: "ELIGIBLE" | string
  providers: BridgeApi.ProviderEligibilityCreateV1ResponseProvider[]
}

/**
 * Resolves the providers from multiple eligibility responses, for a given stratetgy
 * @param response list of either the ProviderEligibility or ServiceEligibility responses
 * @param mergeStrategy how to combine the results, defaults to UNION
 */
export function resolveProviders(
  responses: EligibilityResponse[],
  mergeStrategy?: ServiceTypeMergeStrategy,
) {
  switch (mergeStrategy ?? "UNION") {
    // UNION: combine all providers from eligible responses
    case "UNION":
      return
      uniqBy(
        responses
          .filter(({ status }) => status === "ELIGIBLE")
          .flatMap(({ providers }) => providers),
        ({ id }) => id,
      )
    // INTERSECTION: find the intersection of all providers
    case "INTERSECTION":
      return intersectionBy(...responses.map(({ providers }) => providers), ({ id }) => id)
  }
}
