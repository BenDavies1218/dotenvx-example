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

Create a `.env.development` file with your secrets and encrypt it with dotenvx:

```bash
npx @dotenvx/dotenvx set API_SECRET "my-secret" -f .env.development
```

This writes the encrypted value to `.env.development` and the private key to `.env.keys`. Commit `.env.development`, never commit `.env.keys`.

## Running

```bash
pnpm dev
```

envlock injects secrets from 1Password and decrypts your `.env.development` before starting the Next.js dev server. You'll see:

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
