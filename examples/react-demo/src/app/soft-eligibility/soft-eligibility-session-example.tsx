import { type FC } from "react"
import { Button, Stack, Typography } from "@mui/material"
import { PayerAutocompleteField } from "../components/payer-autocomplete-field"
import { StatePicker } from "../components/state-picker"
import {
  useEligibilityInputIsValid,
  useSoftEligibilityState,
  useSoftEligibilitySubmit,
} from "@usebridge/sdk-react"

/**
 * Basic user input for the Soft Eligibility request
 * Submits the request
 */
export const SoftEligibilitySessionExample: FC = () => {
  const sessionState = useSoftEligibilityState()
  const submit = useSoftEligibilitySubmit()

  const isValid = useEligibilityInputIsValid()

  const canSubmit = Boolean(!["SUBMITTING", "ERROR"].includes(sessionState.status) && isValid)

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">SoftEligibilitySession</Typography>
        <Typography fontFamily="monospace">{sessionState.status}</Typography>
      </Stack>

      <PayerAutocompleteField />
      <StatePicker />

      <Button disabled={!canSubmit} variant="contained" onClick={() => void submit()}>
        Submit Soft Eligibility
      </Button>
    </Stack>
  )
}
