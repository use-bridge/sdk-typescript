import type { Logger } from "./types.js"

let _sdkLogger: Logger | undefined

/**
 * Sets the global SDK logger singleton
 */
export function setLogger(logger: Logger | undefined): void {
  _sdkLogger = logger
}

/**
 * Access to the Logger singleton
 */
export function logger(): Logger | undefined {
  return _sdkLogger
}
