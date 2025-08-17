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
import { TimeoutError, timeoutError } from "../lib/timeout-error.js"
import { logger } from "../logger/sdk-logger.js"

interface HardEligibilitySessionEvents {
  update: [HardEligibilitySessionState]
}

const DEFAULT_POLLING_INTERVAL_MS = 2_000 // 2 seconds
const DEFAULT_POLICY_TIMEOUT_MS = 20_000 // 20 seconds
const DEFAULT_SERVICE_ELIGIBILITY_TIMEOUT_MS = 20_000 // 20 seconds

// Policy type that's reached a terminal state
type ResolvedPolicy = BridgeApi.policies.PolicyGetV1Response & { status: "CONFIRMED" | "INVALID" }

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
    logger()?.info("HardEligibilitySession created", { id: this.id, sessionConfig })
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
    logger()?.info("HardEligibilitySession.submit", { id: this.id, args })
    const { state } = args

    // One request at a time
    if (!this.canSubmit()) throw new AlreadySubmittingError()

    // Move into Policy submission
    this.setState({ args, status: "SUBMITTING_POLICY" })

    try {
      // Create the Policy
      const { dateOfService } = this.sessionConfig

      // Create a Policy and wait for it to be resolved
      const policy = await this.createAndResolvePolicy(args)
      // If we don't have one, something went wrong, and we can exit here
      if (!policy) return this.#state

      // If the Policy is INVALID, we need to handle explaining that back to the user
      if (policy.status === "INVALID") {
        logger()?.info("HardEligibilitySession.submit.policyInvalid", { args, policy })
        return this.setState({
          args,
          status: "POLICY_ERROR",
          policy,
          error: hardEligibilityErrorFromPolicy(policy),
        })
      }

      // Policy is confirmed, we can now submit the Service Eligibility
      logger()?.info("HardEligibilitySession.submit.policyConfirmed", { args, policy })

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
    logger()?.debug?.("HardEligibilitySession state updated", { state })
    this.emit("update", state)
    return state
  }

  /**
   * Determines whether we're in a state can submit
   */
  private canSubmit(): boolean {
    if (this.#state.status === "SUBMITTING_POLICY") return false
    if (this.#state.status === "SUBMITTING_SERVICE_ELIGIBILITY") return false
    if (this.#state.status === "WAITING_FOR_POLICY") return false
    if (this.#state.status === "WAITING_FOR_SERVICE_ELIGIBILITY") return false
    return true
  }

  /**
   * Creates a new Policy, waits until it's been resolved (up until the timeout)
   * @return the Policy if it was resolved, or null if it timed out
   */
  private async createAndResolvePolicy(
    args: HardEligibilitySubmissionArgs,
  ): Promise<ResolvedPolicy | null> {
    const { payerId, state, firstName, lastName, dateOfBirth, memberId } = args
    const { dateOfService } = this.sessionConfig
    logger()?.info("HardEligibilitySession.createAndResolvePolicy", { id: this.id })

    // State is SUBMITTING_POLICY
    this.setState({ args, status: "SUBMITTING_POLICY" })

    let policy
    try {
      // Call the Create API, the V2 endpoint resolves immediately and resolves async
      policy = await this.apiClient.policies.v2.createPolicy({
        payerId,
        state,
        dateOfService: dateObjectToDatestamp(dateOfService ?? dateToDateObject()),
        memberId,
        person: { firstName, lastName, dateOfBirth: dateObjectToDatestamp(dateOfBirth) },
      })
    } catch (err) {
      logger()?.error("HardEligibilitySession.createAndResolvePolicy.error", { err, args })
      this.setState({ args, status: "POLICY_SUBMISSION_ERROR" })
      throw err
    }

    // Now it's created, we have to poll for it to be resolved
    this.setState({ args, status: "WAITING_FOR_POLICY", policy })

    // Race for any of these
    let waiting = true

    // This polls for an update every 2 seconds
    const pollForPolicy = async (): Promise<ResolvedPolicy> => {
      logger()?.info("pollForPolicy")
      while (waiting) {
        const latestPolicy = await this.apiClient.policies.getPolicy(policy.id)
        const { status } = latestPolicy
        // If it's in a terminal state, use it
        if (status === "CONFIRMED" || status === "INVALID") {
          logger()?.info("pollForPolicy.resolved", { latestPolicy })
          return latestPolicy as ResolvedPolicy
        }
        // Otherwise, wait for the next poll
        logger()?.info("pollForPolicy.notReady", { latestPolicy })
        const durationMs = this.sessionConfig.pollingIntervalMs ?? DEFAULT_POLLING_INTERVAL_MS
        await new Promise((resolve) => setTimeout(resolve, durationMs))
      }
      throw new Error("Polling for policy was cancelled")
    }

    // This opens a SSE request to listen for updates
    async function listenForPolicyUpdates(): Promise<ResolvedPolicy> {
      // TODO Listen for Policy updates with SSE
      while (waiting) {
        // TODO Placeholder, doing nothing yet
        await new Promise((resolve) => setTimeout(resolve, 1_000))
      }
      throw new Error("Listening for policy updates was cancelled")
    }

    // Expect a Policy in a terminal state, take the first one that comes back
    let resolvedPolicy: ResolvedPolicy
    try {
      resolvedPolicy = await Promise.race([
        pollForPolicy(),
        listenForPolicyUpdates(),
        timeoutError(this.sessionConfig.policyTimeoutMs ?? 20_000),
      ])
      waiting = false // Flip this, so the other loops cancel
    } catch (err) {
      // If this is a TimeoutError, we can handle it specifically
      if (err instanceof TimeoutError) {
        // Set to the timeout state, and return null
        this.setState({
          args,
          status: "POLICY_TIMEOUT",
          policy,
          error: HardEligibilityErrors.TIMEOUT,
        })
        return null
      }
      // Anything else is unexpected
      logger()?.error("HardEligibilitySession.createAndResolvePolicy.err", { err, args })
      throw err
    }

    // If we resolved a Policy, hand it back
    return resolvedPolicy
  }
}
