# envlock + Node.js Example

Minimal Express server with secrets injected by envlock.

## Setup

1. Install dependencies: `npm install`
2. Encrypt your `.env.development`: `npx dotenvx encrypt -f .env.development`
3. Store the generated key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npm run dev
# or
npx envlock-core dev
```

### Running ad-hoc commands

You can run any command with secrets injected — no config changes needed:

```bash
npx envlock-core run <your normal command>
```

For example:

```bash
# instead of: node server.js
npx envlock-core run node server.js --port 4000

# with environment override
npx envlock-core run node server.js --staging
```
