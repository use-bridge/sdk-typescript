export class RetryLoopCancelledError extends Error {
  constructor() {
    super("Retry loop cancelled")
    this.name = "RetryLoopCancelledError"
  }
}

/**
 * This utility function retries the given function forever
 * Useful for an API that must resolve (e.g. payer search)
 * @param fn the async function to retry
 * @param shouldRetry a function that returns true if the retry should continue, false to stop
 * @param delayMs the delay between retries, defaults to 500ms
 *
 * @returns the result of the function when it succeeds
 *
 * @throws {RetryLoopCancelledError} if the shouldRetry function returns false
 */
export async function retryLoop<T>(
  fn: () => Promise<T>,
  shouldRetry: () => boolean,
  delayMs = 500,
): Promise<T> {
  let cancelled = false
  while (!cancelled) {
    try {
      return await fn()
    } catch (_) {
      if (!shouldRetry()) {
        cancelled = true
      } else {
        await new Promise((r) => setTimeout(r, delayMs))
      }
    }
  }
  throw new RetryLoopCancelledError()
}
