import { useHardEligibilityState, useHardEligibilitySubmit } from "@usebridge/sdk-react"
import { Stack, Typography } from "@mui/material"
import { PayerAutocompleteField } from "../components/payer-autocomplete-field"
import { StatePicker } from "../components/state-picker"

/**
 * User input for the Hard Eligibility request, submits
 */
export const HardEligibilitySessionForm = () => {
  const { status } = useHardEligibilityState()
  const { isDisabled, submit } = useHardEligibilitySubmit()

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">SoftEligibilitySession</Typography>
        <Typography fontFamily="monospace">{status}</Typography>
      </Stack>

      <PayerAutocompleteField />
      <StatePicker />
      <pre>FIRST NAME</pre>
      <pre>LAST NAME</pre>
      <pre>DATE OF BIRTH</pre>
      <pre>MEMBER ID</pre>

      <pre>SUBMIT {isDisabled}</pre>
    </Stack>
  )
}
