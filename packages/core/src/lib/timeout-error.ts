export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TimeoutError"
  }
}

/**
 * Creates a Promise that rejcts after a specified duration.
 * @param durationMs the duration in milliseconds to wait before rejecting
 * @throws TimeoutError when the limit's hit
 */
export const timeoutError = async (durationMs: number): Promise<never> =>
  new Promise((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Operation timed out after ${durationMs} ms`))
    }, durationMs)
  })
