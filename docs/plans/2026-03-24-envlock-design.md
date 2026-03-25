# envlock Design

**Date:** 2026-03-24

## Problem

Wiring 1Password CLI + dotenvx for encrypted environment variables requires a bash script (`scripts/env.sh`) that must be copied and configured for each new project. This creates onboarding friction and leaves shell scripting in an otherwise JS/TS codebase.

## Solution

`envlock` — an NPM package that packages the 1Password + dotenvx pattern as an installable dependency with a CLI binary and Next.js plugin.

## Architecture

### CLI Binary (`envlock`)

Replaces `scripts/env.sh`. Reads the 1Password Environment ID from `next.config.js` (via `jiti` dynamic import), then runs:

```
op run --environment <envId> -- dotenvx run -f <envFile> -- next <subcommand> [...args]
```

Usage:
```sh
envlock dev [--staging|--production] [...nextjs-flags]
envlock build [--staging|--production]
envlock start [--staging|--production]
```

### Next.js Plugin (`withEnvlock`)

Attaches the envlock config to the Next.js config object so the CLI can read it:

```js
// next.config.js
import { withEnvlock } from 'envlock/next';
import './src/env.js';

export default withEnvlock({}, {
  onePasswordEnvId: 'ca6uypwvab5mevel44gqdc2zae',
});
```

### `createEnv` Wrapper (`envlock/env`)

Thin wrapper around `@t3-oss/env-nextjs` that applies opinionated defaults (`skipValidation`, `emptyStringAsUndefined`):

```js
// src/env.js
import { createEnv } from 'envlock/env';
import { z } from 'zod';

export const env = createEnv({
  server: { DATABASE_URL: z.string().url() },
  client: { NEXT_PUBLIC_APP_URL: z.string().url() },
  runtimeEnv: { ... },
});
```

## Data Flow

```
pnpm dev  →  envlock dev
              ├─ jiti loads next.config.js → reads __envlock.onePasswordEnvId
              ├─ spawnSync: op run --environment <id>
              │     └─ dotenvx run -f .env.development
              │           └─ next dev --turbo
              └─ env vars decrypted in memory, Next.js boots
```

## Repository Structure

```
dotenvx-example/
├── pnpm-workspace.yaml
├── packages/
│   └── envlock/              # publishable package
│       └── src/
│           ├── cli/          # CLI binary
│           ├── next/         # withEnvlock() plugin
│           ├── env/          # createEnv() wrapper
│           └── types.ts
└── apps/
    └── example/              # reference Next.js app
```

## Package Exports

| Import path | Provides |
|---|---|
| `envlock` | `withEnvlock`, `createEnv`, types |
| `envlock/next` | `withEnvlock` Next.js plugin |
| `envlock/env` | `createEnv` Zod validation wrapper |

## Dependencies

- `jiti` — dynamic import of `next.config.js/.ts` at CLI runtime
- `commander` — CLI argument parsing
- Peer: `@t3-oss/env-nextjs`, `zod`, `next`
- External system deps: `op` (1Password CLI), `@dotenvx/dotenvx`
