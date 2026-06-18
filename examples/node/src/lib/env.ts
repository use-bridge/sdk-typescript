import "./load-env.js"
import { cleanEnv, str } from "envalid"

export const env = cleanEnv(process.env, {
  BRIDGE_PUBLISHABLE_KEY: str({
    desc: "Bridge publishable API key (pk_...)",
  }),
  BRIDGE_ENVIRONMENT: str({
    desc: "Bridge environment: production or sandbox",
    default: "sandbox",
  }),
  BRIDGE_SERVICE_TYPES: str({
    desc: "Comma-separated default service type IDs",
    default: "svt_demo_1,svt_demo_2",
  }),
})

export function getDefaultServiceTypeIds(): string[] {
  return env.BRIDGE_SERVICE_TYPES.split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}
