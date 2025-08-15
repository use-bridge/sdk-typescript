"use client"

import { Box } from "@mui/material"
import { PayerAutocompleteField } from "./payer-autocomplete-field"

export default function Page() {
  return (
    <Box sx={{ p: 4, maxWidth: 520 }}>
      <PayerAutocompleteField />
    </Box>
  )
}
