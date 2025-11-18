import dayjs from "dayjs"

/**
 * Determines whether a value is a valid datestamp, "YYYY-MM-DD"
 *
 * @param value the value to check, null or undefined is not valid
 * @param strict whether to reject
 * @returns true if the value is a valid datestamp, false otherwise
 */
export function isValidDatestamp(value: string | null): boolean {
  // If it's not defined, reject
  if (!value) return false
  // If it's not actually a string, reject
  if (typeof value !== "string") return false
  // Whether this is a expected format, "YYYY-MM-DD"
  const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(value)
  if (!isValidFormat) return false
  // Whether this is a valid real date (preventing bad dates like December 32nd)
  return dayjs(value).isValid()
}
