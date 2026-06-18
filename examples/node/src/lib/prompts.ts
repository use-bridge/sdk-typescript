import { confirm, input, number, search, select } from "@inquirer/prompts"
import { UsStateCodes, UsStateMap, type UsStateCode } from "@usebridge/sdk-core"
import { getDefaultServiceTypeIds } from "./env.js"

export async function promptServiceTypeIds(): Promise<string[]> {
  const defaults = getDefaultServiceTypeIds()
  const useDefaults = await confirm({
    message: `Use default service types (${defaults.join(", ")})?`,
    default: true,
  })

  if (useDefaults) return defaults

  const raw = await input({
    message: "Service type IDs (comma-separated)",
    validate: (value) => (value.trim() ? true : "At least one service type ID is required"),
  })

  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}

export async function promptState(message = "Patient state"): Promise<UsStateCode> {
  return search({
    message,
    source: async (term) => {
      const query = term?.toLowerCase() ?? ""
      return UsStateCodes.filter(
        (code) =>
          code.toLowerCase().includes(query) || UsStateMap[code].toLowerCase().includes(query),
      ).map((code) => ({ name: `${code} — ${UsStateMap[code]}`, value: code }))
    },
  })
}

export async function promptMergeStrategy(): Promise<"UNION" | "INTERSECTION" | undefined> {
  const customize = await confirm({
    message: "Customize merge strategy?",
    default: false,
  })

  if (!customize) return undefined

  return select({
    message: "Merge strategy",
    choices: [
      { name: "UNION — eligible if any service type is eligible", value: "UNION" as const },
      {
        name: "INTERSECTION — eligible only if all service types are eligible",
        value: "INTERSECTION" as const,
      },
    ],
    default: "UNION",
  })
}

export async function promptPayerSearchQuery(): Promise<string> {
  return input({
    message: "Payer search query",
    validate: (value) => (value.trim() ? true : "Query is required"),
  })
}

export async function promptSearchLimit(): Promise<number> {
  const limit = await number({
    message: "Maximum results",
    default: 10,
    min: 1,
    max: 50,
  })

  return limit ?? 10
}

export async function promptPayerId(): Promise<string> {
  return input({
    message: "Payer ID (pyr_...)",
    validate: (value) => (value.trim() ? true : "Payer ID is required"),
  })
}

export async function promptPatientFields(): Promise<{
  payerId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  memberId?: string
}> {
  const payerId = await promptPayerId()
  const firstName = await input({
    message: "First name",
    validate: (value) => (value.trim() ? true : "First name is required"),
  })
  const lastName = await input({
    message: "Last name",
    validate: (value) => (value.trim() ? true : "Last name is required"),
  })
  const dateOfBirth = await input({
    message: "Date of birth (YYYY-MM-DD)",
    validate: (value) =>
      /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ? true : "Use format YYYY-MM-DD",
  })

  const includeMemberId = await confirm({
    message: "Include member ID?",
    default: false,
  })

  const memberId = includeMemberId
    ? await input({
        message: "Member ID",
        validate: (value) => (value.trim() ? true : "Member ID is required when enabled"),
      })
    : undefined

  return { payerId, firstName, lastName, dateOfBirth, memberId }
}
