import {
  useHardEligibilityState,
  useHardEligibilitySubmit,
} from "@usebridge/sdk-react"
import { Button, Stack, Typography } from "@mui/material"
import { StatePicker } from "../components/state-picker"

export const HardEligibilityFollowUpSessionForm = () => {
  const { status } = useHardEligibilityState()

  const { isDisabled, submit } = useHardEligibilitySubmit()

  return (
    <Stack spacing={2}>
      <Stack>
        <Typography variant="h6">HardEligibilitySession</Typography>
        <Typography fontFamily="monospace">{status}</Typography>
      </Stack>

      <StatePicker />

      <Button disabled={isDisabled} variant="contained" onClick={submit}>
        Submit Hard Eligibility
      </Button>
    </Stack>
  )
}

