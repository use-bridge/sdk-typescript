export type LogLevel = "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent"

/**
 * Logging configuration
 */
export interface Logger {
  level?: LogLevel

  fatal(msg: string, meta?: object): void

  error(msg: string, meta?: object): void

  warn(msg: string, meta?: object): void

  info(msg: string, meta?: object): void

  debug?(msg: string, meta?: object): void

  trace?(msg: string, meta?: object): void
}
