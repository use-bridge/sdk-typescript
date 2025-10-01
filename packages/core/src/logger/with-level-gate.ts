import type { Logger, LogLevel } from "./types.js"

const order: LogLevel[] = ["trace", "debug", "info", "warn", "error", "fatal", "silent"]

/** Gate logs by level without imposing a specific logger */
function withLevelGate(l: Logger, min: LogLevel): Logger {
  const allowed = new Set(order.slice(order.indexOf(min)))
  const wrap = (name: keyof Logger) => {
    const fn = l[name] as any
    if (typeof fn !== "function") return undefined
    return allowed.has(name as LogLevel) ? fn.bind(l) : () => {}
  }
  return {
    level: min,
    fatal: wrap("fatal"),
    error: wrap("error"),
    warn: wrap("warn"),
    info: wrap("info"),
    debug: wrap("debug"),
    trace: wrap("trace"),
  }
}
