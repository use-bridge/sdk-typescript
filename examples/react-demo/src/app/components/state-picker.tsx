"use client"

import { MenuItem, TextField } from "@mui/material"
import type { FC } from "react"
import { type UsStateCode, UsStateMap } from "@usebridge/sdk-core"

interface StatePickerProps {
  onChanged: (state: UsStateCode) => void
  disabled?: boolean
}

export const StatePicker: FC<StatePickerProps> = ({ onChanged, disabled }) => {
  return (
    <TextField
      disabled={Boolean(disabled)}
      select
      label="State"
      size="medium"
      defaultValue=""
      onChange={(e) => onChanged(e.target.value as UsStateCode)}
    >
      {Object.entries(UsStateMap).map(([code, name]) => (
        <MenuItem key={code} value={code}>
          {name}
        </MenuItem>
      ))}
    </TextField>
  )
}
