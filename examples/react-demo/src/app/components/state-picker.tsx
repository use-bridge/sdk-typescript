"use client"

import { MenuItem, TextField } from "@mui/material"
import type { FC } from "react"
import { type UsStateCode, UsStateMap } from "@usebridge/sdk-core"
import { useEligibilityInputState } from "@usebridge/sdk-react"

interface StatePickerProps {
  disabled?: boolean
}

export const StatePicker: FC<StatePickerProps> = ({ disabled }) => {
  const [state, setState] = useEligibilityInputState()
  return (
    <TextField
      disabled={Boolean(disabled)}
      select
      label="State"
      size="medium"
      value={state ?? ""}
      onChange={(e) => setState(e.target.value as UsStateCode)}
    >
      {Object.entries(UsStateMap).map(([code, name]) => (
        <MenuItem key={code} value={code}>
          {name}
        </MenuItem>
      ))}
    </TextField>
  )
}
