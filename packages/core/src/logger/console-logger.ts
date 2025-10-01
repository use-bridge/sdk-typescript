import type { Logger } from "./types.js"

const noop = () => {}

/**
 * A simple Logger implementation, that logs directly to the conosle
 */
export const consoleLogger: Logger = {
  level: "info",
  fatal: (m, meta) => {
    console.error(m, meta ?? "")
    process.exit(1)
  },
  error: (m, meta) => console.error(m, meta ?? ""),
  warn: (m, meta) => console.warn(m, meta ?? ""),
  info: (m, meta) => console.info(m, meta ?? ""),
  debug: (m, meta) => console.debug?.(m, meta ?? "") ?? noop(),
  trace: noop,
}
