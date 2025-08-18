"use client"

import { Link, Stack } from "@mui/material"

export default function Page() {
  return (
    <Stack spacing={2}>
      <Link href="/soft-eligibility">Soft Eligibility</Link>
      <Link href="/hard-eligibility">Hard Eligibility</Link>
    </Stack>
  )
}
