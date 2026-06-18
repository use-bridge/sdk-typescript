import type { DateObject } from "@usebridge/sdk-core"

const DATESTAMP_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function datestampToDateObject(value: string): DateObject {
  const match = DATESTAMP_PATTERN.exec(value.trim())
  if (!match) {
    throw new Error('Date of birth must be "YYYY-MM-DD"')
  }

  const [, year, month, day] = match
  return { year: year!, month: month!, day: day! }
}
