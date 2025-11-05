"use client"

import { HardEligibilityProvider, useCreateHardEligibilitySession } from "@usebridge/sdk-react"
import { HardEligibilitySession } from "@usebridge/sdk-core"
import { useState } from "react"
import { Grid, Stack } from "@mui/material"
import { PageHeader } from "../components/page-header"
import { HardEligibilityFollowUpConfigForm } from "./hard-eligibility-follow-up-config-form"
import { HardEligibilityFollowUpSessionForm } from "./hard-eligibility-follow-up-session-form"
import { HardEligibilityEligibleProviderList } from "../hard-eligibility/hard-eligibility-providers"
import { EstimateView } from "../hard-eligibility/estimate-view"
import { HardEligibilityErrorView } from "../hard-eligibility/hard-eligibility-error-view"
import { IneligibilityView } from "../hard-eligibility/ineligibility-view"

export default function HardEligibilityFollowUpPage() {
  const createSession = useCreateHardEligibilitySession()
  const [session, setSession] = useState<HardEligibilitySession>()

  return (
    <Stack>
      <PageHeader
        title="Follow Up Hard Eligibility"
        path="hard-eligibility-follow-up"
        action="Reset"
        onAction={session ? () => setSession(undefined) : undefined}
      />
      <Grid container spacing={4}>
        <Grid size={4}>
          <HardEligibilityFollowUpConfigForm
            disabled={Boolean(session)}
            onSubmit={(config) => setSession(createSession(config))}
          />
        </Grid>
        {session && (
          <HardEligibilityProvider session={session}>
            <Grid size={4}>
              <Stack spacing={4}>
                <HardEligibilityFollowUpSessionForm />
                <HardEligibilityErrorView />
              </Stack>
            </Grid>
            <Grid size={4}>
              <Stack spacing={4}>
                <IneligibilityView />
                <EstimateView />
                <HardEligibilityEligibleProviderList />
              </Stack>
            </Grid>
          </HardEligibilityProvider>
        )}
      </Grid>
    </Stack>
  )
}

