# envlock + Hardhat Example

Inject `PRIVATE_KEY` and `ALCHEMY_API_URL` at deploy time — keys never touch disk.

## Setup

1. Install deps: `npm install`
2. Encrypt your env: `npx dotenvx encrypt -f .env.development`
3. Store key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npx envlock compile   # compile contracts
npx envlock deploy    # deploy to sepolia
```
