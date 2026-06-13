import { BridgeSdk, type BridgeSdkConfig } from "@usebridge/sdk-core"
import { runHardEligibility } from "../hard-eligibility/hard-eligibility.js"
import { runSoftEligibility } from "../soft-eligibility/soft-eligibility.js"
import type { BridgeClient } from "./types.js"

/**
 * Creates a BridgeClient for non-React environments.
 * Pass complete eligibility inputs and receive the final session state.
 */
export function createBridgeClient(config: BridgeSdkConfig): BridgeClient {
  const sdk = new BridgeSdk(config)

  return {
    searchPayers: (args) => sdk.payerSearch(args),
    softEligibility: (args) => runSoftEligibility(sdk, args),
    hardEligibility: (args) => runHardEligibility(sdk, args),
  }
}
