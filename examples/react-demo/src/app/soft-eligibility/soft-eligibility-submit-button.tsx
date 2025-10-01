import { Button } from "@mui/material"
import { useSoftEligibilitySubmit } from "@usebridge/sdk-react"

/**
 * Button that enables/disables as the form and state become valid
 * Pressing the button submits the request
 */
export const SoftEligibilitySubmitButton = () => {
  const { isDisabled, submit } = useSoftEligibilitySubmit()

  return (
    <Button disabled={isDisabled} variant="contained" onClick={() => void submit()}>
      Submit Soft Eligibility
    </Button>
  )
}
