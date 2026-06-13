import type { BridgeSdk, SoftEligibilitySessionState } from "@usebridge/sdk-core"
import type { SoftEligibilityArgs } from "../client/types.js"

export async function runSoftEligibility(
  sdk: Pick<BridgeSdk, "createSoftEligibilitySession">,
  args: SoftEligibilityArgs,
): Promise<SoftEligibilitySessionState> {
  const { payerId, state, ...sessionConfig } = args
  const session = sdk.createSoftEligibilitySession(sessionConfig)
  return session.submit({ payerId, state })
}
