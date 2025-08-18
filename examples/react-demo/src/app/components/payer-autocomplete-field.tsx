"use client"

import { useState } from "react"
import { Autocomplete, CircularProgress, TextField } from "@mui/material"
import { useEligibilityInputField, usePayerAutocomplete } from "@usebridge/sdk-react"
import type { Payer } from "@usebridge/sdk-core"

export const PayerAutocompleteField = () => {
  const [inputValue, setInputValue] = useState("")
  const { results, isLoading } = usePayerAutocomplete(inputValue, { limit: 50 })
  const { value, setValue, isDisabled } = useEligibilityInputField("payer")

  return (
    <Autocomplete<Payer>
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
          disabled={isDisabled}
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
