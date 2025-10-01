import { useHardEligibilityState } from "@usebridge/sdk-react"
import { Stack, Typography } from "@mui/material"

/**
 * Displays eligibility errors, helps user resolve finding their policy
 */
export const HardEligibilityErrorView = () => {
  const { error } = useHardEligibilityState()
  if (!error) return null

  return (
    <Stack>
      <Typography variant="subtitle1" color="error">
        {error.message}
      </Typography>
      <pre>{JSON.stringify({ error }, null, 2)}</pre>
    </Stack>
  )
}
