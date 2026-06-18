# Node demo (`@usebridge/sdk`)

Interactive CLI scripts demonstrating `@usebridge/sdk` without React.

## Setup

1. Copy `.env.example` to `.env` or `.env.local` and set your publishable key and service type IDs.
   Both files are supported; `.env.local` overrides `.env`. Missing files are fine.
   You can mirror values from `examples/react-demo/.env.local` (`NEXT_PUBLIC_*` → `BRIDGE_*`).
2. From the repo root: `yarn install`

## Scripts

| Command       | Description                  |
| ------------- | ---------------------------- |
| `yarn search` | Search payers by name        |
| `yarn soft`   | Run a soft eligibility check |
| `yarn hard`   | Run a hard eligibility check |

Run from this directory, or from the repo root:

```bash
yarn workspace node-demo soft
```

Prompts collect inputs interactively via [@inquirer/prompts](https://github.com/SBoudrias/Inquirer.js).
