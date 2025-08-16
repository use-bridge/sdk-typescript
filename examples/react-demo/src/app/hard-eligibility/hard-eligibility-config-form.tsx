import {
  type DateObject,
  type EstimateSelection,
  type HardEligibilitySessionConfig,
  type ServiceTypeMergeStrategy,
} from "@usebridge/sdk-core"
import { Alert, Button, Stack } from "@mui/material"
import { type FC, useCallback, useState } from "react"
import { ServiceTypePicker } from "../components/service-type-picker"
import { MergeStrategyPicker } from "../components/merge-strategy-picker"
import { DateObjectPicker } from "../components/date-object-picker"
import { EstimateSelectionPicker } from "../components/estimate-selection-picker"
import { getAvailableServiceTypeIds } from "../components/lib/get-available-service-type-ids"

interface HardEligibilityConfigFormProps {
  disabled: boolean
  onSubmit: (config: HardEligibilitySessionConfig) => void
}

/**
 * These values would typically be configured in the backend, or hardcoded
 * The `dateOfService` for a soft check is almost always the current date (which is parameter default)
 */
export const HardligibilityConfigForm: FC<HardEligibilityConfigFormProps> = ({
  disabled,
  onSubmit,
}) => {
  const [serviceTypeIds, setServiceTypeIds] = useState<string[]>(getAvailableServiceTypeIds())
  const [mergeStrategy, setMergeStrategy] = useState<ServiceTypeMergeStrategy>("UNION")
  const [dateOfService, setDateOfService] = useState<DateObject>()
  const [estimateSelection, setEstimateSelection] = useState<EstimateSelection>({ mode: "HIGHEST" })

  const isValidConfig = serviceTypeIds?.length ?? 0 > 0

  return (
    <Stack spacing={2}>
      <ServiceTypePicker onChange={setServiceTypeIds} disabled={disabled} />
      <MergeStrategyPicker onChange={setMergeStrategy} disabled={disabled} />
      <DateObjectPicker onChange={setDateOfService} disabled={disabled} />
      <EstimateSelectionPicker onChange={setEstimateSelection} disabled={disabled} />

      <Button
        disabled={disabled || !isValidConfig}
        variant="contained"
        onClick={useCallback(() => {
          if (!isValidConfig) throw new Error()
          onSubmit({ serviceTypeIds, mergeStrategy, dateOfService, estimateSelection })
        }, [serviceTypeIds, mergeStrategy, dateOfService, isValidConfig, onSubmit])}
      >
        Create Hard Eligibility Session
      </Button>
      {!isValidConfig && <Alert severity="warning">Select at least 1 ServiceType</Alert>}
    </Stack>
  )
}
