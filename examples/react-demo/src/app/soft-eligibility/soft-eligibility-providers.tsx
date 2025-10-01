import { useSoftEligibilityState } from "@usebridge/sdk-react"
import { ProviderList } from "../components/provider-list"

/**
 * Renders the list of eligible Providers in this session
 */
export const SoftEligibilityEligibleProviderList = () => {
  const { providers } = useSoftEligibilityState()
  if (!providers) return null
  return <ProviderList providers={providers} />
}
