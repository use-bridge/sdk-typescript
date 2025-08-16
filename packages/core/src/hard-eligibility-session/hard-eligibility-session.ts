import { EventEmitter } from "eventemitter3"
import { v4 as uuidv4 } from "uuid"
import type {
  HardEligibilitySessionConfig,
  HardEligibilitySessionState,
  HardEligibilitySubmissionArgs,
} from "./types.js"
import type { BridgeSdkConfig } from "../types/index.js"
import { isEmpty } from "lodash-es"
import { ServiceTypeRequiredError } from "../errors/service-type-required-error.js"
import { AlreadySubmittingError } from "../errors/index.js"
import { BridgeApiClient } from "@usebridge/api"
import { dateObjectToDatestamp, dateToDateObject } from "../lib/date-object.js"

interface HardEligibilitySessionEvents {
  update: [HardEligibilitySessionState]
}

/**
 * Instance of a Hard Eligibility Session
 * Any time the 'state' is updated, an `update` event is emitted
 */
export class HardEligibilitySession extends EventEmitter<HardEligibilitySessionEvents> {
  readonly id: string
  #state: HardEligibilitySessionState

  constructor(
    private readonly apiClient: BridgeApiClient,
    private readonly config: BridgeSdkConfig,
    private readonly sessionConfig: HardEligibilitySessionConfig,
  ) {
    super()
    if (isEmpty(sessionConfig.serviceTypeIds)) throw new ServiceTypeRequiredError()
    this.id = uuidv4()
    this.#state = { status: "PENDING" }
    this.config.logger?.info("HardEligibilitySession created", { id: this.id, sessionConfig })
  }

  /**
   * Fetch the current state of the session
   */
  get state(): Readonly<HardEligibilitySessionState> {
    return this.#state
  }

  /**
   * Submits a new request for Hard Eligibility
   * @return the state when it reaches an actionable state
   * @throws {AlreadySubmittingError} if a request is already in-flight
   */
  async submit(args: HardEligibilitySubmissionArgs): Promise<HardEligibilitySessionState> {
    this.config.logger?.info("HardEligibilitySession.submit", { id: this.id, args })
    const { payerId, state, firstName, lastName, dateOfBirth, memberId } = args

    // One request at a time
    if (this.#state.status === "SUBMITTING_POLICY") throw new AlreadySubmittingError()
    if (this.#state.status === "SUBMITTING_SERVICE_ELIGIBILITY") throw new AlreadySubmittingError()

    // Move into Policy submission
    this.setState({ args, status: "SUBMITTING_POLICY" })

    try {
      // Create the Policy
      const { dateOfService } = this.sessionConfig
      let policy = await this.apiClient.policies.createPolicy({
        payerId,
        state,
        dateOfService: dateObjectToDatestamp(dateOfService ?? dateToDateObject()),
        memberId: args.memberId,
        person: { firstName, lastName, dateOfBirth: dateObjectToDatestamp(dateOfBirth) },
      })

      // Now it's created, we have to poll for it to be resolved
      this.setState({ args, status: "WAITING_FOR_POLICY", policy })
      // TODO Poll the Get Policy API, until for it to be resolved
      // TODO Start listening for the Policy updates with SSE
      // TODO Timeout after config.policyTimeoutMs (20s)

      // If the Policy is INVALID, we need to handle explaining that back to the user
      if (policy.status === "INVALID") {
        // TODO Parse the 'errors' from the Policy and normalize into something better
      }

      // Status is unknown (we're
      if (policy.status === "UNKNOWN") {
      }

      // TODO
      throw new Error("TODO")
    } catch (err) {
      // TODO Handle unexpected errors at each step
      throw err
    }
  }

  private setState(state: HardEligibilitySessionState): HardEligibilitySessionState {
    this.#state = state
    this.config?.logger?.debug?.("HardEligibilitySession state updated", { state })
    this.emit("update", state)
    return state
  }
}
