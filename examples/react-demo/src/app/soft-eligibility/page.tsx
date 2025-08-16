"use client"

import { useState } from "react"
import { PageHeader } from "../components/page-header"
import { Alert, Button, Grid, Stack } from "@mui/material"
import { ServiceTypePicker } from "../components/service-type-picker"
import {
  type DateObject,
  type ServiceTypeMergeStrategy,
  SoftEligibilitySession,
} from "@usebridge/sdk-core"
import { MergeStrategyPicker } from "../components/merge-strategy-picker"
import { DateObjectPicker } from "../components/date-object-picker"
import { SoftEligibilityProvider, useBridgeSdk } from "@usebridge/sdk-react"
import { SoftEligibilitySessionExample } from "./soft-eligibility-session-example"
import { SoftEligibilityEligibleProviderList } from "./soft-eligibility-providers"

export default function SoftEligibilityPage() {
  const bridgeSdk = useBridgeSdk()
  const [serviceTypeIds, setServiceTypeIds] = useState<string[]>()
  const [mergeStrategy, setMergeStrategy] = useState<ServiceTypeMergeStrategy>()
  const [dateOfService, setDateOfService] = useState<DateObject>()
  const [session, setSession] = useState<SoftEligibilitySession>()

  const hasSession = Boolean(session)
  const isReady =
    serviceTypeIds && mergeStrategy && dateOfService && Boolean(serviceTypeIds?.length)

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
            <ServiceTypePicker onChanged={setServiceTypeIds} disabled={hasSession} />
            <MergeStrategyPicker onChanged={setMergeStrategy} disabled={hasSession} />
            <DateObjectPicker onChanged={setDateOfService} disabled={hasSession} />
            {!isReady && <Alert severity="warning">Select at least 1 ServiceType</Alert>}
            {isReady && !hasSession && (
              <Button
                variant="contained"
                onClick={() =>
                  setSession(
                    bridgeSdk.createSoftEligibilitySession({
                      serviceTypeIds,
                      mergeStrategy,
                      dateOfService,
                    }),
                  )
                }
              >
                Create Soft Eligibility Session
              </Button>
            )}
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
