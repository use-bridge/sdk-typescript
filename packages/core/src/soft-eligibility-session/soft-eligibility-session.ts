import { EventEmitter } from "eventemitter3"
import { v4 as uuidv4 } from "uuid"
import type {
  SoftEligibilitySessionConfig,
  SoftEligibilitySessionState,
  SoftEligibilitySubmissionArgs,
} from "./types.js"
import { AlreadySubmittingError } from "../errors/index.js"
import { BridgeApi, BridgeApiClient } from "@usebridge/api"
import { dateObjectToDatestamp, dateToDateObject } from "../lib/date-object.js"
import { fromPairs, isEmpty } from "lodash-es"
import { ServiceTypeRequiredError } from "../errors/service-type-required-error.js"
import { resolveProviders } from "../lib/resolve-providers.js"
import { logger } from "../logger/sdk-logger.js"

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
    private readonly sessionConfig: SoftEligibilitySessionConfig,
  ) {
    super()
    if (isEmpty(sessionConfig.serviceTypeIds)) throw new ServiceTypeRequiredError()
    this.id = uuidv4()
    this.#state = { status: "PENDING" }
    logger()?.info("SoftEligibilitySession created", { id: this.id, sessionConfig })
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
    logger()?.info("SoftEligibilitySession.submit", { id: this.id, args })

    // One request at a time
    if (this.#state.status === "SUBMITTING") throw new AlreadySubmittingError()

    // Move to SUBMITTING, clear things out
    this.setState({ args, status: "SUBMITTING" })

    try {
      // We need to make a call for each ServiceType ID, then come back with a map to the ProviderEligibility
      const providerEligibility = await this.createProviderEligibilityMap(args)
      logger()?.info("SoftEligibilitySession.submit.providerEligibility", { providerEligibility })
      this.updateState({ providerEligibility })

      // Based on the merge Strategy, who do we have?
      const providers = resolveProviders(Object.values(providerEligibility))
      logger()?.info("SoftEligibilitySession.submit.providers", { providers })
      this.updateState({ providers })

      // If there are none, we're INELIGIBLE
      if (isEmpty(providers)) {
        logger()?.info("SoftEligibilitySession.resolved.noProviders")
        return this.updateState({ status: "INELIGIBLE" })
      }

      // Otherwise, this is good
      logger()?.info("SoftEligibilitySession.submit.eligible")
      return this.updateState({ status: "ELIGIBLE" })
    } catch (err) {
      // If anything goes wrong, we need to try again, and then resolve with the final state
      logger()?.error("SoftEligibilitySession.submit.error", { id: this.id, err })
      return this.setState({ args, status: "ERROR" })
    }
  }

  private setState(state: SoftEligibilitySessionState): SoftEligibilitySessionState {
    this.#state = state
    logger()?.debug?.("SoftEligibilitySession.setState", { id: this.id, state })
    this.emit("update", state)
    return state
  }

  private updateState(updates: Partial<SoftEligibilitySessionState>): SoftEligibilitySessionState {
    logger()?.info("SoftEligibilitySession.updateState", { id: this.id, updates })
    return this.setState({ ...this.#state, ...updates })
  }

  /**
   * Creates a map of ProviderEligibility by ServiceType ID
   */
  private async createProviderEligibilityMap({
    payerId,
    state,
  }: SoftEligibilitySubmissionArgs): Promise<
    Record<string, BridgeApi.ProviderEligibilityCreateV1Response>
  > {
    const { serviceTypeIds, dateOfService } = this.sessionConfig

    // We need to make a call for each ServiceType ID, then come back with a map to the ProviderEligibility
    return fromPairs<BridgeApi.ProviderEligibilityCreateV1Response>(
      await Promise.all(
        serviceTypeIds.map<Promise<[string, BridgeApi.ProviderEligibilityCreateV1Response]>>(
          async (serviceTypeId) => [
            serviceTypeId,
            await this.apiClient.providerEligibility.createProviderEligibility({
              payerId,
              location: { state },
              dateOfService: dateObjectToDatestamp(dateOfService ?? dateToDateObject()),
              serviceTypeId,
            }),
          ],
        ),
      ),
    )
  }
}
