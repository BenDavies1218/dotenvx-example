# envlock + Hardhat Example

Inject `PRIVATE_KEY` and `ALCHEMY_API_URL` at deploy time — keys never touch disk.

## Prerequisites

- Node.js 18+

## Run

```bash
npm install
npx envlock-core compile   # compile contracts
npx envlock-core deploy    # deploy to sepolia
```

### Running ad-hoc commands

```bash
npx envlock-core run <command>
```

For example:

```bash
# deploy to a different network
npx envlock-core run npx hardhat run scripts/deploy.js --network mainnet

# use staging secrets
npx envlock-core run npx hardhat run scripts/deploy.js --network mainnet --staging
```

## Setting Up From Scratch

If you're adapting this for your own project:

1. Install dependencies: `npm install`
2. Encrypt your `.env.development`: `npx dotenvx encrypt -f .env.development`
3. Store the generated `DOTENV_PRIVATE_KEY_DEVELOPMENT` in a 1Password Environment
4. Set `onePasswordEnvId` in `envlock.config.js`
