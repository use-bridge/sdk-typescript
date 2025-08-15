"use client"

import { useEffect, useState } from "react"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { usePayerAutocomplete } from "@usebridge/sdk-react"
import { Bridge } from "@usebridge/api"

interface PayerAutocompleteFieldProps {
  onPayerChange: (payer: Bridge.SearchPayerV1ResponseItems | null) => void
}

export const PayerAutocompleteField = ({ onPayerChange }: PayerAutocompleteFieldProps) => {
  const [inputValue, setInputValue] = useState("")
  const { results, isLoading } = usePayerAutocomplete(inputValue, { limit: 50 })
  const [value, setValue] = useState<Bridge.SearchPayerV1ResponseItems | null>(null)

  useEffect(() => {
    onPayerChange(value)
  }, [onPayerChange, value])

  return (
    <Autocomplete<Bridge.SearchPayerV1ResponseItems>
      loading={isLoading}
      options={results}
      value={value}
      onChange={(_, v) => setValue(v)}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      filterOptions={(x) => x}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionLabel={(o) => o?.name ?? ""}
      renderInput={({ InputProps, InputLabelProps, ...params }) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          label="Payer"
          placeholder="Search"
          InputLabelProps={{
            ...InputLabelProps,
            className: InputLabelProps?.className ?? "",
            style: InputLabelProps?.style ?? {},
          }}
          InputProps={{
            ...InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress size={16} thickness={5} /> : null}
                {InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
