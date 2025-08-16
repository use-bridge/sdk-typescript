/**
 * Thrown if one/many ServiceTypes are required, but not required
 */
export class ServiceTypeRequiredError extends Error {
  constructor() {
    super("Service type is required for this operation.")
    this.name = "ServiceTypeRequiredError"
  }
}
