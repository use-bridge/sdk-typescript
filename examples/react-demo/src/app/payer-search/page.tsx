"use client"

import { Stack, Typography } from "@mui/material"
import { PayerAutocompleteField } from "../components/payer-autocomplete-field"
import { useState } from "react"
import { BridgeApi } from "@usebridge/api"
import { PageHeader } from "../components/page-header"

export default function Page() {
  const [payer, setPayer] = useState<BridgeApi.SearchPayerV1ResponseItem | null>(null)

  return (
    <Stack spacing={4}>
      <PageHeader title="Payer Search (Autocomplete)" path="payer-search" />
      <PayerAutocompleteField onPayerChanged={setPayer} />
      {payer ? (
        <Stack spacing={1}>
          <Typography variant="h6">{payer.name}</Typography>
          <Typography fontFamily="monospace">{payer.id}</Typography>
          <Typography>Member ID? {payer.memberId ? "REQUIRED" : "OPTIONAL"}</Typography>
          {payer.hint && <Typography fontStyle="italic">{payer.hint}</Typography>}
        </Stack>
      ) : (
        <Typography variant="caption">Payer not selected</Typography>
      )}
      {payer && <pre>{JSON.stringify(payer, null, 2)}</pre>}
    </Stack>
  )
}
