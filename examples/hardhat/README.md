# envlock + Hardhat Example

Inject `PRIVATE_KEY` and `ALCHEMY_API_URL` at deploy time — keys never touch disk.

## Setup

1. Install deps: `npm install`
2. Encrypt your env: `npx dotenvx encrypt -f .env.development`
3. Store key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npx envlock-core compile   # compile contracts
npx envlock-core deploy    # deploy to sepolia
```

### Running ad-hoc commands

You can run any command with secrets injected — no config changes needed:

```bash
npx envlock-core run <your normal command>
```

For example:

```bash
# instead of: npx hardhat run scripts/deploy.js --network mainnet
npx envlock-core run npx hardhat run scripts/deploy.js --network mainnet

# with environment override
npx envlock-core run npx hardhat run scripts/deploy.js --network mainnet --staging
```
