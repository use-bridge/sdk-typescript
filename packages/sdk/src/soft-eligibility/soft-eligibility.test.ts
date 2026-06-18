import { describe, it, expect, jest } from "@jest/globals"
import type {
  HardEligibilitySession,
  SoftEligibilitySession,
  SoftEligibilitySessionState,
  HardEligibilitySessionState,
} from "@usebridge/sdk-core"
import { runSoftEligibility } from "./soft-eligibility"

describe("runSoftEligibility", () => {
  it("splits session config from submit args", async () => {
    const submitResult: SoftEligibilitySessionState = {
      status: "ELIGIBLE",
      providers: [],
    }

    const submit = jest.fn<SoftEligibilitySession["submit"]>().mockResolvedValue(submitResult)
    const createSoftEligibilitySession = jest
      .fn<(...args: unknown[]) => SoftEligibilitySession>()
      .mockReturnValue({ submit } as unknown as SoftEligibilitySession)

    const sdk = { createSoftEligibilitySession }

    const result = await runSoftEligibility(sdk, {
      serviceTypeIds: ["svt_abc"],
      mergeStrategy: "UNION",
      payerId: "pyr_123",
      state: "CA",
    })

    expect(createSoftEligibilitySession).toHaveBeenCalledWith({
      serviceTypeIds: ["svt_abc"],
      mergeStrategy: "UNION",
    })
    expect(submit).toHaveBeenCalledWith({
      payerId: "pyr_123",
      state: "CA",
    })
    expect(result).toBe(submitResult)
  })
})
