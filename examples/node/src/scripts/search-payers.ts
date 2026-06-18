import { getBridgeClient } from "../lib/bridge-client.js"
import { printJson, printMessage } from "../lib/output.js"
import { promptPayerSearchQuery, promptSearchLimit } from "../lib/prompts.js"

async function main() {
  printMessage("Bridge payer search\n")

  const query = await promptPayerSearchQuery()
  const limit = await promptSearchLimit()

  printMessage("\nSearching...\n")

  const bridge = getBridgeClient()
  const result = await bridge.searchPayers({ query: query.trim(), limit })

  printJson(result)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`Error: ${message}\n`)
  process.exit(1)
})
