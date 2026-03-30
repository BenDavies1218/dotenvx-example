# envlock-next v0.6.0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix four issues in `envlock-next`: CJS/`next.config.ts` support, `@dotenvx/dotenvx` peer dep, auto-rewrite `package.json` scripts on install, and auto-switch port when default is in use.

**Architecture:** All changes are in `packages/next` of the `envlock` monorepo. The plugin (`src/index.ts`) gets a dual ESM+CJS build so Next.js can load it from `next.config.ts`. The CLI (`src/cli/`) gets a `find-port.ts` helper that probes for a free port before spawning. A new `src/postinstall.ts` script runs via npm `postinstall` to rewrite the consumer's `package.json` scripts.

**Tech Stack:** TypeScript, tsup (bundler), vitest (tests), Node.js `node:net` (port probing), Node.js `node:fs` (postinstall)

---

### Task 1: Add CJS build for the plugin entry

**Files:**
- Modify: `packages/next/tsup.config.ts`
- Modify: `packages/next/package.json`

**Step 1: Add `"cjs"` format to the plugin entry in tsup.config.ts**

```ts
// packages/next/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],   // was: ["esm"]
    dts: true,
    clean: true,
    outDir: "dist",
  },
  {
    entry: { "cli/index": "src/cli/index.ts" },
    format: ["esm"],
    dts: false,
    clean: false,
    outDir: "dist",
    banner: { js: "#!/usr/bin/env node" },
  },
]);
```

**Step 2: Add `require` condition and `main` field to package.json exports**

In `packages/next/package.json`, change the `"exports"` field to:

```json
"exports": {
  ".": {
    "require": "./dist/index.cjs",
    "import":  "./dist/index.js",
    "types":   "./dist/index.d.ts"
  }
},
"main": "./dist/index.cjs"
```

**Step 3: Run build and confirm both files are emitted**

```bash
cd /Users/benjamindavies/Documents/GitHub/envlock/packages/next
pnpm build
```

Expected: `dist/index.js` and `dist/index.cjs` both exist. No errors.

```bash
ls dist/index.js dist/index.cjs
```

**Step 4: Commit**

```bash
git add packages/next/tsup.config.ts packages/next/package.json
git commit -m "build(next): add CJS output for plugin entry"
```

---

### Task 2: Add `next.config.ts` to config candidates

**Files:**
- Modify: `packages/next/src/cli/resolve-config.ts`
- Modify: `packages/next/src/cli/resolve-config.test.ts`

**Step 1: Write the failing test**

Add to `packages/next/src/cli/resolve-config.test.ts` inside `describe("resolveConfig")`:

```ts
it("attempts next.config.ts before next.config.mjs", async () => {
  // Plain JS written to a .ts file — loads natively on Node 22+, falls through on older Node
  writeFileSync(
    join(tmpDir, "next.config.ts"),
    `export default { __envlock: { onePasswordEnvId: "from-ts" } };`,
  );
  writeFileSync(
    join(tmpDir, "next.config.mjs"),
    `export default { __envlock: { onePasswordEnvId: "from-mjs" } };`,
  );
  const config = await resolveConfig(tmpDir);
  // On Node 22+ reads .ts; on older Node falls through to .mjs — both are correct
  expect(["from-ts", "from-mjs"]).toContain(config.onePasswordEnvId);
});

it("falls back to next.config.mjs when next.config.ts fails to import", async () => {
  writeFileSync(
    join(tmpDir, "next.config.ts"),
    `this is not valid javascript at all !!!`,
  );
  writeFileSync(
    join(tmpDir, "next.config.mjs"),
    `export default { __envlock: { onePasswordEnvId: "from-mjs-fallback" } };`,
  );
  const config = await resolveConfig(tmpDir);
  expect(config.onePasswordEnvId).toBe("from-mjs-fallback");
});
```

**Step 2: Run test to confirm it fails**

```bash
cd /Users/benjamindavies/Documents/GitHub/envlock/packages/next
pnpm test -- --reporter=verbose 2>&1 | grep -A5 "next.config.ts"
```

Expected: Both new tests fail (FAIL) — `next.config.ts` is not in candidates yet.

**Step 3: Add `next.config.ts` to CONFIG_CANDIDATES**

In `packages/next/src/cli/resolve-config.ts`, change:

```ts
const CONFIG_CANDIDATES = ["next.config.js", "next.config.mjs"];
```

to:

```ts
const CONFIG_CANDIDATES = ["next.config.ts", "next.config.js", "next.config.mjs"];
```

**Step 4: Run tests to confirm they pass**

```bash
pnpm test
```

Expected: All tests pass.

**Step 5: Commit**

```bash
git add packages/next/src/cli/resolve-config.ts packages/next/src/cli/resolve-config.test.ts
git commit -m "feat(next): add next.config.ts to config candidates"
```

---

### Task 3: Create `find-port.ts`

**Files:**
- Create: `packages/next/src/cli/find-port.ts`
- Create: `packages/next/src/cli/find-port.test.ts`

**Step 1: Write the failing tests**

Create `packages/next/src/cli/find-port.test.ts`:

```ts
import { createServer } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { findFreePort } from "./find-port.js";

// Helper: bind a port and return a cleanup function
function occupyPort(port: number): Promise<() => Promise<void>> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(port, "127.0.0.1", () => {
      resolve(() => new Promise((res) => server.close(() => res())));
    });
    server.on("error", reject);
  });
}

describe("findFreePort", () => {
  it("returns the preferred port when it is free", async () => {
    const port = await findFreePort(19001);
    expect(port).toBe(19001);
  });

  it("returns the next free port when preferred is occupied", async () => {
    const release = await occupyPort(19002);
    try {
      const port = await findFreePort(19002);
      expect(port).toBe(19003);
    } finally {
      await release();
    }
  });

  it("skips multiple occupied ports to find a free one", async () => {
    const release1 = await occupyPort(19010);
    const release2 = await occupyPort(19011);
    try {
      const port = await findFreePort(19010);
      expect(port).toBe(19012);
    } finally {
      await release1();
      await release2();
    }
  });

  it("throws if no free port found within range of 10", async () => {
    const releases: Array<() => Promise<void>> = [];
    for (let p = 19020; p <= 19030; p++) {
      releases.push(await occupyPort(p));
    }
    try {
      await expect(findFreePort(19020)).rejects.toThrow(/no free port/i);
    } finally {
      await Promise.all(releases.map((r) => r()));
    }
  });
});
```

**Step 2: Run tests to confirm they fail**

```bash
cd /Users/benjamindavies/Documents/GitHub/envlock/packages/next
pnpm test -- find-port --reporter=verbose
```

Expected: 4 FAILs — `find-port.js` module not found.

**Step 3: Implement `find-port.ts`**

Create `packages/next/src/cli/find-port.ts`:

```ts
import { createServer } from "node:net";

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.once("listening", () => server.close(() => resolve(true)));
    server.listen(port, "127.0.0.1");
  });
}

export async function findFreePort(preferred: number): Promise<number> {
  for (let port = preferred; port <= preferred + 10; port++) {
    if (await isPortFree(port)) return port;
  }
  throw new Error(
    `[envlock] No free port found in range ${preferred}–${preferred + 10}.`,
  );
}
```

**Step 4: Run tests to confirm they pass**

```bash
pnpm test -- find-port --reporter=verbose
```

Expected: 4 PASSes.

**Step 5: Commit**

```bash
git add packages/next/src/cli/find-port.ts packages/next/src/cli/find-port.test.ts
git commit -m "feat(next): add findFreePort helper"
```

---

### Task 4: Use `findFreePort` in the CLI's dev command

**Files:**
- Modify: `packages/next/src/cli/index.ts`
- Modify: `packages/next/src/cli/index.test.ts`

**Step 1: Export `runNextCommand` for testability**

In `packages/next/src/cli/index.ts`, change:

```ts
async function runNextCommand(
```

to:

```ts
export async function runNextCommand(
```

**Step 2: Write failing tests**

Add to `packages/next/src/cli/index.test.ts`:

```ts
vi.mock("./find-port.js", () => ({
  findFreePort: vi.fn(),
}));
```

Add this import at the top alongside the other mocked imports:

```ts
const { findFreePort } = await import("./find-port.js");
const { runNextCommand } = await import("./index.js");
```

Add to the mock setup in `beforeEach`:

```ts
vi.mocked(findFreePort).mockResolvedValue(3000);
```

Then add a new describe block:

```ts
describe("runNextCommand port switching", () => {
  it("passes the default port 3000 to next when free", async () => {
    vi.mocked(findFreePort).mockResolvedValue(3000);
    vi.mocked(resolveConfig).mockResolvedValue({ onePasswordEnvId: "id" });

    await runNextCommand("dev", "development", []);

    expect(findFreePort).toHaveBeenCalledWith(3000);
    expect(runWithSecrets).toHaveBeenCalledWith(
      expect.objectContaining({ args: expect.arrayContaining(["-p", "3000"]) }),
    );
  });

  it("logs a notice and switches port when preferred is taken", async () => {
    vi.mocked(findFreePort).mockResolvedValue(3001);
    vi.mocked(resolveConfig).mockResolvedValue({ onePasswordEnvId: "id" });
    const { log } = await import("envlock-core");
    const warn = vi.spyOn(log, "warn");

    await runNextCommand("dev", "development", []);

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("3001"));
  });

  it("respects an explicit --port arg passed by the user", async () => {
    vi.mocked(findFreePort).mockResolvedValue(4000);
    vi.mocked(resolveConfig).mockResolvedValue({ onePasswordEnvId: "id" });

    await runNextCommand("dev", "development", ["--port", "4000"]);

    expect(findFreePort).toHaveBeenCalledWith(4000);
  });

  it("does not run port switching for build subcommand", async () => {
    vi.mocked(resolveConfig).mockResolvedValue({ onePasswordEnvId: "id" });

    await runNextCommand("build", "production", []);

    expect(findFreePort).not.toHaveBeenCalled();
  });
});
```

**Step 3: Run tests to confirm they fail**

```bash
pnpm test -- index --reporter=verbose
```

Expected: The new port-switching tests FAIL.

**Step 4: Implement port switching in `runNextCommand`**

Replace the `runNextCommand` function body in `packages/next/src/cli/index.ts`:

```ts
export async function runNextCommand(
  subcommand: Subcommand,
  environment: Environment,
  passthroughArgs: string[],
): Promise<void> {
  const config = await resolveConfig(process.cwd());
  const envFile =
    config.envFiles?.[environment] ?? DEFAULT_ENV_FILES[environment];

  validateEnvFilePath(envFile, process.cwd());

  let finalArgs = [...passthroughArgs];

  // Port switching — dev only
  if (subcommand === "dev") {
    const portFlagIndex = finalArgs.findIndex(
      (a) => a === "--port" || a === "-p",
    );
    const requestedPort =
      portFlagIndex !== -1
        ? parseInt(finalArgs[portFlagIndex + 1] ?? "3000", 10)
        : 3000;

    const freePort = await findFreePort(requestedPort);

    if (freePort !== requestedPort) {
      log.warn(`Port ${requestedPort} in use, switching to ${freePort}`);
    }

    // Remove existing -p/--port flags then prepend resolved port
    if (portFlagIndex !== -1) {
      finalArgs.splice(portFlagIndex, 2);
    }
    finalArgs = ["-p", String(freePort), ...finalArgs];
  }

  log.debug(`Environment: ${environment}`);
  log.debug(`Env file: ${envFile}`);
  log.debug(`Command: next ${subcommand} ${finalArgs.join(" ")}`);

  runWithSecrets({
    envFile,
    environment,
    onePasswordEnvId: config.onePasswordEnvId,
    command: "next",
    args: [subcommand, ...finalArgs],
  });
}
```

Add the import at the top of `index.ts`:

```ts
import { findFreePort } from "./find-port.js";
```

**Step 5: Run all tests to confirm they pass**

```bash
pnpm test
```

Expected: All tests pass.

**Step 6: Commit**

```bash
git add packages/next/src/cli/index.ts packages/next/src/cli/index.test.ts
git commit -m "feat(next): auto-switch port when preferred is in use"
```

---

### Task 5: Postinstall script

**Files:**
- Create: `packages/next/src/postinstall.ts`
- Create: `packages/next/src/postinstall.test.ts`
- Modify: `packages/next/tsup.config.ts`
- Modify: `packages/next/package.json`

**Step 1: Write failing tests**

Create `packages/next/src/postinstall.test.ts`:

```ts
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

// Import the function we'll export from postinstall.ts
import { rewriteScripts } from "./postinstall.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `envlock-postinstall-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

function writePackageJson(scripts: Record<string, string>) {
  writeFileSync(
    join(tmpDir, "package.json"),
    JSON.stringify({ name: "test-app", scripts }, null, 2),
  );
}

function readPackageJson(): { scripts: Record<string, string> } {
  return JSON.parse(readFileSync(join(tmpDir, "package.json"), "utf8"));
}

describe("rewriteScripts", () => {
  it("rewrites next dev to envlock dev", () => {
    writePackageJson({ dev: "next dev" });
    rewriteScripts(tmpDir);
    expect(readPackageJson().scripts.dev).toBe("envlock dev");
  });

  it("rewrites next build to envlock build", () => {
    writePackageJson({ build: "next build" });
    rewriteScripts(tmpDir);
    expect(readPackageJson().scripts.build).toBe("envlock build");
  });

  it("rewrites next start to envlock start", () => {
    writePackageJson({ start: "next start" });
    rewriteScripts(tmpDir);
    expect(readPackageJson().scripts.start).toBe("envlock start");
  });

  it("is idempotent — does not double-wrap already rewritten scripts", () => {
    writePackageJson({ dev: "envlock dev", build: "envlock build" });
    rewriteScripts(tmpDir);
    const pkg = readPackageJson();
    expect(pkg.scripts.dev).toBe("envlock dev");
    expect(pkg.scripts.build).toBe("envlock build");
  });

  it("does not touch unrelated scripts", () => {
    writePackageJson({ dev: "next dev", lint: "eslint ." });
    rewriteScripts(tmpDir);
    expect(readPackageJson().scripts.lint).toBe("eslint .");
  });

  it("does not touch scripts that already use envlock", () => {
    writePackageJson({ dev: "envlock dev --turbopack" });
    rewriteScripts(tmpDir);
    expect(readPackageJson().scripts.dev).toBe("envlock dev --turbopack");
  });

  it("does not crash when package.json has no scripts field", () => {
    writeFileSync(join(tmpDir, "package.json"), JSON.stringify({ name: "x" }));
    expect(() => rewriteScripts(tmpDir)).not.toThrow();
  });

  it("does not crash when package.json does not exist", () => {
    expect(() => rewriteScripts(join(tmpDir, "nonexistent"))).not.toThrow();
  });
});
```

**Step 2: Run tests to confirm they fail**

```bash
cd /Users/benjamindavies/Documents/GitHub/envlock/packages/next
pnpm test -- postinstall --reporter=verbose
```

Expected: All 8 tests FAIL — `postinstall.js` module not found.

**Step 3: Implement `postinstall.ts`**

Create `packages/next/src/postinstall.ts`:

```ts
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REWRITES: Array<{ from: RegExp; to: string; cmd: string }> = [
  { from: /(?<![envlock\s])next dev/, to: "envlock dev", cmd: "dev" },
  { from: /(?<![envlock\s])next build/, to: "envlock build", cmd: "build" },
  { from: /(?<![envlock\s])next start/, to: "envlock start", cmd: "start" },
];

export function rewriteScripts(projectRoot: string): void {
  const pkgPath = join(projectRoot, "package.json");
  if (!existsSync(pkgPath)) return;

  let pkg: { scripts?: Record<string, string> };
  try {
    pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  } catch {
    return;
  }

  if (!pkg.scripts) return;

  let changed = false;
  for (const { from, to, cmd } of REWRITES) {
    const script = pkg.scripts[cmd];
    if (!script) continue;
    if (script.includes("envlock")) continue;
    if (!from.test(script)) continue;
    pkg.scripts[cmd] = script.replace(from, to);
    console.log(`[envlock] Updated scripts.${cmd}: "${script}" → "${pkg.scripts[cmd]}"`);
    changed = true;
  }

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
}

// Entry point — runs when executed as a script
const projectRoot = process.env["INIT_CWD"];
if (projectRoot) {
  rewriteScripts(projectRoot);
}
```

**Step 4: Run tests to confirm they pass**

```bash
pnpm test -- postinstall --reporter=verbose
```

Expected: All 8 tests pass.

**Step 5: Add postinstall entry to `tsup.config.ts`**

Add a third entry to the array in `packages/next/tsup.config.ts`:

```ts
{
  entry: { postinstall: "src/postinstall.ts" },
  format: ["cjs"],   // CJS so Node runs it without --input-type=module
  dts: false,
  clean: false,
  outDir: "dist",
},
```

**Step 6: Add postinstall script and peer deps to `package.json`**

In `packages/next/package.json`, add:

```json
"scripts": {
  "build": "tsup",
  "dev": "tsup --watch",
  "test": "vitest run",
  "test:watch": "vitest",
  "postinstall": "node ./dist/postinstall.cjs"
},
"peerDependencies": {
  "@dotenvx/dotenvx": ">=1.0.0",
  "next": ">=14.0.0"
},
"peerDependenciesMeta": {
  "@dotenvx/dotenvx": { "optional": false }
},
```

**Step 7: Update `files` array to include new dist files**

The `"files": ["dist"]` already covers everything — no change needed.

**Step 8: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass.

**Step 9: Build to confirm postinstall.cjs is emitted**

```bash
pnpm build && ls dist/postinstall.cjs
```

Expected: file exists.

**Step 10: Commit**

```bash
git add packages/next/src/postinstall.ts packages/next/src/postinstall.test.ts \
        packages/next/tsup.config.ts packages/next/package.json
git commit -m "feat(next): add postinstall script rewriter and dotenvx peer dep"
```

---

### Task 6: Full test run and version bump

**Step 1: Run full test suite one final time**

```bash
cd /Users/benjamindavies/Documents/GitHub/envlock/packages/next
pnpm test
```

Expected: All tests pass, no failures.

**Step 2: Bump version to 0.6.0**

In `packages/next/package.json`, change `"version": "0.5.0"` to `"version": "0.6.0"`.

**Step 3: Final build**

```bash
pnpm build
ls dist/
```

Expected: `index.js`, `index.cjs`, `index.d.ts`, `cli/index.js`, `postinstall.cjs`

**Step 4: Commit**

```bash
git add packages/next/package.json
git commit -m "chore(next): bump version to 0.6.0"
```

---

## Notes

- **Node 18/20 and `next.config.ts`:** Dynamic `import()` of `.ts` files only works natively on Node 22+ (`--experimental-strip-types`). On older Node, `resolve-config` silently falls through to `.mjs`/`.js`. Document this in the package README.
- **Port switching scope:** Only applies to `envlock dev`, not `build` or `start`. `build` has no port, `start` users should manage ports explicitly in production.
- **Postinstall regex:** The `(?<![envlock\s])` lookbehind ensures the rewrite is idempotent. Scripts already containing `envlock` are left untouched regardless of content.
- **INIT_CWD:** Set by both npm and pnpm when running lifecycle scripts. If absent (e.g. direct `node dist/postinstall.cjs`), the script exits silently.
