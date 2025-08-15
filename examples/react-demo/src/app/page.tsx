"use client"

import { Box } from "@mui/material"
import { PayerAutocompleteField } from "./payer-autocomplete-field"
import { useState } from "react"
import { Bridge } from "@usebridge/api"

export default function Page() {
  const [payer, setPayer] = useState<Bridge.SearchPayerV1ResponseItems | null>(null)

  return (
    <Box sx={{ p: 4, maxWidth: 520 }}>
      <PayerAutocompleteField onPayerChange={setPayer} />
      <pre>{JSON.stringify(payer, null, 2)}</pre>
    </Box>
  )
}
