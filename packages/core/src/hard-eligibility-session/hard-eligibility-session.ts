import { EventEmitter } from "eventemitter3"
import { v4 as uuidv4 } from "uuid"
import type { HardEligibilitySessionConfig, HardEligibilitySessionState } from "./types.js"
import type { BridgeSdkConfig, DateObject, UsStateCode } from "../types/index.js"

interface HardEligibilitySessionEvents {
  update: [HardEligibilitySessionState]
}

/**
 * Instance of a Hard Eligibility Session
 * Any time the 'state' is updated, an `update` event is emitted
 */
export class HardEligibilitySession extends EventEmitter<HardEligibilitySessionEvents> {
  #state: HardEligibilitySessionState

  constructor(
    private readonly config: BridgeSdkConfig,
    private readonly sessionConfig: HardEligibilitySessionConfig,
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
  get state(): HardEligibilitySessionState {
    throw new Error("TODO")
  }

  /**
   * Submits a new request for Hard Eligibility
   * @param payerId the Bridge payer ID for the request (pyr_xxx)
   * @param state the patient's location at the time of the Service
   * @param firstName the Patient's first name
   * @param lastName the Patient's last name
   * @param dateOfBirth the Patient's Date of Birth
   * @param memberId the Patient's Member ID, optional (depending on the Payer)
   */
  submit(args: {
    payerId: string
    state: UsStateCode
    firstName: string
    lastName: string
    dateOfBirth: DateObject
    memberId?: string
  }): Promise<HardEligibilitySessionState> {
    throw new Error("TODO")
  }
}
