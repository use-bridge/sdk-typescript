import { getBridgeClient } from "../lib/bridge-client.js"
import { printJson, printMessage } from "../lib/output.js"
import {
  promptMergeStrategy,
  promptPayerId,
  promptServiceTypeIds,
  promptState,
} from "../lib/prompts.js"

async function main() {
  printMessage("Bridge soft eligibility check\n")

  const serviceTypeIds = await promptServiceTypeIds()
  const mergeStrategy = await promptMergeStrategy()
  const payerId = await promptPayerId()
  const state = await promptState()

  printMessage("\nRunning soft eligibility check...\n")

  const bridge = getBridgeClient()
  const result = await bridge.softEligibility({
    serviceTypeIds,
    ...(mergeStrategy ? { mergeStrategy } : {}),
    payerId: payerId.trim(),
    state,
  })

  printJson(result)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`Error: ${message}\n`)
  process.exit(1)
})
