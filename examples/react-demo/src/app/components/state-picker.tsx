"use client"

import { MenuItem, TextField } from "@mui/material"
import { type UsStateCode, UsStateMap } from "@usebridge/sdk-core"
import { useEligibilityInputField } from "@usebridge/sdk-react"

export const StatePicker = () => {
  const { value, setValue, isDisabled } = useEligibilityInputField("state")
  return (
    <TextField
      disabled={isDisabled}
      select
      label="State"
      size="medium"
      value={value ?? ""}
      onChange={(e) => setValue(e.target.value as UsStateCode)}
    >
      {Object.entries(UsStateMap).map(([code, name]) => (
        <MenuItem key={code} value={code}>
          {name}
        </MenuItem>
      ))}
    </TextField>
  )
}
