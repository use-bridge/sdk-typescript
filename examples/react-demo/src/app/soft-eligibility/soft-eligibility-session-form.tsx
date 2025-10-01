import { type FC } from "react"
import { Stack, Typography } from "@mui/material"
import { PayerAutocompleteField } from "../components/payer-autocomplete-field"
import { StatePicker } from "../components/state-picker"
import { useSoftEligibilityState } from "@usebridge/sdk-react"
import { SoftEligibilitySubmitButton } from "./soft-eligibility-submit-button"

/**
 * Basic user input for the Soft Eligibility request
 * Submits the request
 */
export const SoftEligibilitySessionForm: FC = () => {
  const { status } = useSoftEligibilityState()

  return (
    <Stack spacing={2}>
      <Stack>
        <Typography variant="h6">SoftEligibilitySession</Typography>
        <Typography fontFamily="monospace">{status}</Typography>
      </Stack>

      <PayerAutocompleteField />
      <StatePicker />

      <SoftEligibilitySubmitButton />
    </Stack>
  )
}
