"use client"

import { useState } from "react"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { useEligibilityInputPayer, usePayerAutocomplete } from "@usebridge/sdk-react"
import { BridgeApi } from "@usebridge/api"

interface PayerAutocompleteFieldProps {
  disabled?: boolean
}

export const PayerAutocompleteField = ({ disabled }: PayerAutocompleteFieldProps) => {
  const [inputValue, setInputValue] = useState("")
  const { results, isLoading } = usePayerAutocomplete(inputValue, { limit: 50 })
  const [value, setValue] = useEligibilityInputPayer()

  return (
    <Autocomplete<BridgeApi.SearchPayerV1ResponseItem>
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
          disabled={Boolean(disabled)}
          variant="outlined"
          size="medium"
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
