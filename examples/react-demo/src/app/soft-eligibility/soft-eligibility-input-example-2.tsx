import { useEligibilityInput } from "@usebridge/sdk-react"

export const SoftEligibilityInputExample2 = () => {
  const input = useEligibilityInput()

  return <pre>{JSON.stringify(input, null, 2)}</pre>
}
