"use client"

import { useCreateHardEligibilitySession } from "@usebridge/sdk-react"
import { HardEligibilitySession } from "@usebridge/sdk-core"
import { useState } from "react"
import { Grid, Stack } from "@mui/material"
import { PageHeader } from "../components/page-header"
import { HardligibilityConfigForm } from "./hard-eligibility-config-form"

/**
 * This page allows the user to configure the inputs for a `createHardEligibilitySession` call
 * ^ In practice, this would be done behind the scenes by the config/backend
 *
 * Then, user inputs full Hard Check requirements (payer, state, name, dob, etc.)
 * ^ Equivalent to what a real user would see
 *
 * Hard Eligibility request is submitted, results are displayed
 * Error states are handled appropriately
 * ^ If successful, the user sees all eligible Providers
 */
export default function HardEligibilityPage() {
  const createSession = useCreateHardEligibilitySession()
  const [session, setSession] = useState<HardEligibilitySession>()

  return (
    <Stack>
      <PageHeader
        title="Hard Eligibility"
        path="hard-eligibility"
        action="Reset"
        onAction={session ? () => setSession(undefined) : undefined}
      />
      <Grid container spacing={4}>
        <Grid size={4}>
          <HardligibilityConfigForm
            disabled={false}
            onSubmit={(config) => setSession(createSession(config))}
          />
        </Grid>
      </Grid>
    </Stack>
  )
}
