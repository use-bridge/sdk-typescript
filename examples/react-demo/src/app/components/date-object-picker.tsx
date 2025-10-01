"use client"

import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"
import { type FC, useEffect, useMemo, useState } from "react"
import type { DateObject } from "@usebridge/sdk-core"

interface DateOnlyPickerProps {
  onChange: (date: DateObject) => void
  disabled: boolean
}

export const DateObjectPicker: FC<DateOnlyPickerProps> = ({ disabled, onChange }) => {
  const [value, setValue] = useState(dayjs())

  const dateObject = useMemo(
    () =>
      ({
        year: value.format("YYYY"),
        month: value.format("MM"),
        day: value.format("DD"),
      }) as DateObject,
    [value],
  )

  useEffect(() => {
    onChange(dateObject)
  }, [dateObject, onChange])

  return (
    <DatePicker
      disabled={disabled}
      value={value}
      onChange={(newValue: Dayjs | null) => {
        if (newValue) setValue(newValue)
      }}
      slotProps={{
        textField: {
          size: "medium",
          label: "Select Date",
        },
      }}
    />
  )
}
