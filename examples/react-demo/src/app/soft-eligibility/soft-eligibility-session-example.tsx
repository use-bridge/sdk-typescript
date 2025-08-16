import { type UsStateCode } from "@usebridge/sdk-core"
import { type FC, useCallback, useState } from "react"
import { Button, Stack, Typography } from "@mui/material"
import { PayerAutocompleteField } from "../components/payer-autocomplete-field"
import { BridgeApi } from "@usebridge/api"
import { StatePicker } from "../components/state-picker"
import { useSoftEligibilityState, useSoftEligibilitySubmit } from "@usebridge/sdk-react"

/**
 * Basic user input for the Soft Eligibility request
 * Submits the request
 */
export const SoftEligibilitySessionExample: FC = () => {
  const sessionState = useSoftEligibilityState()
  const submit = useSoftEligibilitySubmit()

  const [payer, setPayer] = useState<BridgeApi.SearchPayerV1ResponseItem | null>(null)
  const [state, setState] = useState<UsStateCode | null>(null)

  const canSubmit = Boolean(
    !["SUBMITTING", "ERROR"].includes(sessionState.status) && payer && state,
  )

  const submitHandler = useCallback(() => {
    if (!payer) throw new Error("Payer is required")
    if (!state) throw new Error("State is required")
    void submit({ payerId: payer.id, state })
  }, [payer, state])

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">SoftEligibilitySession</Typography>
        <Typography fontFamily="monospace">{sessionState.status}</Typography>
      </Stack>

      <PayerAutocompleteField onPayerChanged={setPayer} />
      <StatePicker onChanged={setState} disabled={false} />

      <Button disabled={!canSubmit} variant="contained" onClick={submitHandler}>
        Submit Soft Eligibility
      </Button>
    </Stack>
  )
}
