import { List, ListItem, Stack, Typography } from "@mui/material"
import type { FC } from "react"
import type { ResolvedProvider } from "@usebridge/sdk-core"

/**
 * Renders the list of eligible Providers in this session
 */
export const ProviderList: FC<{ providers: ResolvedProvider[] }> = ({ providers }) => {
  if (providers.length == 0) return <Typography>There are no eligible Providers</Typography>
  return (
    <Stack spacing={2}>
      <Typography variant="h6">Eligible Providers</Typography>
      <List>
        {providers.map((provider) => (
          <ListItem key={provider.id}>
            <Stack>
              <Typography>
                {provider.name}, {provider.type}
              </Typography>
              <Typography variant="caption" fontFamily="monospace">
                {provider.id}
              </Typography>
              <Typography variant="caption" fontFamily="monospace">
                {provider.npi}
              </Typography>
              <Typography variant="caption" fontFamily="monospace">
                {provider.serviceTypeIds.join(", ")}
              </Typography>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}
