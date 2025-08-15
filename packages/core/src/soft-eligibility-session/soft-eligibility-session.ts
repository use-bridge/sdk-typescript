import { EventEmitter } from "eventemitter3"
import { v4 as uuidv4 } from "uuid"
import type { SoftEligibilitySessionConfig, SoftEligibilitySessionState } from "./types.js"
import type { BridgeSdkConfig, DateObject, UsStateCode } from "../types/index.js"

interface SoftEligibilitySessionEvents {
  update: [SoftEligibilitySessionState]
}

/**
 * Instance of a Soft Eligibility Session
 * Any time the 'state' is updated, an `update` event is emitted
 */
export class SoftEligibilitySession extends EventEmitter<SoftEligibilitySessionEvents> {
  #state: SoftEligibilitySessionState

  constructor(
    private readonly config: BridgeSdkConfig,
    private readonly sessionConfig: SoftEligibilitySessionConfig,
  ) {
    super()
    this.#state = {
      id: uuidv4(),
      status: "PENDING",
    }
  }

  /**
   * Fetch the current state of the session
   */
  get state(): SoftEligibilitySessionState {
    throw new Error("TODO")
  }

  /**
   * Submits a new request for Soft Eligibility
   * @param payerId the Bridge Payer ID for the request (pyr_xxx)
   * @param state the patient's location at the time of the Service
   * @param dateOfService the expected Date of Service for the request, defaults to today
   *
   * @return a Promise that resolves to a terminal SoftEligibilitySessionState
   *
   * @throws {AlreadySubmittingError} if a request is already in-flight
   */
  submit(args: {
    payerId: string
    state: UsStateCode
    dateOfService: DateObject
  }): Promise<SoftEligibilitySessionState> {
    throw new Error("TODO")
  }
}
