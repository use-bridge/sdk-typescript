import { BridgeSdkError } from "./bridge-sdk-error.js"

/**
 * Error thrown when a submission is already in progress
 */
export class AlreadySubmittingError extends BridgeSdkError {
  constructor() {
    super("Submission is already in progress, wait for it to complete before starting a new one.")
  }
}
