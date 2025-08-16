import type { FC } from "react"
import { Button, Stack, Typography } from "@mui/material"

export const PageHeader: FC<{
  title: string
  path: string
  action?: string
  onAction?: (() => void) | undefined
}> = ({ title, path, action, onAction }) => (
  <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="start">
    <Stack spacing={1}>
      <Typography variant="h4">{title}</Typography>
      <Typography variant="subtitle1" fontFamily="monospace">
        /examples/react-demo/src/app/{path}/page.tsx
      </Typography>
    </Stack>
    {onAction && (
      <Button variant="contained" onClick={onAction} color="error">
        {action ?? "Action"}
      </Button>
    )}
  </Stack>
)
