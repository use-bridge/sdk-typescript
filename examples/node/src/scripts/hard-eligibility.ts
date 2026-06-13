import { confirm, input } from "@inquirer/prompts"
import { getBridgeClient } from "../lib/bridge-client.js"
import { datestampToDateObject } from "../lib/date-object.js"
import { printJson, printMessage } from "../lib/output.js"
import {
  promptMergeStrategy,
  promptPatientFields,
  promptServiceTypeIds,
  promptState,
} from "../lib/prompts.js"

async function main() {
  printMessage("Bridge hard eligibility check\n")

  const serviceTypeIds = await promptServiceTypeIds()
  const mergeStrategy = await promptMergeStrategy()
  const useExistingPolicy = await confirm({
    message: "Use an existing policy ID?",
    default: false,
  })

  const bridge = getBridgeClient()

  if (useExistingPolicy) {
    const policyId = await input({
      message: "Policy ID (pol_...)",
      validate: (value) => (value.trim() ? true : "Policy ID is required"),
    })
    const state = await promptState()

    printMessage("\nRunning hard eligibility check (existing policy)...\n")

    const result = await bridge.hardEligibility({
      serviceTypeIds,
      ...(mergeStrategy ? { mergeStrategy } : {}),
      policyId: policyId.trim(),
      state,
    })

    printJson(result)
    return
  }

  const state = await promptState()
  const patient = await promptPatientFields()
  const optimisticSoftCheck = await confirm({
    message: "Enable optimistic soft check?",
    default: false,
  })

  printMessage("\nRunning hard eligibility check...\n")

  const result = await bridge.hardEligibility({
    serviceTypeIds,
    ...(mergeStrategy ? { mergeStrategy } : {}),
    ...(optimisticSoftCheck ? { optimisticSoftCheck: true } : {}),
    state,
    patient: {
      payerId: patient.payerId.trim(),
      firstName: patient.firstName.trim(),
      lastName: patient.lastName.trim(),
      dateOfBirth: datestampToDateObject(patient.dateOfBirth),
      ...(patient.memberId ? { memberId: patient.memberId.trim() } : {}),
    },
  })

  printJson(result)
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`Error: ${message}\n`)
  process.exit(1)
})
