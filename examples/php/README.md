# envlock + PHP Example

Minimal PHP app with secrets injected by envlock.

## Setup

1. Install envlock: `npm install -g envlock-core`
2. Encrypt your env: `npx dotenvx encrypt -f .env.development`
3. Store key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npx envlock-core dev
```

### Running ad-hoc commands

You can run any command with secrets injected — no config changes needed:

```bash
npx envlock-core run <your normal command>
```

For example:

```bash
# instead of: php -S localhost:8080
npx envlock-core run php -S localhost:8080

# with environment override
npx envlock-core run php -S localhost:8080 --staging
```
