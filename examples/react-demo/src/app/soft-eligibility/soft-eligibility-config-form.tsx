import {
  type DateObject,
  type ServiceTypeMergeStrategy,
  type SoftEligibilitySessionConfig,
} from "@usebridge/sdk-core"
import { Stack } from "@mui/material"
import { ServiceTypePicker } from "../components/service-type-picker"
import { MergeStrategyPicker } from "../components/merge-strategy-picker"
import { DateObjectPicker } from "../components/date-object-picker"
import { type FC, useEffect, useState } from "react"

interface SoftEligibilityConfigFormProps {
  disabled: boolean
  onChange: (config: SoftEligibilitySessionConfig) => void
}

export const SoftEligibilityConfigForm: FC<SoftEligibilityConfigFormProps> = ({
  disabled,
  onChange,
}) => {
  const [serviceTypeIds, setServiceTypeIds] = useState<string[]>([])
  const [mergeStrategy, setMergeStrategy] = useState<ServiceTypeMergeStrategy>("UNION")
  const [dateOfService, setDateOfService] = useState<DateObject>()

  useEffect(() => {
    onChange({ serviceTypeIds, mergeStrategy, dateOfService })
  }, [serviceTypeIds, mergeStrategy, dateOfService, onChange])

  return (
    <Stack spacing={2}>
      <ServiceTypePicker onChange={setServiceTypeIds} disabled={disabled} />
      <MergeStrategyPicker onChange={setMergeStrategy} disabled={disabled} />
      <DateObjectPicker onChange={setDateOfService} disabled={disabled} />
    </Stack>
  )
}
