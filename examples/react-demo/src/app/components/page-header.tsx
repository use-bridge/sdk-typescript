import type { FC } from "react"
import { Stack, Typography } from "@mui/material"

export const PageHeader: FC<{ title: string; path: string }> = ({ title, path }) => (
  <Stack spacing={1}>
    <Typography variant="h4">{title}</Typography>
    <Typography variant="subtitle1" fontFamily="monospace">
      {path}
    </Typography>
  </Stack>
)
