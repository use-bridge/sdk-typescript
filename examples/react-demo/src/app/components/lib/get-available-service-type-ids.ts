/**
 * Returns a stubbed set of ServiceType ID's
 * If configured, a comma-separated list of ServiceType ID's can be provided in the environment
 * `NEXT_PUBLIC_BRIDGE_SERVICE_TYPES`
 */
export function getAvailableServiceTypeIds(): string[] {
  // Get the service type IDs from the environment variable
  const config = process.env.NEXT_PUBLIC_BRIDGE_SERVICE_TYPES
  return config?.split(",").map((s) => s.trim()) ?? ["svt_demo_1", "svt_demo_2", "svt_demo_3"]
}
