import { Checkbox, FormControlLabel, FormGroup, Stack, Typography } from "@mui/material"
import { useEffect, useState } from "react"
import { getAvailableServiceTypeIds } from "./lib/get-available-service-type-ids"

interface ServiceTypePickerProps {
  onChange: (serviceTypeIds: string[]) => void
  disabled?: boolean
}

export const ServiceTypePicker = ({ disabled, onChange }: ServiceTypePickerProps) => {
  const serviceTypeIds = getAvailableServiceTypeIds()
  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState<string[]>(serviceTypeIds)

  useEffect(() => {
    onChange(selectedServiceTypeIds)
  }, [onChange, selectedServiceTypeIds])

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
