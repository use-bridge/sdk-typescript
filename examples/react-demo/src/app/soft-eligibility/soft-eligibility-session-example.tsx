import {
  SoftEligibilitySession,
  type SoftEligibilitySessionState,
  type UsStateCode,
} from "@usebridge/sdk-core"
import { type FC, useCallback, useEffect, useState } from "react"
import { Button, List, ListItem, ListItemText, Stack, Typography } from "@mui/material"
import { PayerAutocompleteField } from "../components/payer-autocomplete-field"
import { BridgeApi } from "@usebridge/api"
import { StatePicker } from "../components/state-picker"

interface SoftEligibilitySessionExample {
  session: SoftEligibilitySession
}

/**
 * Hook that listens in for the state of a SoftEligibilitySession
 * Re-renders the component when the state changes
 */
function useSoftEligibilitySessionState(
  session: SoftEligibilitySession,
): SoftEligibilitySessionState {
  // We're tracking the state value internally, start with what the `session gives us
  const [state, setState] = useState(session.state)

  // Listen in for events, the payload is the state object itself
  useEffect(() => {
    session.on("update", setState)
    return () => {
      session.removeListener("update", setState)
    }
  }, [session])

  return state
}

export const SoftEligibilitySessionExample: FC<SoftEligibilitySessionExample> = ({ session }) => {
  const sessionState = useSoftEligibilitySessionState(session)

  const [payer, setPayer] = useState<BridgeApi.SearchPayerV1ResponseItem | null>(null)
  const [state, setState] = useState<UsStateCode | null>(null)

  const canSubmit = Boolean(sessionState.status !== "ERROR" && payer && state)

  const submitHandler = useCallback(() => {
    if (!payer) throw new Error("Payer is required")
    if (!state) throw new Error("State is required")
    void session.submit({ payerId: payer.id, state })
  }, [payer, state])

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h6">SoftEligibilitySession {session.id}</Typography>
        <Typography fontFamily="monospace">{sessionState.status}</Typography>
      </Stack>

      <PayerAutocompleteField onPayerChanged={setPayer} />
      <StatePicker onChanged={setState} disabled={false} />

      <Button disabled={!canSubmit} variant="contained" onClick={submitHandler}>
        Submit Soft Eligibility
      </Button>

      {sessionState.providers && (
        <>
          <Typography variant="h6">Eligible Providers</Typography>
          <List>
            {sessionState.providers.map((provider) => (
              <ListItem key={provider.id}>
                <ListItemText>
                  {provider.name} {provider.npi}
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Stack>
  )
}
