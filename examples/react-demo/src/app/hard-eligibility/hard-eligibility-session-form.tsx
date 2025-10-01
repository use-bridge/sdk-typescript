import {
  useEligibilityInputField,
  useHardEligibilityState,
  useHardEligibilitySubmit,
} from "@usebridge/sdk-react"
import { Button, Stack, TextField, Typography } from "@mui/material"
import { PayerAutocompleteField } from "../components/payer-autocomplete-field"
import { StatePicker } from "../components/state-picker"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import dayjs, { Dayjs } from "dayjs"

/**
 * User input for the Hard Eligibility request, submits
 */
export const HardEligibilitySessionForm = () => {
  const { status } = useHardEligibilityState()

  const firstName = useEligibilityInputField("firstName")
  const lastName = useEligibilityInputField("lastName")
  const dateOfBirth = useEligibilityInputField("dateOfBirth")
  const memberId = useEligibilityInputField("memberId")

  const { isDisabled, submit } = useHardEligibilitySubmit()

  return (
    <Stack spacing={2}>
      <Stack>
        <Typography variant="h6">HardEligibilitySession</Typography>
        <Typography fontFamily="monospace">{status}</Typography>
      </Stack>

      <PayerAutocompleteField />
      <StatePicker />
      <TextField
        disabled={firstName.isDisabled}
        label="First Name"
        value={firstName.value}
        onChange={(e) => firstName.setValue(e.target.value)}
      />
      <TextField
        disabled={lastName.isDisabled}
        label="Last Name"
        value={lastName.value}
        onChange={(e) => lastName.setValue(e.target.value)}
      />
      <DatePicker
        disabled={dateOfBirth.isDisabled}
        value={dayjs(dateOfBirth.value)}
        onChange={(newValue: Dayjs | null) => {
          if (newValue) dateOfBirth.setValue(newValue.toDate())
        }}
        slotProps={{ textField: { size: "medium", label: "Date of Birth", error: false } }}
      />
      {memberId.isVisible && (
        <TextField
          disabled={memberId.isDisabled}
          label={`Member ID ${memberId.isRequired ? "(Required)" : "(Optional)"}`}
          value={memberId.value}
          onChange={(e) => memberId.setValue(e.target.value)}
        />
      )}

      <Button disabled={isDisabled} variant="contained" onClick={submit}>
        Submit Hard Eligibility
      </Button>
    </Stack>
  )
}
