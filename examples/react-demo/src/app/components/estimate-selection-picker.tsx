"use client"

import { MenuItem, TextField } from "@mui/material"
import type { EstimateSelection } from "@usebridge/sdk-core"
import { type FC, useEffect, useState } from "react"
import { getAvailableServiceTypeIds } from "./lib/get-available-service-type-ids"

interface EstimateSelectionPickerProps {
  onChange: (estimateSelection: EstimateSelection) => void
  disabled: boolean
}

const options: { value: EstimateSelection; text: string }[] = [
  { value: { mode: "HIGHEST" }, text: "Highest Cost" },
  { value: { mode: "LOWEST" }, text: "Lowest Cost" },
  {
    value: { mode: "SERVICE_TYPE", serviceTypeId: getAvailableServiceTypeIds()[0] },
    text: "Specific ServiceType (1st)",
  },
]

export const EstimateSelectionPicker: FC<EstimateSelectionPickerProps> = ({
  disabled,
  onChange,
}) => {
  const [value, setValue] = useState<EstimateSelection>({ mode: "HIGHEST" })

  useEffect(() => {
    onChange(value)
  }, [onChange, value])

  return (
    <TextField
      select
      label="Estimate Selection"
      size="medium"
      disabled={disabled}
      value={value.mode}
      onChange={(e) =>
        setValue(options.find((o) => o.value.mode === e.target.value)!.value as EstimateSelection)
      }
    >
      {options.map((opt) => (
        <MenuItem key={opt.value.mode} value={opt.value.mode}>
          {opt.text}
        </MenuItem>
      ))}
    </TextField>
  )
}
