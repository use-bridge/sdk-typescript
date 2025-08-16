import type { DateObject } from "../types/index.js"
import dayjs from "dayjs"

/**
 * Converts a DateObject to a Date
 */
export function dateObjectToDate(dateObject: DateObject): Date {
  return dayjs(`${dateObject.year}-${dateObject.month}-${dateObject.day}`, "YYYY-MM-DD").toDate()
}

/**
 * Converts a Date to a DateObject
 * @param date the Date to convert, falsy to use `new Date()`
 */
export function dateToDateObject(date?: Date): DateObject {
  const dateToConvert = date ?? new Date()
  return {
    year: dateToConvert.getFullYear().toString(),
    month: (dateToConvert.getMonth() + 1).toString().padStart(2, "0"),
    day: dateToConvert.getDate().toString().padStart(2, "0"),
  }
}
