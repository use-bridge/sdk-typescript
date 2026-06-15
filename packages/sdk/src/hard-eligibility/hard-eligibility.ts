import type {
  BridgeSdk,
  HardEligibilitySessionConfig,
  HardEligibilitySessionState,
  HardEligibilitySubmissionArgs,
} from "@usebridge/sdk-core"
import type { HardEligibilityArgs } from "../client/types.js"

function isExistingPolicyArgs(args: HardEligibilityArgs): args is HardEligibilitySessionConfig & {
  policyId: string
} & Pick<HardEligibilitySubmissionArgs, "state" | "clinicalInfo"> {
  return "policyId" in args && Boolean(args.policyId)
}

export async function runHardEligibility(
  sdk: Pick<BridgeSdk, "createHardEligibilitySession">,
  args: HardEligibilityArgs,
): Promise<HardEligibilitySessionState> {
  if (isExistingPolicyArgs(args)) {
    const { state, clinicalInfo, policyId, ...sessionConfig } = args
    const session = sdk.createHardEligibilitySession({ ...sessionConfig, policyId })
    return session.submit({ state, clinicalInfo })
  }

  const { state, patient, clinicalInfo, policyId, ...sessionConfig } = args
  const session = sdk.createHardEligibilitySession(sessionConfig)
  return session.submit({ state, patient, clinicalInfo })
}
