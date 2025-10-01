/**
 * Base Bridge SDK error type
 */
export abstract class BridgeSdkError extends Error {
  constructor(message: string) {
    super(message)
  }
}
