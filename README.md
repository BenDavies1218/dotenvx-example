# envlock

Secure secret injection for any language — encrypted `.env` files + 1Password, zero secrets on disk.

## What is envlock?

**envlock** combines [dotenvx](https://dotenvx.com/) encrypted `.env` files with [1Password CLI](https://developer.1password.com/docs/cli/) to inject secrets into any process at runtime. Nothing is ever written to the filesystem in plaintext.

How it works:

![envlock_runtime_flow](envlock_runtime_flow.svg)

## Why

AI coding tools like Copilot and Cursor have broad filesystem access by default. Malicious npm packages exploit this too — supply chain attacks increasingly target local credential files. If your secrets live in a plain `.env` file, they're one compromised dependency or one AI prompt away from being exfiltrated.

Plain `.env` files also get committed accidentally, shared over Slack, and copied onto every developer's laptop with no audit trail.

`envlock` removes the file entirely. Secrets only exist in memory, for the lifetime of the process that needs them.

## This Repo

| Directory                        | What it is                                   |
| -------------------------------- | -------------------------------------------- |
| [`apps/website/`](apps/website/) | Static showcase site (Vite + React)          |
| [`examples/`](examples/)         | Fully runnable minimal examples per language |

## Documentation

[Read more](https://bendavies1218.github.io/envlock-examples/)

## Examples

Each example is a self-contained minimal app showing how to use envlock with a specific language or framework.

| Example                                  | Language / Framework   |
| ---------------------------------------- | ---------------------- |
| [`examples/nextjs/`](examples/nextjs/)   | Next.js (envlock-next) |
| [`examples/node/`](examples/node/)       | Node.js (Express)      |
| [`examples/python/`](examples/python/)   | Python (Flask)         |
| [`examples/go/`](examples/go/)           | Go (net/http)          |
| [`examples/rust/`](examples/rust/)       | Rust (Axum)            |
| [`examples/ruby/`](examples/ruby/)       | Ruby (Sinatra)         |
| [`examples/java/`](examples/java/)       | Java (Spring Boot)     |
| [`examples/php/`](examples/php/)         | PHP                    |
| [`examples/dotnet/`](examples/dotnet/)   | .NET (ASP.NET Core)    |
| [`examples/hardhat/`](examples/hardhat/) | Hardhat (Ethereum)     |

Every example follows the same pattern — see any `examples/<lang>/README.md` for setup steps.

## Prerequisites

All examples require:

- **Node.js 18+**
- **1Password CLI** — for storing decryption keys (`brew install --cask 1password-cli@beta`)
- **1Password desktop app** — with CLI integration enabled (**Settings → Developer → Integrate with 1Password CLI**)

![1Password CLI setting](./onePassCli.png)

### Sign in

```bash
op signin
```

With biometric unlock enabled, the CLI authenticates automatically. You can adjust the auto-lock interval so you only need to unlock once per day.

![Auto-lock setting](./autolock_setting.png)

## Quick Setup for Any Language

```bash
# 1. Create an envlock.config.js in your project root
# 2. Encrypt your .env file
npx @dotenvx/dotenvx encrypt -f .env.development

# 3. Store DOTENV_PRIVATE_KEY_DEVELOPMENT in a 1Password Environment
#    and copy the environment ID into envlock.config.js

# 4. Run
npx envlock-core dev
```

Example `envlock.config.js`:

```js
export default {
  onePasswordEnvId: "your-1password-environment-id",
  commands: {
    dev: "node server.js",
  },
};
```

## Next.js Plugin

For Next.js, use `envlock-next` — a native plugin that integrates directly with `next.config.ts`:

```bash
pnpm add envlock-next
```

The postinstall script automatically rewrites your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "envlock dev",
    "build": "envlock build",
    "start": "envlock start"
  }
}
```

Then wrap your config:

```ts
// next.config.ts
import { withEnvlock } from "envlock-next";

export default withEnvlock(
  {},
  {
    onePasswordEnvId: "your-1password-environment-id",
  },
);
```

See [`examples/nextjs/`](examples/nextjs/) for a full working example.

## Deploying to Vercel

Vercel's build environment doesn't have 1Password CLI, so envlock falls back to its CI mode — you provide the decryption key directly as an environment variable and it skips 1Password automatically.

### 1. Create and encrypt a production env file

```bash
npx @dotenvx/dotenvx set API_SECRET "my-secret" -f .env.production
```

Commit `.env.production` (encrypted values are safe to commit). Never commit `.env.keys`.

### 2. Add the private key to Vercel

In your Vercel project go to **Settings → Environment Variables** and add:

| Name | Value | Environment |
| ---- | ----- | ----------- |
| `DOTENV_PRIVATE_KEY_PRODUCTION` | *(value from `.env.keys`)* | Production |

### 3. Deploy

Push your code. During the Vercel build, envlock detects `DOTENV_PRIVATE_KEY_PRODUCTION` is already set and decrypts `.env.production` without calling 1Password.

```text
⟐ injecting env (4) from .env.production · dotenvx@x.x.x
▲ Next.js x.x.x
```

> The encrypted `.env.production` file is safe to commit — without the private key it is unreadable.

## Benefits

- **No plaintext secrets on disk** — encrypted values are safe to commit
- **No `.env.keys` file** — decryption keys live in 1Password only
- **In-memory decryption** — secrets are never written to the filesystem
- **Works with any runtime** — Node, Python, Go, Rust, Ruby, Java, PHP, .NET, and more
- **CI-friendly** — set `DOTENV_PRIVATE_KEY_*` directly and envlock skips 1Password automatically
