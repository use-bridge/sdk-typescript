import { useSoftEligibilityState } from "@usebridge/sdk-react"
import { List, ListItem, ListItemText, Stack, Typography } from "@mui/material"

/**
 * Renders the list of eligible Providers in this session
 */
export const SoftEligibilityEligibleProviderList = () => {
  const { providers } = useSoftEligibilityState()

  if (!providers) return null

  if (providers.length == 0) return <Typography>There are no eligible Providers</Typography>

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Eligible Providers</Typography>
      <List>
        {providers.map((provider) => (
          <ListItem key={provider.id}>
            <ListItemText>
              {provider.name} {provider.npi}
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}
