import { Alert, Checkbox, FormControlLabel, FormGroup, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"

interface ServiceTypePickerProps {
  onChanged: (serviceTypeIds: string[]) => void
  disabled?: boolean
}

export const ServiceTypePicker = ({ disabled, onChanged }: ServiceTypePickerProps) => {
  const config = process.env.NEXT_PUBLIC_BRIDGE_SERVICE_TYPES
  const serviceTypeIds = config?.split(",") ?? []
  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState<string[]>([])

  useEffect(() => {
    onChanged(selectedServiceTypeIds)
  }, [onChanged, selectedServiceTypeIds])

  if (!config) {
    return (
      <Alert severity="error">
        <Typography>Missing environment variable</Typography>
        <Typography fontFamily="monospace">NEXT_PUBLIC_BRIDGE_SERVICE_TYPES</Typography>
        <Typography>
          Set to a comma-separated list of ServiceType ID's ("svt_xxx,svt_yyy")
        </Typography>
      </Alert>
    )
  }

  return (
    <Stack>
      <Typography variant="h6">Service Types</Typography>
      <FormGroup>
        {serviceTypeIds.map((serviceTypeId) => (
          <FormControlLabel
            key={serviceTypeId}
            control={
              <Checkbox
                disabled={disabled}
                checked={selectedServiceTypeIds.includes(serviceTypeId)}
                onChange={(e) =>
                  setSelectedServiceTypeIds((prev) =>
                    prev
                      .filter((id) => id !== serviceTypeId)
                      .concat(e.target.checked ? serviceTypeId : []),
                  )
                }
              />
            }
            label={serviceTypeId}
          />
        ))}
      </FormGroup>
    </Stack>
  )

  return <pre>SVT</pre>
}
