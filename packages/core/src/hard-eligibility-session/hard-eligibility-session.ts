import { EventEmitter } from "eventemitter3"
import { v4 as uuidv4 } from "uuid"
import type {
  HardEligibilitySessionConfig,
  HardEligibilitySessionState,
  HardEligibilitySubmissionArgs,
} from "./types.js"
import type { BridgeSdkConfig } from "../types/index.js"
import { fromPairs, isEmpty } from "lodash-es"
import { ServiceTypeRequiredError } from "../errors/service-type-required-error.js"
import { AlreadySubmittingError } from "../errors/index.js"
import { BridgeApi, BridgeApiClient } from "@usebridge/api"
import { dateObjectToDatestamp, dateToDateObject } from "../lib/date-object.js"
import { hardEligibilityErrorFromPolicy } from "./hard-eligibility-error-from-policy.js"
import { HardEligibilityErrors } from "./hard-eligibility-errors.js"

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
      let policy = await this.apiClient.policies.v2.createPolicy({
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
        this.config.logger?.info("HardEligibilitySession.submit.policyInvalid", { args, policy })
        return this.setState({
          args,
          status: "POLICY_ERROR",
          policy,
          error: hardEligibilityErrorFromPolicy(policy),
        })
      } else if (policy.status !== "CONFIRMED") {
        // Status is not confirmed (we're not expecting this, but it can happen)
        this.config.logger?.warn("HardEligibilitySession.submit.notConfirmed", { args, policy })
        return this.setState({
          args,
          status: "POLICY_NOT_FOUND",
          policy,
          error: HardEligibilityErrors.SERVER_ERROR,
        })
      }

      // Policy is confirmed, we can now submit the Service Eligibility
      this.config.logger?.info("HardEligibilitySession.submit.policyConfirmed", { args, policy })
      this.setState({ args, status: "SUBMITTING_SERVICE_ELIGIBILITY", policy })

      // We're submitting one for each of the ServiceType's we have
      const { serviceTypeIds } = this.sessionConfig
      const serviceEligibility =
        fromPairs<BridgeApi.serviceEligibility.ServiceEligibilityCreateV2Response>(
          await Promise.all(
            serviceTypeIds.map<
              Promise<[string, BridgeApi.serviceEligibility.ServiceEligibilityCreateV2Response]>
            >(async (serviceTypeId) => [
              serviceTypeId,
              await this.apiClient.serviceEligibility.v2.createServiceEligibility({
                serviceTypeId,
                policyIds: [policy.id],
                dateOfService: dateObjectToDatestamp(dateOfService ?? dateToDateObject()),
                state,
                // clinicalInfo, TODO Support for ClinicalInfo
              }),
            ]),
          ),
        )

      // TODO We need to resolve each of these, independently

      // TODO Submit the Service Eligibility
      // TODO Wait for resolution
      // TODO Handle a timeout

      // TODO Handle errors
      // TODO Handle ineligibility
      // TODO Handle eligibility

      throw new Error("TODO")
    } catch (err) {
      // TODO Handle unexpected errors at each step, maybe split into multiple try/catch blocks
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
