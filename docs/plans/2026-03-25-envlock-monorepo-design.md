# envlock monorepo design

**Date:** 2026-03-25
**Status:** Approved

## Overview

Extract the `packages/envlock` package from this repo into a new standalone monorepo. Restructure as a scoped package family (`@envlock/*`) to support multiple frameworks, starting with Next.js and designed to extend to Vite and generic Node.js.

## Package structure

```
envlock/                          ← new standalone git repo
├── packages/
│   ├── core/                     ← @envlock/core
│   │   └── src/
│   │       ├── invoke.ts         # runWithSecrets() — op + dotenvx orchestration
│   │       ├── detect.ts         # hasBinary(), key-injection detection
│   │       ├── validate.ts       # validateEnvFilePath(), validateOnePasswordEnvId()
│   │       └── index.ts          # public exports + shared types
│   └── next/                     ← @envlock/next
│       └── src/
│           ├── cli/index.ts      # envlock dev/build/start CLI
│           ├── plugin.ts         # withEnvlock() Next.js config plugin
│           ├── env/index.ts      # createEnv() wrapper around @t3-oss/env-nextjs
│           └── index.ts
├── pnpm-workspace.yaml
└── package.json
```

Future packages: `@envlock/vite`, `@envlock/node` — each self-contained, depending on `@envlock/core`.

## What belongs where

### `@envlock/core`

Extracted from the current `envlock` package:

- `runWithSecrets({ envFile, environment, onePasswordEnvId, command, args })` — the `op run → dotenvx run → <command>` orchestration
- `hasBinary(name)` / `checkBinary(name, hint)` — binary detection
- `validateEnvFilePath(path, cwd)` — path traversal prevention
- `validateOnePasswordEnvId(id)` — format validation
- Shared types: `Environment`, `EnvlockOptions`, `EnvlockConfig`

No framework dependencies. No peer dependencies.

### `@envlock/next`

Everything Next.js-specific from the current `envlock` package:

- `withEnvlock(nextConfig, options)` — Next.js plugin, attaches `__envlock` to config
- `createEnv(options)` — wrapper around `@t3-oss/env-nextjs` with `emptyStringAsUndefined` and `SKIP_ENV_VALIDATION` pre-configured
- `resolveConfig(cwd)` — reads `next.config.js` for `__envlock` options
- CLI binary `envlock` with `dev`, `build`, `start` subcommands — delegates to `@envlock/core` `runWithSecrets`, passes `next` as the command

Peer dependencies: `next >= 14`, `@t3-oss/env-nextjs >= 0.12` (optional), `zod >= 3` (optional).

## Data flow

```
envlock dev --turbo
  → resolveConfig(cwd)                         # reads next.config.js.__envlock
  → core.runWithSecrets({
      command: 'next',
      args: ['dev', '--turbo'],
      envFile: '.env.development',
      environment: 'development',
      onePasswordEnvId: '<id>',
    })
    ├── key injected?  → dotenvx run -f <file> -- next dev --turbo
    └── local dev?     → op run --environment <id> -- dotenvx run -f <file> -- next dev --turbo
```

## Code duplication policy

Code duplication across framework packages is acceptable. Each framework package is self-contained. Shared logic lives in `@envlock/core`; framework-specific logic is not forced into core just to avoid duplication.

## Migration for existing users

| Before | After |
|---|---|
| `npm install envlock` | `npm install @envlock/next` |
| `import { withEnvlock } from 'envlock/next'` | `import { withEnvlock } from '@envlock/next'` |
| `import { createEnv } from 'envlock/env'` | `import { createEnv } from '@envlock/next'` |

The `envlock` CLI binary name is unchanged.

## Testing

Each package has its own `vitest` suite. Existing tests migrate alongside their source:

- `plugin.test.ts`, `env/index.test.ts`, `resolve-config.test.ts` → `@envlock/next`
- `security.test.ts` (path validation) → `@envlock/core`

## Publishing

Packages are versioned and published independently under the `@envlock` npm scope. `@envlock/next` uses a `^` range on `@envlock/core`.

## Impact on this repo (dotenvx-example)

- `apps/example` updates its dependency from `envlock` → `@envlock/next` and updates imports
- `packages/envlock` is removed once the new repo is live
