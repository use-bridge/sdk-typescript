"use client"

import { useCallback, useState } from "react"
import { PageHeader } from "../components/page-header"
import { Alert, Button, Grid, Stack } from "@mui/material"
import { SoftEligibilitySession, type SoftEligibilitySessionConfig } from "@usebridge/sdk-core"
import { SoftEligibilityProvider, useBridgeSdk } from "@usebridge/sdk-react"
import { SoftEligibilitySessionExample } from "./soft-eligibility-session-example"
import { SoftEligibilityEligibleProviderList } from "./soft-eligibility-providers"
import { SoftEligibilityConfigForm } from "./soft-eligibility-config-form"

export default function SoftEligibilityPage() {
  const bridgeSdk = useBridgeSdk()
  const [config, setConfig] = useState<SoftEligibilitySessionConfig>()
  const [session, setSession] = useState<SoftEligibilitySession>()

  const isValidConfig = config?.serviceTypeIds?.length ?? 0 > 0
  const hasSession = Boolean(session)

  const handleCreateSession = useCallback(() => {
    if (!isValidConfig || !config) throw new Error()
    setSession(bridgeSdk.createSoftEligibilitySession(config))
  }, [isValidConfig, hasSession, config])

  return (
    <Stack>
      <PageHeader
        title="Soft Eligibility"
        path="soft-eligibility"
        action="Reset"
        onAction={hasSession ? () => setSession(undefined) : undefined}
      />
      <Grid container spacing={4}>
        <Grid size={4}>
          <Stack spacing={2}>
            <SoftEligibilityConfigForm disabled={hasSession} onChange={setConfig} />
            <Button
              disabled={!isValidConfig || hasSession}
              variant="contained"
              onClick={handleCreateSession}
            >
              Create Soft Eligibility Session
            </Button>
            {!isValidConfig && <Alert severity="warning">Select at least 1 ServiceType</Alert>}
          </Stack>
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
