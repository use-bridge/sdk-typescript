import { describe, it, expect, jest } from "@jest/globals"
import type {
  HardEligibilitySession,
  HardEligibilitySessionState,
  HardEligibilitySubmissionArgs,
} from "@usebridge/sdk-core"
import type { HardEligibilityArgs } from "../client/types"
import { runHardEligibility } from "./hard-eligibility"

describe("runHardEligibility", () => {
  const patient = {
    payerId: "pyr_123",
    firstName: "Jane",
    lastName: "Doe",
    dateOfBirth: { year: "1990", month: "01", day: "15" },
    memberId: "M123",
  }

  it("splits session config from submit args for a new policy", async () => {
    const submitResult: HardEligibilitySessionState = {
      status: "ELIGIBLE",
      submitCount: 1,
    }

    const submit = jest.fn<HardEligibilitySession["submit"]>().mockResolvedValue(submitResult)
    const createHardEligibilitySession = jest
      .fn<(...args: unknown[]) => HardEligibilitySession>()
      .mockReturnValue({ submit } as unknown as HardEligibilitySession)

    const sdk = { createHardEligibilitySession }

    const result = await runHardEligibility(sdk, {
      serviceTypeIds: ["svt_abc"],
      mergeStrategy: "INTERSECTION",
      optimisticSoftCheck: true,
      state: "NY",
      patient,
      clinicalInfo: { diagnoses: ["F41.1"] },
    })

    expect(createHardEligibilitySession).toHaveBeenCalledWith({
      serviceTypeIds: ["svt_abc"],
      mergeStrategy: "INTERSECTION",
      optimisticSoftCheck: true,
    })
    expect(submit).toHaveBeenCalledWith({
      state: "NY",
      patient,
      clinicalInfo: { diagnoses: ["F41.1"] },
    })
    expect(result).toBe(submitResult)
  })

  it("omits a falsy policyId from session config for a new policy", async () => {
    const submitResult: HardEligibilitySessionState = {
      status: "ELIGIBLE",
      submitCount: 1,
    }

    const submit = jest.fn<HardEligibilitySession["submit"]>().mockResolvedValue(submitResult)
    const createHardEligibilitySession = jest
      .fn<(...args: unknown[]) => HardEligibilitySession>()
      .mockReturnValue({ submit } as unknown as HardEligibilitySession)

    const sdk = { createHardEligibilitySession }

    const result = await runHardEligibility(sdk, {
      serviceTypeIds: ["svt_abc"],
      policyId: undefined,
      state: "NY",
      patient,
      clinicalInfo: { diagnoses: ["F41.1"] },
    } as HardEligibilityArgs & { policyId?: undefined } & HardEligibilitySubmissionArgs)

    expect(createHardEligibilitySession).toHaveBeenCalledWith({
      serviceTypeIds: ["svt_abc"],
    })
    expect(submit).toHaveBeenCalledWith({
      state: "NY",
      patient,
      clinicalInfo: { diagnoses: ["F41.1"] },
    })
    expect(result).toBe(submitResult)
  })

  it("uses policyId in session config and omits patient from submit", async () => {
    const submitResult: HardEligibilitySessionState = {
      status: "ELIGIBLE",
      submitCount: 1,
    }

    const submit = jest.fn<HardEligibilitySession["submit"]>().mockResolvedValue(submitResult)
    const createHardEligibilitySession = jest
      .fn<(...args: unknown[]) => HardEligibilitySession>()
      .mockReturnValue({ submit } as unknown as HardEligibilitySession)

    const sdk = { createHardEligibilitySession }

    const result = await runHardEligibility(sdk, {
      serviceTypeIds: ["svt_abc"],
      policyId: "pol_existing",
      state: "CA",
      clinicalInfo: { diagnoses: ["F41.1"] },
    })

    expect(createHardEligibilitySession).toHaveBeenCalledWith({
      serviceTypeIds: ["svt_abc"],
      policyId: "pol_existing",
    })
    expect(submit).toHaveBeenCalledWith({
      state: "CA",
      clinicalInfo: { diagnoses: ["F41.1"] },
    })
    expect(result).toBe(submitResult)
  })
})
