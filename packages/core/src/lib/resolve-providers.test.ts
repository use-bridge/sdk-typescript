import { describe, it, expect } from "@jest/globals"
import { resolveProviders } from "./resolve-providers"
import type { Provider, ResolvedProvider } from "../types/index"

/**
 * This shape matches both eligibility responses
 */
interface EligibilityResponse {
  status: "ELIGIBLE" | string
  serviceTypeId: string
  providers: Provider[]
}

describe("resolveProviders", () => {
  const createMockProvider = (id: string, name: string): Provider => ({
    id,
    name,
    npi: `npi-${id}`,
    externalId: `ext-${id}`,
    type: "INDIVIDUAL" as any,
    providerEligibilityEnabled: true,
    serviceEligibilityEnabled: true,
  })

  const createMockResponse = (
    status: "ELIGIBLE" | "INELIGIBLE",
    serviceTypeId: string,
    providers: Provider[],
  ): EligibilityResponse => ({
    status,
    serviceTypeId,
    providers,
  })

  describe("UNION strategy", () => {
    it("should combine providers from all eligible responses", () => {
      const provider1 = createMockProvider("provider-1", "Provider One")
      const provider2 = createMockProvider("provider-2", "Provider Two")
      const provider3 = createMockProvider("provider-3", "Provider Three")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider1, provider2]),
        createMockResponse("ELIGIBLE", "service-type-2", [provider2, provider3]),
      ]

      const result = resolveProviders(responses, "UNION")

      expect(result).toHaveLength(3)

      const provider1Result = result.find((p) => p.id === "provider-1")
      expect(provider1Result).toBeDefined()
      expect(provider1Result?.serviceTypeIds).toEqual(["service-type-1"])

      const provider2Result = result.find((p) => p.id === "provider-2")
      expect(provider2Result).toBeDefined()
      expect(provider2Result?.serviceTypeIds).toEqual(["service-type-1", "service-type-2"])

      const provider3Result = result.find((p) => p.id === "provider-3")
      expect(provider3Result).toBeDefined()
      expect(provider3Result?.serviceTypeIds).toEqual(["service-type-2"])
    })

    it("should skip ineligible responses", () => {
      const provider1 = createMockProvider("provider-1", "Provider One")
      const provider2 = createMockProvider("provider-2", "Provider Two")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider1]),
        createMockResponse("INELIGIBLE", "service-type-2", [provider2]),
      ]

      const result = resolveProviders(responses, "UNION")

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("provider-1")
      expect(result[0].serviceTypeIds).toEqual(["service-type-1"])
    })

    it("should handle empty responses array", () => {
      const result = resolveProviders([], "UNION")
      expect(result).toEqual([])
    })

    it("should handle responses with no eligible providers", () => {
      const responses: EligibilityResponse[] = [
        createMockResponse("INELIGIBLE", "service-type-1", []),
        createMockResponse("INELIGIBLE", "service-type-2", []),
      ]

      const result = resolveProviders(responses, "UNION")
      expect(result).toEqual([])
    })

    it("should handle duplicate providers across responses", () => {
      const provider1 = createMockProvider("provider-1", "Provider One")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider1]),
        createMockResponse("ELIGIBLE", "service-type-2", [provider1]),
        createMockResponse("ELIGIBLE", "service-type-3", [provider1]),
      ]

      const result = resolveProviders(responses, "UNION")

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("provider-1")
      expect(result[0].serviceTypeIds).toEqual([
        "service-type-1",
        "service-type-2",
        "service-type-3",
      ])
    })
  })

  describe("INTERSECTION strategy", () => {
    it("should include providers that appear in all eligible responses", () => {
      const provider1 = createMockProvider("provider-1", "Provider One")
      const provider2 = createMockProvider("provider-2", "Provider Two")
      const provider3 = createMockProvider("provider-3", "Provider Three")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider1, provider2]),
        createMockResponse("ELIGIBLE", "service-type-2", [provider2, provider3]),
      ]

      const result = resolveProviders(responses, "INTERSECTION")

      // Only provider2 appears in both responses, so only 1 provider should be returned
      expect(result).toHaveLength(1)

      const provider2Result = result.find((p) => p.id === "provider-2")
      expect(provider2Result).toBeDefined()
      expect(provider2Result?.serviceTypeIds).toEqual(["service-type-1", "service-type-2"])
    })

    it("should handle single response", () => {
      const provider1 = createMockProvider("provider-1", "Provider One")
      const provider2 = createMockProvider("provider-2", "Provider Two")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider1, provider2]),
      ]

      const result = resolveProviders(responses, "INTERSECTION")

      expect(result).toHaveLength(2)
      expect(result[0].serviceTypeIds).toEqual(["service-type-1"])
      expect(result[1].serviceTypeIds).toEqual(["service-type-1"])
    })

    it("should return empty array when any response is ineligible", () => {
      const provider1 = createMockProvider("provider-1", "Provider One")
      const provider2 = createMockProvider("provider-2", "Provider Two")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider1]),
        createMockResponse("INELIGIBLE", "service-type-2", [provider2]),
      ]

      const result = resolveProviders(responses, "INTERSECTION")

      // If any response is INELIGIBLE, no provider can appear in ALL responses
      expect(result).toHaveLength(0)
    })

    it("should return empty array when no providers appear in all responses", () => {
      const provider1 = createMockProvider("provider-1", "Provider One")
      const provider2 = createMockProvider("provider-2", "Provider Two")
      const provider3 = createMockProvider("provider-3", "Provider Three")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider1, provider2]),
        createMockResponse("ELIGIBLE", "service-type-2", [provider2, provider3]),
        createMockResponse("ELIGIBLE", "service-type-3", [provider1, provider3]),
      ]

      const result = resolveProviders(responses, "INTERSECTION")

      // No provider appears in all 3 responses, so result should be empty
      expect(result).toHaveLength(0)
    })

    it("should include ALL service type IDs for providers that appear in all responses", () => {
      const provider1 = createMockProvider("provider-1", "Provider One")
      const provider2 = createMockProvider("provider-2", "Provider Two")
      const provider3 = createMockProvider("provider-3", "Provider Three")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider1, provider2]),
        createMockResponse("ELIGIBLE", "service-type-2", [provider2, provider3]),
        createMockResponse("ELIGIBLE", "service-type-3", [provider1, provider2, provider3]),
      ]

      const result = resolveProviders(responses, "INTERSECTION")

      // Only provider2 appears in all 3 responses
      expect(result).toHaveLength(1)

      const provider2Result = result.find((p) => p.id === "provider-2")
      expect(provider2Result).toBeDefined()
      expect(provider2Result?.serviceTypeIds).toEqual([
        "service-type-1",
        "service-type-2",
        "service-type-3",
      ])
    })
  })

  describe("provider data integrity", () => {
    it("should preserve all provider properties", () => {
      const provider = createMockProvider("provider-1", "Provider One")

      const responses: EligibilityResponse[] = [
        createMockResponse("ELIGIBLE", "service-type-1", [provider]),
      ]

      const result = resolveProviders(responses, "UNION")

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        id: "provider-1",
        name: "Provider One",
        npi: "npi-provider-1",
        externalId: "ext-provider-1",
        type: "INDIVIDUAL",
        providerEligibilityEnabled: true,
        serviceEligibilityEnabled: true,
        serviceTypeIds: ["service-type-1"],
      })
    })
  })
})
