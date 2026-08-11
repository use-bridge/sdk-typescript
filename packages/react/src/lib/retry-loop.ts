export class RetryLoopCancelledError extends Error {
  constructor() {
    super("Retry loop cancelled")
    this.name = "RetryLoopCancelledError"
  }
}

/**
 * Decision for how the retry loop should handle a failure
 * - retry: wait and try again
 * - cancel: stop without surfacing the error (stale / unmounted)
 * - fail: stop and rethrow the original error (irrecoverable)
 */
export type RetryDecision = "retry" | "cancel" | "fail"

/**
 * This utility function retries the given function until it succeeds,
 * is cancelled, or hits an irrecoverable error
 * Useful for an API that must resolve (e.g. payer search)
 * @param fn the async function to retry
 * @param getRetryDecision called with the caught error; returns how to proceed
 * @param delayMs the delay between retries, defaults to 500ms
 *
 * @returns the result of the function when it succeeds
 *
 * @throws {RetryLoopCancelledError} if getRetryDecision returns "cancel"
 * @throws the original error if getRetryDecision returns "fail"
 */
export async function retryLoop<T>(
  fn: () => Promise<T>,
  getRetryDecision: (err: unknown) => RetryDecision,
  delayMs = 500,
): Promise<T> {
  let decision: RetryDecision = "retry"
  let lastError: unknown

  while (decision === "retry") {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      decision = getRetryDecision(err)
      if (decision === "retry") {
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }

  if (decision === "cancel") throw new RetryLoopCancelledError()
  throw lastError
}
