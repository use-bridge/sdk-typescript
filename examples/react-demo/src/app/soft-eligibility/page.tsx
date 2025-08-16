"use client"

import { useState } from "react"
import { PageHeader } from "../components/page-header"
import { Grid, Stack } from "@mui/material"
import { SoftEligibilitySession } from "@usebridge/sdk-core"
import { SoftEligibilityProvider, useBridgeSdk } from "@usebridge/sdk-react"
import { SoftEligibilitySessionExample } from "./soft-eligibility-session-example"
import { SoftEligibilityEligibleProviderList } from "./soft-eligibility-providers"
import { SoftEligibilityConfigForm } from "./soft-eligibility-config-form"

/**
 * This page allows the user to configure the inputs for a `createSoftEligibilitySession` call
 * ^ In practice, this would be done behind the scenes by the config/backend
 *
 * Then, it has basic payer/state selection
 * ^ Equivalent to what a real user would see
 *
 * The Soft Eligibility request is submitted, results are displayed
 * ^ If successful, the user sees all eligible Providers
 */
export default function SoftEligibilityPage() {
  const bridgeSdk = useBridgeSdk()
  const [session, setSession] = useState<SoftEligibilitySession>()

  return (
    <Stack>
      <PageHeader
        title="Soft Eligibility"
        path="soft-eligibility"
        action="Reset"
        onAction={session ? () => setSession(undefined) : undefined}
      />
      <Grid container spacing={4}>
        <Grid size={4}>
          <SoftEligibilityConfigForm
            disabled={Boolean(session)}
            onSubmit={(config) => setSession(bridgeSdk.createSoftEligibilitySession(config))}
          />
        </Grid>
        {session && (
          <SoftEligibilityProvider session={session}>
            <Grid size={4}>
              <SoftEligibilitySessionExample />
            </Grid>
            <Grid size={4}>
              <SoftEligibilityEligibleProviderList />
            </Grid>
          </SoftEligibilityProvider>
        )}
      </Grid>
    </Stack>
  )
}
