import type { Provider, ResolvedProvider, ServiceTypeMergeStrategy } from "../types/index.js"

/**
 * This shape matches both eligibility responses
 */
interface EligibilityResponse {
  status: "ELIGIBLE" | string
  serviceTypeId: string
  providers: Provider[]
}

/**
 * Resolves the providers from multiple eligibility responses, for a given strategy
 * @param responses list of either the ProviderEligibility or ServiceEligibility responses
 * @param mergeStrategy how to combine the results, defaults to UNION
 */
export function resolveProviders(
  responses: EligibilityResponse[],
  mergeStrategy: ServiceTypeMergeStrategy,
): ResolvedProvider[] {
  // Map every provider to their ELIGIBLE ServiceType IDs
  const providers: Record<string, ResolvedProvider> = {}
  for (const response of responses) {
    if (response.status !== "ELIGIBLE") continue
    for (const provider of response.providers) {
      providers[provider.id] = {
        ...provider,
        serviceTypeIds: [...(providers[provider.id]?.serviceTypeIds || []), response.serviceTypeId],
      }
    }
  }
  const allProviders = Object.values(providers)

  // If it's INTERSECTION, filter to only those who appear in every response
  if (mergeStrategy === "INTERSECTION") {
    // If any response is not ELIGIBLE, no provider can appear in ALL responses
    if (responses.some((r) => r.status !== "ELIGIBLE")) {
      return []
    }

    const eligibleResponses = responses.filter((r) => r.status === "ELIGIBLE")
    return allProviders.filter((provider) =>
      eligibleResponses.every((response) => response.providers.some((p) => p.id === provider.id)),
    )
  }

  return allProviders
}
