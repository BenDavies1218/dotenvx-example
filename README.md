# dotenvx Example

A [T3 Stack](https://create.t3.gg/) project with encrypted multi-environment configuration using [dotenvx](https://dotenvx.com/) and [1Password CLI](https://developer.1password.com/docs/cli/).

## How It Works

This repo keeps **encrypted** `.env` files committed to git — one per environment. **No plaintext secrets exist on disk or in the repository.** This means secrets cannot be accidentally leaked through git history, code review tools, AI context windows, or any process that reads local files. Decryption only happens in memory at runtime. Two tools work together to make this possible:

1. **dotenvx** encrypts and decrypts `.env` files using public/private key pairs. The encrypted files (`.env.development`, `.env.staging`, `.env.production`) are safe to commit. The private decryption keys live in `.env.keys`, which is **gitignored**.
2. **1Password CLI (`op`)** stores the decryption keys so no engineer needs a local `.env.keys` file. The wrapper script `scripts/env.sh` fetches keys from 1Password at runtime and passes them to dotenvx.

### Data Flow

```
1Password Vault
  └─ Environment (holds DOTENV_PRIVATE_KEY_*)
       │
       ▼
scripts/env.sh
  ├─ op run  →  injects DOTENV_PRIVATE_KEY_* into process env
  └─ dotenvx run -f .env.<env>  →  decrypts the env file in memory
       │
       ▼
  next dev / next build / next start
       │
       ▼
  src/env.js  →  Zod validates all variables at boot
```

### Key Files

| File | Purpose | Committed? |
|------|---------|------------|
| `.env.development` | Encrypted dev variables | Yes |
| `.env.staging` | Encrypted staging variables | Yes |
| `.env.production` | Encrypted production variables | Yes |
| `src/env.js` | Zod schema — validates all env vars at build/boot | Yes |
| `scripts/env.sh` | Wrapper that fetches keys from 1Password and runs the command | Yes |

### Environment Variables

The app currently expects:

| Variable | Scope | Description |
|----------|-------|-------------|
| `NODE_ENV` | Server | `development`, `staging`, or `production` |
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `API_SECRET` | Server | Secret key for API authentication |
| `NEXT_PUBLIC_APP_URL` | Client | Public-facing app URL |

These are defined and validated in `src/env.js`. Any missing or invalid variable will fail the build.

## Local Setup

### Prerequisites

```bash
brew install node                          # Node.js 20+
corepack enable                            # enables pnpm
brew install --cask 1password-cli@beta      # 1Password CLI (beta)
```

Verify everything is installed:

```bash
node -v        # 20+
pnpm -v        # 10+
op --version   # 2.33.0-beta.02+
```

### Step 1 — Install dependencies

```bash
pnpm install
```

### Step 2 — Sign in to 1Password CLI

```bash
op signin
```

If you have the 1Password desktop app running with biometric unlock enabled, the CLI will authenticate through it automatically.

### Step 3 — Get access to the 1Password Environment

Ask a team member to share the 1Password Environment that contains the dotenvx decryption keys. You need the **Environment ID** — it is already set in `scripts/env.sh`, so if you have access to the vault, you are good to go.

> The Environment ID is `ca6uypwvab5mevel44gqdc2zae` (set in `scripts/env.sh`). If your team uses a different vault, update this value.

### Step 4 — Run the app

```bash
# Development (default)
pnpm dev

# Or call the script directly
./scripts/env.sh next dev --turbo
```

The `pnpm dev` script already uses `scripts/env.sh` under the hood. 1Password will prompt for biometric authentication on the first run.

### Running Against Other Environments

```bash
./scripts/env.sh --staging next dev         # staging variables
./scripts/env.sh --production next build    # production build
./scripts/env.sh --production next start    # production start
```

## Local Run and Test Checklist

Use this to verify everything is wired up correctly.

### 1. Verify CLI tools are installed

```bash
op --version          # should print 2.33.0-beta.02+
dotenvx --version     # installed via pnpm as a devDependency — use: pnpm dotenvx --version
```

### 2. Verify 1Password access

```bash
op run --environment ca6uypwvab5mevel44gqdc2zae
```

You should see `DOTENV_PRIVATE_KEY_DEVELOPMENT`, `DOTENV_PRIVATE_KEY_STAGING`, and `DOTENV_PRIVATE_KEY_PRODUCTION` printed (values redacted is fine — just confirm they exist).

### 4. Start the dev server

```bash
pnpm dev
```

The app should start on `http://localhost:3000` with no env validation errors. If `src/env.js` validation fails, you will see a clear error listing which variables are missing or invalid.

### 5. Verify the build works

```bash
./scripts/env.sh next build
```

A successful build confirms all server and client env vars are present and valid.
