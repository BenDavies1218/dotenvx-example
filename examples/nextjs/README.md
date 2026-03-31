# Next.js + envlock

This example shows how to use [envlock-next](https://github.com/BenDavies1218/envlock) to inject secrets from 1Password into a Next.js app via dotenvx.

## Setup

### 1. Create a new Next.js app

```bash
npx create-next-app@latest my-app
cd my-app
```

### 2. Install envlock-next

```bash
pnpm add envlock-next
```

The postinstall script automatically rewrites your `package.json` scripts:

```json
"scripts": {
  "dev": "envlock dev",
  "build": "envlock build",
  "start": "envlock start"
}
```

### 3. Update `next.config.ts`

```ts
import { withEnvlock } from "envlock-next";

export default withEnvlock(
  {
    // your existing Next.js config
  },
  {
    onePasswordEnvId: "your-1password-environment-id",
  },
);
```

Your 1Password Environment ID can be found in the 1Password dashboard under **Secrets Automation → Environments**.

### 4. Add encrypted env files

Create a `.env.development` file with your secrets:

```bash
# Write a value directly (creates the file and encrypts in one step)
npx @dotenvx/dotenvx set API_SECRET "my-secret" -f .env.development

# Or encrypt an existing .env.development in place
npx @dotenvx/dotenvx encrypt -f .env.development
```

This writes encrypted values to `.env.development` and the private key to `.env.keys`. Commit `.env.development`, never commit `.env.keys`.

#### `dotenvx encrypt` options

| Flag | Description |
| ---- | ----------- |
| `-f, --env-file <paths...>` | Path(s) to your env file(s) to encrypt (default: `.env`) |
| `-fk, --env-keys-file <path>` | Path to your `.env.keys` file (default: same directory as env file) |
| `-k, --key <keys...>` | Only encrypt specific key(s) (default: all keys) |
| `-ek, --exclude-key <keys...>` | Exclude specific key(s) from encryption |
| `--no-create` | Do not create the env file if it doesn't exist |
| `--stdout` | Print the encrypted output to stdout instead of writing the file |
| `-l, --log-level <level>` | Set log level (`error`, `warn`, `info`, `verbose`, `debug`) |
| `-q, --quiet` | Suppress all output except errors |
| `-v, --verbose` | Verbose output |
| `-d, --debug` | Debug output |

Examples:

```bash
# Encrypt a specific file
npx @dotenvx/dotenvx encrypt -f .env.development

# Encrypt multiple files at once
npx @dotenvx/dotenvx encrypt -f .env.development -f .env.production

# Only encrypt a specific key
npx @dotenvx/dotenvx encrypt -f .env.development -k API_SECRET

# Encrypt everything except a key
npx @dotenvx/dotenvx encrypt -f .env.development -ek PUBLIC_URL

# Use a custom .env.keys path
npx @dotenvx/dotenvx encrypt -f .env.development -fk /secrets/.env.keys

# Print encrypted result without writing the file
npx @dotenvx/dotenvx encrypt -f .env.development --stdout
```

## Running

| Flag | Description |
| ---- | ----------- |
| *(none)* | Uses `.env.development` (default) |
| `--staging` | Uses `.env.staging` and injects staging secrets from 1Password |
| `--production` | Uses `.env.production` and injects production secrets from 1Password |

```bash
pnpm dev                    # uses .env.development (default)
pnpm dev -- --staging       # uses .env.staging
pnpm dev -- --production    # uses .env.production

pnpm build                  # uses .env.development
pnpm build -- --staging
pnpm build -- --production

pnpm start -- --production  # uses .env.production
```

envlock injects secrets from 1Password and decrypts the appropriate `.env.*` file before starting Next.js. You'll see:

```text
⟐ injecting env (4) from .env.development · dotenvx@x.x.x
▲ Next.js x.x.x (Turbopack)
- Local: http://localhost:3000
```

> **Note:** `DOTENV_PRIVATE_KEY_DEVELOPMENT: '<concealed by 1Password>'` — the private key used to decrypt your `.env.development` file is stored in 1Password and injected at runtime. It is never stored in plaintext on disk.

## How it works

1. `envlock dev` reads `next.config.ts` to find your 1Password Environment ID
2. It calls `op run` to fetch secrets from 1Password (including `DOTENV_PRIVATE_KEY_DEVELOPMENT`)
3. It calls `dotenvx run` to decrypt `.env.development` using the injected private key
4. `next dev` starts with all secrets available in `process.env`
