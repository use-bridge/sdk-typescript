import { getBridgeClient } from "../lib/bridge-client.js"
import { printJson, printMessage } from "../lib/output.js"

async function main() {
  const bridge = getBridgeClient()

  printMessage("=== searchPayers (aetna) ===")
  printJson(await bridge.searchPayers({ query: "aetna", limit: 5 }))
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`Error: ${message}\n`)
  process.exit(1)
})
