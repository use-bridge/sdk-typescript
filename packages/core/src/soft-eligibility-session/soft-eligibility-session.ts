import { EventEmitter } from "eventemitter3"
import { v4 as uuidv4 } from "uuid"
import type {
  SoftEligibilitySessionConfig,
  SoftEligibilitySessionState,
  SoftEligibilitySubmissionArgs,
} from "./types.js"
import type { BridgeSdkConfig } from "../types/index.js"
import { AlreadySubmittingError } from "../errors/index.js"
import { BridgeApi, BridgeApiClient } from "@usebridge/api"
import { dateObjectToDate, dateToDateObject } from "../lib/date-object.js"
import { fromPairs, intersectionBy, isEmpty, uniqBy } from "lodash-es"
import { ServiceTypeRequiredError } from "../errors/service-type-required-error.js"

/**
 * Events emitted by a Soft Eligibility Session
 */
export interface SoftEligibilitySessionEvents {
  update: [SoftEligibilitySessionState]
}

/**
 * Instance of a Soft Eligibility Session
 * Any time the 'state' is updated, an `update` event is emitted
 */
export class SoftEligibilitySession extends EventEmitter<SoftEligibilitySessionEvents> {
  readonly id: string
  #state: SoftEligibilitySessionState

  constructor(
    private readonly apiClient: BridgeApiClient,
    private readonly config: BridgeSdkConfig,
    private readonly sessionConfig: SoftEligibilitySessionConfig,
  ) {
    super()
    if (isEmpty(sessionConfig.serviceTypeIds)) throw new ServiceTypeRequiredError()
    this.id = uuidv4()
    this.#state = { status: "PENDING" }
    this.config.logger?.info("SoftEligibilitySession created", { id: this.id, sessionConfig })
  }

  /**
   * Fetch the current state of the session
   */
  get state(): Readonly<SoftEligibilitySessionState> {
    return this.#state
  }

  /**
   * Submits a new request for Soft Eligibility   *
   * @return a Promise that resolves to a terminal SoftEligibilitySessionState   *
   * @throws {AlreadySubmittingError} if a request is already in-flight
   */
  async submit(args: SoftEligibilitySubmissionArgs): Promise<SoftEligibilitySessionState> {
    this.config.logger?.info("SoftEligibilitySession.submit", { id: this.id, args })
    const { payerId, state } = args

    // One request at a time
    if (this.#state.status === "SUBMITTING") throw new AlreadySubmittingError()

    // Move to SUBMITTING, clear things out
    this.setState({ args, status: "SUBMITTING" })

    try {
      const { serviceTypeIds, mergeStrategy } = this.sessionConfig

      // We need to make a call for each ServiceType ID, then come back with a map to the ProviderEligibility
      const providerEligibility = fromPairs<BridgeApi.ProviderEligibilityCreateV1Response>(
        await Promise.all(
          serviceTypeIds.map<Promise<[string, BridgeApi.ProviderEligibilityCreateV1Response]>>(
            async (serviceTypeId) => [
              serviceTypeId,
              await this.apiClient.providerEligibility.createProviderEligibility({
                payerId,
                location: { state },
                dateOfService: dateObjectToDate(
                  this.sessionConfig.dateOfService ?? dateToDateObject(),
                ).toISOString(),
                serviceTypeId,
              }),
            ],
          ),
        ),
      )
      // Based on the merge Strategy, what can we do?
      let providers

      // If it's UNION, we return all unique payers from any 'ELIGIBLE' results
      // If there are no Providers in the end, we're INELIGIBLE
      if (mergeStrategy === "UNION") {
        // Combine all the ELIGIBLE Providers, then deduplicate by ID
        providers = uniqBy(
          Object.values(providerEligibility)
            .filter((pe) => pe.status === "ELIGIBLE")
            .flatMap((pe) => pe.providers),
          (p) => p.id,
        )
      }
      // If it's INTERSECTION, we need to find the intersection of all Providers
      // Naturally, the ProviderEligibility will have no Providers if not ELIGIBLE
      // So, all we have to do is intersect ALL results and infer eligibility from what's left
      else if (mergeStrategy === "INTERSECTION") {
        // We can use intersectionBy
        providers = intersectionBy(
          ...Object.values(providerEligibility).map((pe) => pe.providers),
          (p) => p.id,
        )
      } else {
        // This should never happen
        throw new Error(`The mergeStrategy ${mergeStrategy} is not supported`)
      }

      // If there are none, we're INELIGIBLE
      if (isEmpty(providers)) {
        this.config.logger?.info("SoftEligibilitySession resolved, no providers")
        return this.setState({ args, status: "INELIGIBLE", providerEligibility })
      }

      // Otherwise, this is good
      this.config.logger?.info("SoftEligibilitySession resolved, eligible")
      return this.setState({ args, status: "ELIGIBLE", providers, providerEligibility })
    } catch (err) {
      // If anything goes wrong, we need to try again, and then resolve with the final state
      this.config.logger?.error("SoftEligibilitySession error", { id: this.id, err })
      return this.setState({ args, status: "ERROR" })
    }
  }

  private setState(state: SoftEligibilitySessionState): SoftEligibilitySessionState {
    this.#state = state
    this.config?.logger?.debug?.("SoftEligibilitySession state updated", { id: this.id, state })
    this.emit("update", state)
    return state
  }
}
