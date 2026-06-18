import type {
  HardEligibilitySessionConfig,
  HardEligibilitySessionState,
  HardEligibilitySubmissionArgs,
  PayerSearchResults,
  SoftEligibilitySessionConfig,
  SoftEligibilitySessionState,
  SoftEligibilitySubmissionArgs,
} from "@usebridge/sdk-core"

export type SoftEligibilityArgs = SoftEligibilitySessionConfig & SoftEligibilitySubmissionArgs

export type HardEligibilityArgs =
  | (HardEligibilitySessionConfig & HardEligibilitySubmissionArgs)
  | (HardEligibilitySessionConfig & {
      policyId: string
    } & Pick<HardEligibilitySubmissionArgs, "state" | "clinicalInfo">)

export interface BridgeClient {
  searchPayers(args: { query: string; limit?: number }): Promise<PayerSearchResults>

  softEligibility(args: SoftEligibilityArgs): Promise<SoftEligibilitySessionState>

  hardEligibility(args: HardEligibilityArgs): Promise<HardEligibilitySessionState>
}
