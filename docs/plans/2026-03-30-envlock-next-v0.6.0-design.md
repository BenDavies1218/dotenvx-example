# envlock-next v0.6.0 Design

**Date:** 2026-03-30
**Repo:** `/Users/benjamindavies/Documents/GitHub/envlock/packages/next`

## Goals

Fix four issues in `envlock-next`:

1. Support `next.config.ts` (CJS interop failure)
2. Add `@dotenvx/dotenvx` as a peer dependency
3. Auto-rewrite `package.json` scripts on install
4. Auto-switch port when the default is already in use

---

## 1. Dual ESM/CJS Build

**Problem:** `envlock-next` ships ESM-only. Next.js loads `next.config.ts` via CJS interop, hitting `ERR_PACKAGE_PATH_NOT_EXPORTED` because there is no `require` export condition.

**Fix:** Add a CJS format to the plugin tsup entry. The CLI stays ESM-only.

### `tsup.config.ts`

```ts
export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],   // add "cjs"
    dts: true,
    clean: true,
    outDir: "dist",
  },
  {
    entry: { "cli/index": "src/cli/index.ts" },
    format: ["esm"],           // unchanged
    dts: false,
    clean: false,
    outDir: "dist",
    banner: { js: "#!/usr/bin/env node" },
  },
  {
    entry: { postinstall: "src/postinstall.ts" },
    format: ["cjs"],           // new — must be CJS to run without ESM flags
    dts: false,
    clean: false,
    outDir: "dist",
  },
]);
```

### `package.json` exports

```json
"exports": {
  ".": {
    "require": "./dist/index.cjs",
    "import":  "./dist/index.js",
    "types":   "./dist/index.d.ts"
  }
}
```

---

## 2. `next.config.ts` Support in the CLI

**Problem:** `resolve-config.ts` only checks `next.config.js` and `next.config.mjs`. Users with `next.config.ts` get a "could not find configuration" error from the CLI.

**Fix:** Add `next.config.ts` to `CONFIG_CANDIDATES`. Dynamic `import()` of a `.ts` file works natively on Node 22+ (`--experimental-strip-types`) and fails gracefully via the existing `try/catch` on older Node. No new runtime dependencies needed.

### `src/cli/resolve-config.ts`

```ts
const CONFIG_CANDIDATES = [
  "next.config.ts",   // add — Node 22+ native, graceful fallback otherwise
  "next.config.js",
  "next.config.mjs",
];
```

---

## 3. Port Auto-Switching

**Problem:** When port 3000 is in use, `next dev` exits with `EADDRINUSE`. The current `spawnSync` with `stdio: 'inherit'` can't intercept this to retry.

**Fix:** Probe for a free port *before* spawning using `net.createServer`. If the preferred port is taken, increment until one is free (max +10), log a notice, then inject `-p <freePort>` into the args passed to `next dev`.

### New file: `src/cli/find-port.ts`

```ts
import { createServer } from "node:net";

function isPortFree(port: number): Promise<boolean>
// Attempts to bind a TCP server on the port. Resolves true if free, false if EADDRINUSE.

export async function findFreePort(preferred: number): Promise<number>
// Tries preferred, preferred+1, ..., preferred+10.
// Returns first free port found.
// Throws if none found within range.
```

### `src/cli/index.ts` — changes to `runNextCommand`

1. Extract the requested port from `passthroughArgs` (`--port <n>` or `-p <n>`), defaulting to `3000`.
2. Call `findFreePort(requestedPort)`.
3. If the result differs from the requested port, log:
   ```
   ⚠ Port 3000 in use, switching to 3001
   ```
4. Remove any existing `-p`/`--port` from `passthroughArgs` and prepend `-p <freePort>`.
5. Pass updated args to `runWithSecrets`.

Port switching only applies to the `dev` subcommand (not `build` or `start`).

---

## 4. Peer Dependency + Postinstall Script Rewriter

### Peer dependency

Add `@dotenvx/dotenvx` as a required peer dependency so package managers surface a warning (or auto-install) if it's missing:

```json
"peerDependencies": {
  "@dotenvx/dotenvx": ">=1.0.0",
  "next": ">=14.0.0"
},
"peerDependenciesMeta": {
  "@dotenvx/dotenvx": { "optional": false }
}
```

### Postinstall script

Add to `package.json`:
```json
"scripts": {
  "postinstall": "node ./dist/postinstall.js"
}
```

### New file: `src/postinstall.ts`

**Behaviour:**
- Uses `INIT_CWD` env var (set by npm and pnpm to the directory where `install` was run) to locate the project root.
- Reads `<project-root>/package.json`.
- For each of `dev`, `build`, `start`: if the script value contains `next <cmd>` and does not already contain `envlock`, replace `next <cmd>` with `envlock <cmd>`.
- If any scripts were changed, writes the file back (preserving formatting via `JSON.stringify(..., null, 2)`) and logs each change:
  ```
  [envlock] Updated scripts.dev: "next dev" → "envlock dev"
  ```
- Idempotent — re-running after scripts are already updated makes no changes.
- Exits silently with code 0 on any error (missing `INIT_CWD`, missing `package.json`, parse error) — never breaks installs.

---

## Summary of File Changes

| File | Change |
|------|--------|
| `packages/next/tsup.config.ts` | Add CJS format to plugin entry; add postinstall entry |
| `packages/next/package.json` | Add `require` export condition; add peer deps; add postinstall script |
| `packages/next/src/cli/resolve-config.ts` | Add `next.config.ts` to `CONFIG_CANDIDATES` |
| `packages/next/src/cli/find-port.ts` | **New** — port probe + free port finder |
| `packages/next/src/cli/index.ts` | Use `findFreePort` in `runNextCommand` before spawning |
| `packages/next/src/postinstall.ts` | **New** — package.json script rewriter |

## Out of Scope

- `envlock-core` changes — no changes needed
- `envlock-node` or other packages — unaffected
- Updating the `dotenvx-example` repo beyond the `next.config.mjs` workaround already applied
