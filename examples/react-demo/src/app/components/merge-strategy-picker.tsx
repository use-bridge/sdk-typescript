"use client"

import { MenuItem, TextField } from "@mui/material"
import type { ServiceTypeMergeStrategy } from "@usebridge/sdk-core"
import { type FC, useEffect, useState } from "react"

interface MergeStrategyPickerProps {
  onChanged: (mergeStrategy: ServiceTypeMergeStrategy) => void
  disabled: boolean
}

const options: { id: ServiceTypeMergeStrategy; text: string }[] = [
  { id: "UNION", text: "Union" },
  { id: "INTERSECTION", text: "Intersection" },
]

export const MergeStrategyPicker: FC<MergeStrategyPickerProps> = ({ disabled, onChanged }) => {
  const [value, setValue] = useState<ServiceTypeMergeStrategy>("UNION")

  useEffect(() => {
    onChanged(value)
  }, [onChanged, value])

  return (
    <TextField
      select
      label="Merge Strategy"
      size="medium"
      disabled={disabled}
      value={value}
      onChange={(e) => setValue(e.target.value as ServiceTypeMergeStrategy)}
    >
      {options.map((opt) => (
        <MenuItem key={opt.id} value={opt.id}>
          {opt.text}
        </MenuItem>
      ))}
    </TextField>
  )
}
