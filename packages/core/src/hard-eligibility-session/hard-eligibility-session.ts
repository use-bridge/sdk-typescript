import { EventEmitter } from "eventemitter3"
import { v4 as uuidv4 } from "uuid"
import type {
  HardEligibilityPatientResponsibility,
  HardEligibilitySessionConfig,
  HardEligibilitySessionState,
  HardEligibilitySubmissionArgs,
} from "./types.js"
import { filter, find, fromPairs, isEmpty, isNull, maxBy, minBy } from "lodash-es"
import { ServiceTypeRequiredError } from "../errors/service-type-required-error.js"
import { AlreadySubmittingError } from "../errors/index.js"
import { BridgeApiClient } from "@usebridge/api"
import { dateObjectToDatestamp, dateToDateObject } from "../lib/date-object.js"
import { errorFromPolicy } from "./lib/error-from-policy.js"
import { HardEligibilityErrors } from "./hard-eligibility-errors.js"
import { TimeoutError, timeoutError } from "../lib/timeout-error.js"
import { logger } from "../logger/sdk-logger.js"
import { resolveProviders } from "../lib/resolve-providers.js"
import type {
  Policy,
  ResolvedPolicy,
  ResolvedServiceEligibility,
  ServiceEligibility,
} from "../types/index.js"
import type { IneligibilityReason } from "./ineligibile-reasons.js"
import { ineligibilityReasonFromServiceEligibility } from "./lib/ineligibility-reason-from-service-eligibility.js"
import { HardEligibility } from "./hard-eligibility.js"

interface HardEligibilitySessionEvents {
  update: [HardEligibilitySessionState]
}

const DEFAULT_POLLING_INTERVAL_MS = 2_000 // 2 seconds
const DEFAULT_POLICY_TIMEOUT_MS = 20_000 // 20 seconds
const DEFAULT_ELIGIBILITY_TIMEOUT_MS = 20_000 // 20 seconds

/**
 * Instance of a Hard Eligibility Session
 * Any time the 'state' is updated, an `update` event is emitted
 */
export class HardEligibilitySession extends EventEmitter<HardEligibilitySessionEvents> {
  readonly id: string
  #state: HardEligibilitySessionState

  constructor(
    private readonly apiClient: BridgeApiClient,
    private readonly sessionConfig: HardEligibilitySessionConfig,
  ) {
    super()
    if (isEmpty(sessionConfig.serviceTypeIds)) throw new ServiceTypeRequiredError()
    this.id = uuidv4()
    this.#state = { status: "PENDING" }
    logger()?.info("HardEligibilitySession created", { sessionConfig })
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
    logger()?.info("HardEligibilitySession.submit", { args })

    // One request at a time
    if (!HardEligibility.canSubmit(this.#state.status)) throw new AlreadySubmittingError()

    // State is WAITING_FOR_POLICY, clear everything else
    this.setState({ args, status: "WAITING_FOR_POLICY" })

    // Create a Policy, then move into "WAITING_FOR_POLICY"
    let policy
    try {
      policy = await this.createPolicy(args)
      this.updateState({ policy })
    } catch (err) {
      logger()?.error("HardEligibilitySession.submit.createPolicy.error", { err })
      return this.updateState({ status: "SERVER_ERROR" })
    }

    // Wait for it to get resolved
    let resolvedPolicy
    try {
      resolvedPolicy = await this.resolvePolicy(policy)
      logger()?.info("HardEligibilitySession.submit.resolvePolicy", {
        resolvedPolicy,
        args,
        policy,
      })
    } catch (err) {
      logger()?.error("HardEligibilitySession.submit.resolvePolicy.error", { err })
      return this.updateState({ status: "SERVER_ERROR" })
    }

    // If the Policy resolved to null, it timed out
    if (!resolvedPolicy) {
      logger()?.info("HardEligibilitySession.submit.policyTimeout", { policy })
      return this.updateState({ status: "TIMEOUT", error: HardEligibilityErrors.TIMEOUT })
    }

    // Store the newly resolvedPolicy as the latest version
    this.updateState({ policy: resolvedPolicy })

    // If the Policy is INVALID, we need to handle explaining that back to the user
    if (resolvedPolicy.status === "INVALID") {
      logger()?.info("HardEligibilitySession.submit.policyInvalid", { resolvedPolicy })
      return this.updateState({ status: "POLICY_ERROR", error: errorFromPolicy(resolvedPolicy) })
    }

    // We're going to submit and resolve all the ServiceEligibility we need
    logger()?.info("HardEligibilitySession.submit.resolvingServiceEligibility")
    this.updateState({ status: "WAITING_FOR_SERVICE_ELIGIBILITY" })
    let resolvedEligibility
    try {
      resolvedEligibility = await this.createAndResolveEligibility({
        serviceTypeIds: this.sessionConfig.serviceTypeIds,
        policy: resolvedPolicy,
        args,
      })
      logger()?.info("HardEligibilitySession.submit.resolvedServiceTypes", { resolvedEligibility })
    } catch (err) {
      // If any of these threw an error, it's over
      logger()?.error("HardEligibilitySession.submit.createServiceEligibility.error", { err })
      return this.updateState({ status: "SERVER_ERROR" })
    }

    // If any of these are null, we had a timeout
    const hasNullServiceEligibility = resolvedEligibility.some(isNull)
    if (hasNullServiceEligibility) {
      logger()?.info("HardEligibilitySession.submit.serviceEligibilityTimeout")
      return this.updateState({ status: "TIMEOUT", error: HardEligibilityErrors.TIMEOUT })
    }

    // Push these ServiceEligibility into a map in the state, by ServiceType ID
    const nonNullEligibility = resolvedEligibility as ResolvedServiceEligibility[] // This is safe, we checked above
    this.updateState({
      serviceEligibility: fromPairs(
        nonNullEligibility.map<[string, ResolvedServiceEligibility]>((se) => [
          se.serviceTypeId,
          se,
        ]),
      ),
    })

    // Resolve the combined eligibility status
    const ineligibilityReason = this.ineligibilityReasonFromServiceEligibility(nonNullEligibility)
    if (ineligibilityReason) {
      logger()?.info("HardEligibilitySession.submit.ineligible")
      return this.updateState({ status: "INELIGIBLE", ineligibilityReason })
    }

    // Resolve the Providers
    const providers = resolveProviders(nonNullEligibility)

    // If there are no Providers, we're INELIGIBLE even if the plan covers it
    if (isEmpty(providers)) {
      logger()?.info("HardEligibilitySession.submit.noEligibleProviders")
      return this.updateState({
        status: "INELIGIBLE",
        ineligibilityReason: { code: "PROVIDERS", message: "TODO MESSAGE -> NO PROVIDERS" },
      })
    }

    // We're eligible, parse out the estimate and send this back
    let patientResponsibility = this.getPatientResponsibility(nonNullEligibility)
    // This is unexpected, should be guaranteed PatientResponsibility if we have something ELIGIBLE
    if (!patientResponsibility) {
      logger()?.error("HardEligibilitySession.submit.noPatientResponsibility")
      throw new Error("No patientResponsibility found in ServiceEligibility")
    }

    logger()?.info("HardEligibilitySession.submit.eligible", { providers, patientResponsibility })
    return this.updateState({
      status: "ELIGIBLE",
      providers,
      patientResponsibility,
    })
  }

  /**
   * Replaces the state value, emits an update event
   */
  private setState(state: HardEligibilitySessionState): HardEligibilitySessionState {
    this.#state = state
    logger()?.debug?.("HardEligibilitySession state updated", { state })
    this.emit("update", state)
    return state
  }

  /**
   * Applies a partial update to the current state, emits an update event
   */
  private updateState(updates: Partial<HardEligibilitySessionState>): HardEligibilitySessionState {
    return this.setState({ ...this.#state, ...updates })
  }

  /**
   * Creates a new Policy, returns it
   * This is a fast endpoint, asynchronously kicking off resolution
   */
  private async createPolicy(args: HardEligibilitySubmissionArgs): Promise<Policy> {
    const { payerId, state, firstName, lastName, dateOfBirth, memberId } = args
    logger()?.info("HardEligibilitySession.resolvePolicy", { args })
    return this.apiClient.policies.v2.createPolicy({
      payerId,
      state,
      dateOfService: this.dateOfService(),
      memberId,
      person: { firstName, lastName, dateOfBirth: dateObjectToDatestamp(dateOfBirth) },
    })
  }

  /**
   * Creates a new Policy, waits until it's been resolved (up until the timeout)
   * @return the Policy if it was resolved, or null if it failed
   */
  private async resolvePolicy(policy: Policy): Promise<ResolvedPolicy | null> {
    logger()?.info("HardEligibilitySession.resolvePolicy", { policy })

    // Work should stop when this flips
    let waiting = true

    // This polls for an update
    // TODO We can pull out a `poll` function here, use setInterval
    const pollForPolicy = async (): Promise<ResolvedPolicy> => {
      logger()?.info("pollForPolicy")
      while (waiting) {
        try {
          const latestPolicy = await this.apiClient.policies.getPolicy(policy.id)
          // If it's in a terminal state, use it
          const { status } = latestPolicy
          if (status === "CONFIRMED" || status === "INVALID") {
            logger()?.info("pollForPolicy.resolved", { latestPolicy })
            return latestPolicy as ResolvedPolicy
          }
          // Otherwise, wait for the next poll
          logger()?.info("pollForPolicy.notReady", { latestPolicy })
        } catch (err) {
          // If we had an error in here, we can log it, but keep polling
          logger()?.error("pollForPolicy.error", { err })
        }
        const durationMs = this.sessionConfig.pollingIntervalMs ?? DEFAULT_POLLING_INTERVAL_MS
        await new Promise((resolve) => setTimeout(resolve, durationMs))
      }
      throw new Error("Polling for policy was cancelled")
    }

    // This opens an SSE request to listen for updates
    async function listenForPolicyUpdates(): Promise<ResolvedPolicy> {
      // TODO Listen for Policy updates with SSE
      while (waiting) {
        // TODO Placeholder, doing nothing yet
        await new Promise((resolve) => setTimeout(resolve, 1_000))
      }
      throw new Error("Listening for policy updates was cancelled")
    }

    // Expect a Policy in a terminal state, take the first one that comes back
    try {
      const resolvedPolicy = await Promise.race([
        pollForPolicy(),
        listenForPolicyUpdates(),
        timeoutError(this.sessionConfig.policyTimeoutMs ?? DEFAULT_POLICY_TIMEOUT_MS),
      ])
      waiting = false // Flip this, so the other loops cancel
      return resolvedPolicy
    } catch (err) {
      // If this is a TimeoutError, we can handle it specifically
      if (err instanceof TimeoutError) {
        // Set to the timeout state, and return null
        this.updateState({ status: "TIMEOUT", error: HardEligibilityErrors.TIMEOUT })
        return null
      }
      // Anything else is unexpected
      logger()?.error("HardEligibilitySession.resolvePolicy.err", { err })
      throw err
    }
  }

  /**
   * Concurrently creates and resolves a ServiceEligibility for each ServiceType
   */
  private async createAndResolveEligibility({
    serviceTypeIds,
    policy,
    args,
  }: {
    serviceTypeIds: string[]
    policy: Policy
    args: HardEligibilitySubmissionArgs
  }) {
    return Promise.all(
      serviceTypeIds.map(async (serviceTypeId) => {
        // Create the ServiceEligibility for this ServiceType
        const serviceEligibility = await this.createServiceEligibility({
          serviceTypeId,
          policy,
          args,
        })
        logger()?.info("HardEligibilitySession.submit.createServiceEligibility", {
          serviceEligibility,
        })
        // Wait for it to resolve, then pass it back
        const resolvedServiceEligibility = await this.resolveServiceEligibility(serviceEligibility)
        logger()?.info("HardEligibilitySession.submit.resolveServiceEligibility", {
          serviceEligibility,
          resolvedServiceEligibility,
        })
        return resolvedServiceEligibility
      }),
    )
  }

  /**
   * Creates the ServiceEligibility for a given type
   * API resolves instantly, and we wait for it to settle
   */
  private async createServiceEligibility({
    serviceTypeId,
    policy,
    args,
  }: {
    serviceTypeId: string
    policy: Policy
    args: HardEligibilitySubmissionArgs
  }) {
    logger()?.info("HardEligibilitySession.createServiceEligibility", { serviceTypeId, args })
    // Create the ServiceEligibility, V2 is a quick endpoint that fires off async work
    return this.apiClient.serviceEligibility.v2.createServiceEligibility({
      serviceTypeId,
      policyIds: [policy.id],
      dateOfService: this.dateOfService(),
      state: args.state,
      // clinicalInfo, TODO Support for ClinicalInfo
    })
  }

  /**
   * Waits for a ServiceEligibility to resolve, returning the final state, null if it timed out
   */
  private async resolveServiceEligibility(
    serviceEligibility: ServiceEligibility,
  ): Promise<ResolvedServiceEligibility | null> {
    logger()?.info("HardEligibilitySession.resolveServiceEligibility", { serviceEligibility })
    // Now we're going to wait until it's resolved
    let waiting = true

    // This polls for updates
    // TODO Share with `poll` in Policy
    const pollForServiceEligibility = async (): Promise<ResolvedServiceEligibility> => {
      logger()?.info("pollForServiceEligibility")
      while (waiting) {
        try {
          const latestServiceEligibility =
            await this.apiClient.serviceEligibility.getServiceEligibility(serviceEligibility.id)
          // If it's in a terminal state, use it
          const { status } = latestServiceEligibility
          if (status === "ELIGIBLE" || status === "INELIGIBLE") {
            logger()?.info("pollForServiceEligibility.resolved", { latestServiceEligibility })
            return latestServiceEligibility as ResolvedServiceEligibility
          }
          // Otherwise, wait for the next poll
          logger()?.info("pollForServiceEligibility.notReady", { latestServiceEligibility })
        } catch (err) {
          // If we had an error in here, we can log it, but keep polling
          logger()?.error("pollForServiceEligibility.error", { err, serviceEligibility })
        }
        const durationMs = this.sessionConfig.pollingIntervalMs ?? DEFAULT_POLLING_INTERVAL_MS
        await new Promise((resolve) => setTimeout(resolve, durationMs))
      }
      throw new Error("Polling for service eligibility was cancelled")
    }

    // This opens an SSE request to listen for updates
    // TODO Also pull out and share with Policy
    async function listenForServiceEligibilityUpdates(): Promise<ResolvedServiceEligibility> {
      // TODO Listen for Service Eligibility updates with SSE
      while (waiting) {
        // TODO Placeholder, doing nothing yet
        await new Promise((resolve) => setTimeout(resolve, 1_000))
      }
      throw new Error("Listening for service eligibility updates was cancelled")
    }

    // Expect a ServiceEligibility in a terminal state, take the first one that comes back
    try {
      const resolvedServiceEligibility = await Promise.race([
        pollForServiceEligibility(),
        listenForServiceEligibilityUpdates(),
        timeoutError(this.sessionConfig.eligibilityTimeoutMs ?? DEFAULT_ELIGIBILITY_TIMEOUT_MS),
      ])
      waiting = false // Flip this, so the other loops cancel
      return resolvedServiceEligibility
    } catch (err) {
      // If this is a TimeoutError, we can handle it specifically
      if (err instanceof TimeoutError) {
        // Set to the timeout state, and return null
        this.updateState({ status: "TIMEOUT", error: HardEligibilityErrors.TIMEOUT })
        return null
      }
      // Anything else is unexpected
      logger()?.error("HardEligibilitySession.resolveServiceEligibility.err", {
        err,
        serviceEligibility,
      })
      throw err
    }
  }

  /**
   * Given the EstimateStrategy, figures out what the estimate should be
   * Every ServiceEligibility in here should be resolved, with a 'patientResponsibility' present
   */
  private getPatientResponsibility(
    serviceEligibility: ResolvedServiceEligibility[],
  ): HardEligibilityPatientResponsibility | null {
    // If it's empty, we can't do anything
    if (isEmpty(serviceEligibility)) throw new Error("No ServiceEligibility in getEstimate")

    // Filter to only the ELIGIBLE ServiceEligibility
    const eligibleServiceEligibility = filter(serviceEligibility, { status: "ELIGIBLE" })

    // Sanity check that these all have a ServiceEligibility
    if (eligibleServiceEligibility.some((se) => !se.patientResponsibility))
      throw new Error(`Unexpected ServiceEligibility ELIGIBLE without patientResponsibility`)

    // Finds the ServiceEligibility that's relevant for us to grab the estimate
    const findEstimateServiceEligibility = () => {
      const { estimateSelection } = this.sessionConfig
      switch (estimateSelection?.mode ?? "HIGHEST") {
        // Return the highest dollar value
        case "HIGHEST":
          return maxBy(eligibleServiceEligibility, (s) => s.patientResponsibility!.total)
        // Return the lowest dollar value
        case "LOWEST":
          return minBy(eligibleServiceEligibility, (s) => s.patientResponsibility!.total)
        // Return the value from a specific ServiceType
        case "SERVICE_TYPE":
          // Fetch a specific ServiceType by ID. If that fails, fallback to default (HIGHEST)
          const id = estimateSelection?.serviceTypeId
          const matchingServiceEligibility = find(eligibleServiceEligibility, { id })
          if (matchingServiceEligibility) return matchingServiceEligibility
          logger()?.warn("HardEligibilitySession.getPatientResponsibility.serviceTypeNotFound", {
            id,
          })
          return maxBy(eligibleServiceEligibility, (s) => s.patientResponsibility!.total)
      }
    }

    // Grab the ServiceEligibility we want to use, transform into our result
    const estimateServiceEligibility = findEstimateServiceEligibility()
    if (!estimateServiceEligibility) return null

    // Transform into what we need, we can be sure we have a patientResponsibility here, conditional is a maybe
    return {
      estimate: estimateServiceEligibility.patientResponsibility!,
      conditionalEstimate: estimateServiceEligibility.conditionalPatientResponsibilities?.at(0),
    }
  }

  /**
   * Resolves the date of service to a datestamp
   * If there isn't one in the sessionConfig, resolves to today
   */
  private dateOfService(): string {
    return dateObjectToDatestamp(this.sessionConfig.dateOfService ?? dateToDateObject())
  }

  /**
   * Given the merge strategy, and the list of ServiceEligibility, figure out the ineligibility reason
   * @return the primary ineligibility reason, or null if eligible
   */
  private ineligibilityReasonFromServiceEligibility(
    serviceEligibility: ResolvedServiceEligibility[],
  ): IneligibilityReason | null {
    const { mergeStrategy } = this.sessionConfig
    // Combine the response eligibility status, based on strategy
    if (mergeStrategy === "UNION") {
      // If all the ServiceEligibility are INELIGIBLE, we're INELIGIBLE
      if (serviceEligibility.every((se) => se.status === "INELIGIBLE")) {
        logger()?.info("HardEligibilitySession.submit.noEligibleServiceTypes")
        return ineligibilityReasonFromServiceEligibility(serviceEligibility)
      }
    } else if (mergeStrategy === "INTERSECTION") {
      // If any of the ServiceEligibility are INELIGIBLE, we're INELIGIBLE
      if (serviceEligibility.some(({ status }) => status === "INELIGIBLE")) {
        logger()?.info("HardEligibilitySession.submit.ineligibleServiceTypes")
        return ineligibilityReasonFromServiceEligibility(serviceEligibility)
      }
    } else {
      throw new Error(`The mergeStrategy ${mergeStrategy} is not supported`)
    }
    // If these didn't hit, return null (eligible)
    return null
  }
}
