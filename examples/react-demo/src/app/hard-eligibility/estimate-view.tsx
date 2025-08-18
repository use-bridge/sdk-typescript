import { useHardEligibilityState } from "@usebridge/sdk-react"
import { Stack, Typography } from "@mui/material"
import type { PatientResponsibility } from "@usebridge/sdk-core"
import type { FC } from "react"

const EstimateBreakdown: FC<{ estimate: PatientResponsibility }> = ({ estimate }) => {
  const {
    copayment,
    oopCopayment,
    coinsurance,
    oopCoinsurance,
    coinsurancePercent,
    deductible,
    oopDeductible,
    total,
    fallback,
  } = estimate

  const usd = (cents: number) =>
    Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100)

  return (
    <Stack>
      {copayment ? <Typography variant="body2">{usd(copayment)} copayment</Typography> : null}
      {oopCopayment ? (
        <Typography variant="body2">{usd(oopCopayment)} copayment waived for OOP limits</Typography>
      ) : null}
      {coinsurance ? (
        <Typography variant="body2">
          {usd(coinsurance)} coinsurance ({`${Math.round(coinsurancePercent * 100)}%`}%)
        </Typography>
      ) : null}
      {oopCoinsurance ? (
        <Typography variant="body2">
          {usd(oopCoinsurance)} coinsurance waived for OOP limits
        </Typography>
      ) : null}
      {deductible ? <Typography variant="body2">{usd(deductible)} deductible</Typography> : null}
      {oopDeductible ? (
        <Typography variant="body2">
          {usd(oopDeductible)} deductible waived for OOP limits
        </Typography>
      ) : null}
      {fallback ? (
        <Typography variant="body2">{usd(fallback)} fallback (unknown)</Typography>
      ) : null}
      <Typography>Total = {usd(total)}</Typography>
    </Stack>
  )
}

/**
 * Shows the estimated patient responsibility
 */
export const EstimateView = () => {
  const { patientResponsibility } = useHardEligibilityState()
  if (!patientResponsibility) return

  // We're always getting an 'estimate'
  const { estimate, conditionalEstimate } = patientResponsibility

  // If we have a 'conditionalEstimate', we can lean on that
  const conditional = conditionalEstimate?.patientResponsibility

  return (
    <Stack spacing={4}>
      {conditional && (
        <Stack>
          <Typography variant="h6">Conditional Estimate</Typography>
          <EstimateBreakdown estimate={conditional} />
        </Stack>
      )}
      <Stack>
        <Typography variant="h6">Estimate</Typography>
        <EstimateBreakdown estimate={estimate} />
      </Stack>
    </Stack>
  )
}
