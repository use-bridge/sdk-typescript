import { EventEmitter } from "eventemitter3"
import { v4 as uuidv4 } from "uuid"
import type {
  HardEligibilityPatientInput,
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
import { TimeoutError, timeoutError } from "../lib/timeout-error.js"
import { logger } from "../logger/sdk-logger.js"
import { resolveProviders } from "../lib/resolve-providers.js"
import type {
  Policy,
  ResolvedPolicy,
  ResolvedServiceEligibility,
  ServiceEligibility,
  UsStateCode,
} from "../types/index.js"
import type { IneligibilityReason } from "./ineligibile-reasons.js"
import { ineligibilityReasonFromServiceEligibility } from "./lib/ineligibility-reason-from-service-eligibility.js"
import { HardEligibility } from "./hard-eligibility.js"
import { EligibilityTimeout } from "./lib/eligibility-timeout.js"
import { Strings } from "../lib/strings.js"
import { analytics } from "../analytics/index.js"

interface HardEligibilitySessionEvents {
  update: [HardEligibilitySessionState]
}

const DEFAULT_POLLING_INTERVAL_MS = 1_000 // 1 second
const DEFAULT_POLICY_TIMEOUT_MS = 20_000 // 20 seconds
const DEFAULT_ELIGIBILITY_TIMEOUT_MS = 20_000 // 20 seconds

/**
 * Checks if a Policy is in a resolved state (CONFIRMED or INVALID)
 */
function isPolicyResolved(policy: Pick<Policy, "status">): boolean {
  return policy.status === "CONFIRMED" || policy.status === "INVALID"
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
    private readonly sessionConfig: HardEligibilitySessionConfig,
  ) {
    super()
    if (isEmpty(sessionConfig.serviceTypeIds)) throw new ServiceTypeRequiredError()
    this.id = uuidv4()
    this.#state = { status: "PENDING", submitCount: 0 }
    logger()?.info("HardEligibilitySession created", { sessionConfig })
    analytics().event("hard_eligibility.session.created", {
      sessionId: this.id,
      config: sessionConfig,
    })
  }

  /**
   * Fetch the current state of the session
   */
  get state(): Readonly<HardEligibilitySessionState> {
    return this.#state
  }

  /**
   * Whether this session was created with an existing Policy ID
   * When true, patient input fields are not required for submission
   */
  get usesExistingPolicy(): boolean {
    return "policyId" in this.sessionConfig
  }

  /**
   * Submits a new request for Hard Eligibility
   * @return the state when it reaches an actionable state
   * @throws {AlreadySubmittingError} if a request is already in-flight
   */
  async submit(args: HardEligibilitySubmissionArgs): Promise<HardEligibilitySessionState> {
    logger()?.info("HardEligibilitySession.submit", { args })
    analytics().event("hard_eligibility.session.submit", { sessionId: this.id, args })
    const submitAt = performance.now()

    // One request at a time
    if (!HardEligibility.canSubmit(this.#state.status)) {
      analytics().fatal(new AlreadySubmittingError())
    }

    // We're going to force the state back to no error, and track the submission
    const resetState = {
      args,
      error: null,
      submitCount: this.#state.submitCount + 1,
      firstSubmitAt: this.#state.firstSubmitAt ?? submitAt,
    } as const

    let policyId: string
    if (this.usesExistingPolicy) {
      policyId = (this.sessionConfig as Extract<HardEligibilitySessionConfig, { policyId: string }>)
        .policyId
      logger()?.info("HardEligibilitySession.submit.usingExistingPolicyId", { policyId })
      this.updateState({ ...resetState, status: "WAITING_FOR_SERVICE_ELIGIBILITY" })
    } else {
      this.updateState({ ...resetState, status: "WAITING_FOR_POLICY" })
      if (!args.patient) {
        throw new Error(
          "Patient information is required when session config does not include a policyId",
        )
      }

      let policy
      try {
        policy = await this.createPolicy(args.patient, args.state)
        this.updateState({ policy })
      } catch (err) {
        logger()?.error("HardEligibilitySession.submit.createPolicy.error", { err })
        return this.updateState({ status: "SERVER_ERROR" })
      }

      // Wait for it to get resolved
      let resolvedPolicy: ResolvedPolicy | null
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
        logger()?.info("HardEligibilitySession.submit.policyTimeout")
        return this.updateState({ status: "TIMEOUT", error: EligibilityTimeout })
      }

      // Store the newly resolvedPolicy as the latest version
      this.updateState({ policy: resolvedPolicy })

      // If the Policy is INVALID, we need to handle explaining that back to the user
      if (resolvedPolicy.status === "INVALID") {
        logger()?.info("HardEligibilitySession.submit.policyInvalid", { resolvedPolicy })
        return this.updateState({ status: "POLICY_ERROR", error: errorFromPolicy(resolvedPolicy) })
      }

      // Use the resolved Policy's ID
      policyId = resolvedPolicy.id
    }

    // We're going to submit and resolve all the ServiceEligibility we need
    logger()?.info("HardEligibilitySession.submit.resolvingServiceEligibility")
    this.updateState({ status: "WAITING_FOR_SERVICE_ELIGIBILITY" })
    let resolvedEligibility
    try {
      resolvedEligibility = await this.createAndResolveEligibility({
        serviceTypeIds: this.sessionConfig.serviceTypeIds,
        policyId,
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
      return this.updateState({ status: "TIMEOUT", error: EligibilityTimeout })
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
      analytics().event("hard_eligibility.session.complete.ineligible", {
        sessionId: this.id,
        dateOfService: this.dateOfService(),
        state: args.state,
        ineligibilityReason,
        policyId: policyId,
        serviceEligibilityIds: Object.keys(resolvedEligibility ?? {}),
        submitCount: this.#state.submitCount,
        durationMs: performance.now() - submitAt,
        durationSinceFirstSubmitMs: performance.now() - (this.#state.firstSubmitAt ?? submitAt),
      })
      return this.updateState({ status: "INELIGIBLE", ineligibilityReason })
    }

    // Resolve the Providers
    const providers = resolveProviders(
      nonNullEligibility,
      this.sessionConfig.mergeStrategy ?? "UNION",
    )

    // If there are no Providers, we're INELIGIBLE even if the plan covers it
    if (isEmpty(providers)) {
      logger()?.info("HardEligibilitySession.submit.noEligibleProviders")
      const ineligibilityReason = {
        code: "PROVIDERS",
        message: Strings.ineligibility.NO_PROVIDERS,
      } as const
      analytics().event("hard_eligibility.session.complete.ineligible", {
        sessionId: this.id,
        dateOfService: this.dateOfService(),
        state: args.state,
        ineligibilityReason,
        policyId: policyId,
        serviceEligibilityIds: Object.keys(resolvedEligibility ?? {}),
        submitCount: this.#state.submitCount,
        durationMs: performance.now() - submitAt,
        durationSinceFirstSubmitMs: performance.now() - (this.#state.firstSubmitAt ?? submitAt),
      })
      return this.updateState({ status: "INELIGIBLE", ineligibilityReason })
    }

    // We're eligible, parse out the estimate and send this back
    const patientResponsibility = this.getPatientResponsibility(nonNullEligibility)
    // This is unexpected, should be guaranteed PatientResponsibility if we have something ELIGIBLE
    if (!patientResponsibility) {
      logger()?.error("HardEligibilitySession.submit.noPatientResponsibility")
      analytics().fatal(new Error("No patientResponsibility found in ServiceEligibility"))
      throw new Error("Unreachable")
    }

    logger()?.info("HardEligibilitySession.submit.eligible", { providers, patientResponsibility })
    analytics().event("hard_eligibility.session.complete.eligible", {
      sessionId: this.id,
      dateOfService: this.dateOfService(),
      state: args.state,
      providerCount: providers.length,
      policyId: policyId,
      serviceEligibilityIds: Object.keys(resolvedEligibility ?? {}),
      patientResponsibility,
      submitCount: this.#state.submitCount,
      durationMs: performance.now() - submitAt,
      durationSinceFirstSubmitMs: performance.now() - (this.#state.firstSubmitAt ?? submitAt),
    })
    return this.updateState({ status: "ELIGIBLE", providers, patientResponsibility })
  }

  /**
   * Replaces the state value, emits an update event
   */
  private setState(state: HardEligibilitySessionState): HardEligibilitySessionState {
    this.#state = state
    logger()?.debug?.("HardEligibilitySession state updated", { state })
    this.emit("update", state)
    analytics().event("hard_eligibility.session.updated", {
      sessionId: this.id,
      status: state.status,
      policyId: state.policy?.id ?? null,
      serviceEligibilityIds: Object.keys(state.serviceEligibility ?? {}),
      error: state.error ?? null,
    })
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
  private async createPolicy(
    patient: HardEligibilityPatientInput,
    state: UsStateCode,
  ): Promise<Policy> {
    const { payerId, firstName, lastName, dateOfBirth, memberId } = patient
    logger()?.info("HardEligibilitySession.createPolicy", { patient, state })
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
    const abortController = new AbortController()

    // We're authenticating with the token we were granted
    const headers = { "x-scoped-access-token": policy._token }

    // This polls for an update
    const pollForPolicy = async (): Promise<ResolvedPolicy> => {
      logger()?.info("pollForPolicy")
      while (waiting) {
        try {
          const latestPolicy = await this.apiClient.policies.getPolicy(policy.id, {
            abortSignal: abortController.signal,
            headers,
          })
          // If it's in a terminal state, use it
          if (isPolicyResolved(latestPolicy)) {
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
    const listenForPolicyUpdates = async (): Promise<ResolvedPolicy> => {
      while (waiting) {
        logger()?.info("listenForPolicyUpdates.connect")
        try {
          const stream = await this.apiClient.policies.streamPolicy(policy.id, {
            abortSignal: abortController.signal,
            headers,
          })
          logger()?.info("listenForPolicyUpdates.connected")
          for await (const latestPolicy of stream) {
            if (!waiting) break // If we're not waiting any more, we're done
            logger()?.info("listenForPolicyUpdates.event", { latestPolicy })
            // If the latest event is good, we can use it
            if (isPolicyResolved(latestPolicy)) {
              logger()?.info("listenForPolicyUpdates.resolved", { latestPolicy })
              return latestPolicy as ResolvedPolicy
            }
          }
          logger()?.info("listenForPolicyUpdates.closed")
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            // This is fine, we're done
            break
          } else {
            logger()?.info("listenForPolicyUpdates.aborted")
            break
          }
          // This is assumed to be a network error, and, we can try again
          logger()?.error("listenForPolicyUpdates.error", { err })
        } finally {
          await new Promise((resolve) => setTimeout(resolve, 1_000))
        }
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
      abortController.abort() // Abort the request
      return resolvedPolicy
    } catch (err) {
      // If this is a TimeoutError, we can handle it specifically
      if (err instanceof TimeoutError) {
        // Set to the timeout state, and return null
        this.updateState({ status: "TIMEOUT", error: EligibilityTimeout })
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
    policyId,
    args,
  }: {
    serviceTypeIds: string[]
    policyId: string
    args: HardEligibilitySubmissionArgs
  }) {
    return Promise.all(
      serviceTypeIds.map(async (serviceTypeId) => {
        // Create the ServiceEligibility for this ServiceType
        const serviceEligibility = await this.createServiceEligibility({
          serviceTypeId,
          policyId,
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
    policyId,
    args,
  }: {
    serviceTypeId: string
    policyId: string
    args: HardEligibilitySubmissionArgs
  }) {
    logger()?.info("HardEligibilitySession.createServiceEligibility", {
      serviceTypeId,
      policyId,
      args,
    })
    // Create the ServiceEligibility, V2 is a quick endpoint that fires off async work
    return this.apiClient.serviceEligibility.v2.createServiceEligibility({
      serviceTypeId,
      policyIds: [policyId],
      dateOfService: this.dateOfService(),
      state: args.state,
      clinicalInfo: args.clinicalInfo,
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
    const abortController = new AbortController()

    // We're authenticating with the token we were granted
    const headers = { "x-scoped-access-token": serviceEligibility._token }

    const isResolved = (serviceEligibility: Pick<ServiceEligibility, "status">) =>
      serviceEligibility.status === "ELIGIBLE" || serviceEligibility.status === "INELIGIBLE"

    // This polls for updates
    const pollForServiceEligibility = async (): Promise<ResolvedServiceEligibility> => {
      logger()?.info("pollForServiceEligibility")
      while (waiting) {
        try {
          const latestServiceEligibility =
            await this.apiClient.serviceEligibility.getServiceEligibility(serviceEligibility.id, {
              abortSignal: abortController.signal,
              headers,
            })
          // If it's in a terminal state, use it
          if (isResolved(latestServiceEligibility)) {
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
    const listenForServiceEligibilityUpdates = async (): Promise<ResolvedServiceEligibility> => {
      while (waiting) {
        logger()?.info("listenForServiceEligibilityUpdates.connect")
        try {
          const stream = await this.apiClient.serviceEligibility.streamServiceEligibility(
            serviceEligibility.id,
            {
              abortSignal: abortController.signal,
              headers,
            },
          )
          logger()?.info("listenForServiceEligibilityUpdates.connected")
          for await (const latestServiceEligibility of stream) {
            if (!waiting) break // If we're not waiting any more, we're done
            logger()?.info("listenForServiceEligibilityUpdates.event", { latestServiceEligibility })
            if (isResolved(latestServiceEligibility)) {
              logger()?.info("listenForServiceEligibilityUpdates.resolved", {
                latestServiceEligibility,
              })
              return latestServiceEligibility as ResolvedServiceEligibility
            }
          }
          logger()?.info("listenForServiceEligibilityUpdates.closed")
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            // This is fine, we're done
            break
          } else {
            logger()?.info("listenForServiceEligibilityUpdates.aborted")
            break
          }
        } finally {
          await new Promise((resolve) => setTimeout(resolve, 1_000))
        }
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
      abortController.abort() // Abort the request
      return resolvedServiceEligibility
    } catch (err) {
      // If this is a TimeoutError, we can handle it specifically
      if (err instanceof TimeoutError) {
        // Set to the timeout state, and return null
        this.updateState({ status: "TIMEOUT", error: EligibilityTimeout })
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
        case "SERVICE_TYPE": {
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
    if (!mergeStrategy || mergeStrategy === "UNION") {
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
