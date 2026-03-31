# envlock + Hardhat Example

Inject `PRIVATE_KEY` and `ALCHEMY_API_URL` at deploy time — keys never touch disk.

## Prerequisites

- Node.js 18+

## Run

```bash
npm install
npm run compile   # compile contracts
npm run deploy    # deploy to Sepolia
```

| Flag           | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| _(none)_       | Uses `.env.development` (default)                                    |
| `--staging`    | Uses `.env.staging` and injects staging secrets from 1Password       |
| `--production` | Uses `.env.production` and injects production secrets from 1Password |

To pass flags via npm scripts:

```bash
npm run deploy -- --production   # deploy with production secrets
```

## Setting Up From Scratch

1. Install dependencies: `npm install`
2. Encrypt your `.env.development`: `npx @dotenvx/dotenvx encrypt -f .env.development`
3. Store the generated `DOTENV_PRIVATE_KEY_DEVELOPMENT` in a 1Password Environment
4. Set `onePasswordEnvId` in `envlock.config.js`:

```js
export default {
  onePasswordEnvId: "your-1password-environment-id",
  commands: {
    compile: "npx hardhat compile",
    deploy: "npx hardhat run scripts/deploy.js --network sepolia",
  },
};
```
