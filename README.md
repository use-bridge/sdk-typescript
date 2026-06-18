# Bridge TypeScript SDK

## Documentation

- [Eligibility SDK Guide](https://docs.usebridge.com/documentation/getting-started/eligibility-sdk)
- [Bridge API Documentation](https://docs.usebridge.com)
- [Bridge TypeScript API Client](https://github.com/use-bridge/api-typescript)

## Packages

### [`@usebridge/sdk`](https://www.npmjs.com/package/@usebridge/sdk)

The default Bridge SDK for non-React environments — API routes, workers, scripts, and vanilla JS clients.
Call `softEligibility()` or `hardEligibility()` with complete inputs and receive the final result.

### [`@usebridge/sdk-react`](https://www.npmjs.com/package/@usebridge/sdk-react)

The headless React SDK to drive patient eligibility.
Hooks allow you to focus on building your UX/UI, rather than the complexity of eligibility input and API calls.

### [`@usebridge/sdk-core`](https://www.npmjs.com/package/@usebridge/sdk-core)

Low-level, framework-agnostic SDK for managing eligibility checks.
Use when you need raw session control, EventEmitter lifecycle, or other advanced behavior.

| Use case                            | Package                |
| ----------------------------------- | ---------------------- |
| React app                           | `@usebridge/sdk-react` |
| Server, script, or non-React client | `@usebridge/sdk`       |
| Raw session control / EventEmitter  | `@usebridge/sdk-core`  |

## Usage (`@usebridge/sdk`)

```typescript
import { createBridgeClient } from "@usebridge/sdk"
import type { BridgeSdkConfig } from "@usebridge/sdk-core"

const bridge = createBridgeClient({
  publishableKey: "pk_...",
  environment: "sandbox",
} satisfies BridgeSdkConfig)

const result = await bridge.softEligibility({
  serviceTypeIds: ["svt_..."],
  payerId: "pyr_...",
  state: "CA",
})
```

## Analytics Events

The SDK emits analytics events throughout the eligibility flow. To receive these events, implement the `AnalyticsHandler` interface and pass it to the SDK constructor:

```typescript
import { BridgeSdk } from "@usebridge/sdk-core"
import type { AnalyticsHandler, AnalyticsEvent, AnalyticsEventName } from "@usebridge/sdk-core"

const myAnalyticsHandler: AnalyticsHandler = {
  onEvent<T extends AnalyticsEventName>(event: T, data: AnalyticsEvent<T>) {
    // Send to your analytics service
    console.log(event, data)
  },
  onError(error: Error) {
    // Handle fatal errors
    console.error(error)
  },
}

const sdk = new BridgeSdk({
  publishableKey: "pk_...",
  analyticsHandler: myAnalyticsHandler,
})
```

### Event Types

**SDK Lifecycle**

- `sdk.initialized`
- `sdk.error`

**Input Events**

- `input.payer.search`
- `input.state.updated`

**Soft Eligibility**

- `soft_eligibility.session.created`
- `soft_eligibility.session.submit`
- `soft_eligibility.session.updated`
- `soft_eligibility.session.complete.eligible`
- `soft_eligibility.session.complete.ineligible`

**Hard Eligibility**

- `hard_eligibility.session.created`
- `hard_eligibility.session.submit`
- `hard_eligibility.session.updated`
- `hard_eligibility.session.complete.eligible`
- `hard_eligibility.session.complete.ineligible`
- `hard_eligibility.session.complete.out_of_network`
- `hard_eligibility.session.optimistic_soft_check.error`
- `hard_eligibility.session.policy`
