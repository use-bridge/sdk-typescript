# Bridge TypeScript SDK

## Documentation

- [React SDK Guide](https://docs.usebridge.com/documentation/getting-started/react-sdk)
- [Bridge API Documentation](https://docs.usebridge.com)
- [Bridge TypeScript API Client](https://github.com/use-bridge/api-typescript)

## Packages

### [`@usebridge/sdk-react`](https://www.npmjs.com/package/@usebridge/sdk-react)

The headless React SDK to drive patient eligibility.
Hooks allow you to focus on building your UX/UI, rather than the complexity of eligibility input and API calls.

### [`@usebridge/sdk-core`](https://www.npmjs.com/package/@usebridge/sdk-core)

TypeScript SDK, browser and node-compatible, for managing eligibility checks.
Provides an abstraction over the eligibility API's.

_If using React, do not use this directly._

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
