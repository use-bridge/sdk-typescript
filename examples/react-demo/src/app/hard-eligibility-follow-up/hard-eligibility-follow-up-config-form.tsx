import {
  type DateObject,
  type EstimateSelection,
  type HardEligibilitySessionConfig,
  type ServiceTypeMergeStrategy,
} from "@usebridge/sdk-core"
import { Alert, Button, Stack, TextField } from "@mui/material"
import { type FC, useCallback, useState } from "react"
import { ServiceTypePicker } from "../components/service-type-picker"
import { MergeStrategyPicker } from "../components/merge-strategy-picker"
import { DateObjectPicker } from "../components/date-object-picker"
import { EstimateSelectionPicker } from "../components/estimate-selection-picker"
import { getAvailableServiceTypeIds } from "../components/lib/get-available-service-type-ids"

interface HardEligibilityFollowUpConfigFormProps {
  disabled: boolean
  onSubmit: (config: HardEligibilitySessionConfig) => void
}

export const HardEligibilityFollowUpConfigForm: FC<HardEligibilityFollowUpConfigFormProps> = ({
  disabled,
  onSubmit,
}) => {
  const [serviceTypeIds, setServiceTypeIds] = useState<string[]>(getAvailableServiceTypeIds())
  const [mergeStrategy, setMergeStrategy] = useState<ServiceTypeMergeStrategy>("UNION")
  const [dateOfService, setDateOfService] = useState<DateObject>()
  const [estimateSelection, setEstimateSelection] = useState<EstimateSelection>({
    mode: "HIGHEST",
  })
  const [policyId, setPolicyId] = useState("")

  const isValidConfig = serviceTypeIds?.length > 0 && policyId.trim() !== ""

  return (
    <Stack spacing={2}>
      <ServiceTypePicker onChange={setServiceTypeIds} disabled={disabled} />
      <MergeStrategyPicker onChange={setMergeStrategy} disabled={disabled} />
      <DateObjectPicker onChange={setDateOfService} disabled={disabled} />
      <EstimateSelectionPicker onChange={setEstimateSelection} disabled={disabled} />
      <TextField
        disabled={disabled}
        label="Policy ID"
        value={policyId}
        onChange={(e) => setPolicyId(e.target.value)}
        required
      />

      <Button
        disabled={disabled || !isValidConfig}
        variant="contained"
        onClick={useCallback(() => {
          if (!isValidConfig) throw new Error()
          onSubmit({
            serviceTypeIds,
            mergeStrategy,
            dateOfService,
            estimateSelection,
            policyId: policyId.trim(),
          })
        }, [serviceTypeIds, mergeStrategy, dateOfService, estimateSelection, policyId, isValidConfig, onSubmit])}
      >
        Create Hard Eligibility Session
      </Button>
      {!isValidConfig && (
        <Alert severity="warning">
          {serviceTypeIds?.length === 0
            ? "Select at least 1 ServiceType"
            : "Policy ID is required"}
        </Alert>
      )}
    </Stack>
  )
}

