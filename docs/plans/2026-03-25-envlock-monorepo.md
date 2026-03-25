# envlock monorepo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a new standalone monorepo at a path of your choosing (e.g. `~/Documents/GitHub/envlock`) containing `@envlock/core` and `@envlock/next`, extracted from `packages/envlock` in this repo.

**Architecture:** `@envlock/core` holds the framework-agnostic 1Password + dotenvx invocation logic. `@envlock/next` holds the Next.js plugin, `createEnv` wrapper, and `envlock` CLI — it depends on core. All tests move alongside their source. Once the new repo is live, `apps/example` in this repo is updated to depend on `@envlock/next` and `packages/envlock` is removed.

**Tech Stack:** pnpm workspaces, TypeScript 5.8, tsup, vitest 3, commander 12

---

### Task 1: Create the new repo and monorepo root files

**Files:**
- Create: `pnpm-workspace.yaml`
- Create: `package.json`
- Create: `.gitignore`

**Step 1: Initialise the repo**

```bash
mkdir ~/Documents/GitHub/envlock
cd ~/Documents/GitHub/envlock
git init
mkdir -p packages
```

**Step 2: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
```

**Step 3: Create root `package.json`**

```json
{
  "name": "envlock-monorepo",
  "private": true,
  "scripts": {
    "build": "pnpm -r build",
    "test": "pnpm -r test"
  },
  "devDependencies": {
    "typescript": "^5.8.2"
  }
}
```

**Step 4: Create `.gitignore`**

```
node_modules
dist
*.local
```

**Step 5: Commit**

```bash
git add .
git commit -m "chore: initialise envlock monorepo"
```

Expected: commit with 3 files.

---

### Task 2: Scaffold `@envlock/core`

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/tsup.config.ts`
- Create: `packages/core/vitest.config.ts`

**Step 1: Create `packages/core/package.json`**

```json
{
  "name": "@envlock/core",
  "version": "0.1.0",
  "type": "module",
  "description": "Core 1Password + dotenvx secret injection logic for envlock",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@types/node": "^20.14.10",
    "tsup": "^8.0.0",
    "typescript": "^5.8.2",
    "vitest": "^3.0.0"
  }
}
```

**Step 2: Create `packages/core/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create `packages/core/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  clean: true,
  outDir: "dist",
});
```

**Step 4: Create `packages/core/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

**Step 5: Commit**

```bash
git add packages/core
git commit -m "chore: scaffold @envlock/core package"
```

---

### Task 3: Implement `@envlock/core` source files

**Files:**
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/validate.ts`
- Create: `packages/core/src/detect.ts`
- Create: `packages/core/src/invoke.ts`
- Create: `packages/core/src/index.ts`

**Step 1: Create `packages/core/src/types.ts`**

```ts
export type Environment = "development" | "staging" | "production";

export interface EnvlockOptions {
  onePasswordEnvId: string;
  envFiles?: {
    development?: string;
    staging?: string;
    production?: string;
  };
}
```

**Step 2: Create `packages/core/src/validate.ts`**

```ts
import { isAbsolute, relative, resolve } from "node:path";

const OP_ENV_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function validateOnePasswordEnvId(id: string): void {
  if (!id || !OP_ENV_ID_PATTERN.test(id)) {
    throw new Error(
      `[envlock] Invalid onePasswordEnvId: "${id}". ` +
        "Must be a lowercase alphanumeric string (hyphens allowed), e.g. 'ca6uypwvab5mevel44gqdc2zae'.",
    );
  }
}

export function validateEnvFilePath(envFile: string, cwd: string): void {
  if (envFile.includes("\x00")) {
    throw new Error(`[envlock] Invalid env file path: null bytes are not allowed.`);
  }

  const resolved = resolve(cwd, envFile);
  const base = resolve(cwd);
  const rel = relative(base, resolved);

  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error(
      `[envlock] Invalid env file path: "${envFile}" resolves outside the project directory.`,
    );
  }
}
```

**Step 3: Create `packages/core/src/detect.ts`**

```ts
import { execFileSync } from "node:child_process";

const WHICH = process.platform === "win32" ? "where" : "which";

export function hasBinary(name: string): boolean {
  try {
    execFileSync(WHICH, [name], { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

export function checkBinary(name: string, installHint: string): void {
  if (!hasBinary(name)) {
    console.error(`[envlock] '${name}' not found in PATH.\n${installHint}`);
    process.exit(1);
  }
}
```

**Step 4: Create `packages/core/src/invoke.ts`**

```ts
import { spawnSync } from "node:child_process";
import { checkBinary } from "./detect.js";

export interface RunWithSecretsOptions {
  envFile: string;
  environment: string;
  onePasswordEnvId: string;
  command: string;
  args: string[];
}

export function runWithSecrets(options: RunWithSecretsOptions): void {
  const { envFile, environment, onePasswordEnvId, command, args } = options;

  checkBinary(
    "dotenvx",
    "Install dotenvx: npm install -g @dotenvx/dotenvx\nOr add it as a dev dependency.",
  );

  const privateKeyVar = `DOTENV_PRIVATE_KEY_${environment.toUpperCase()}`;
  const keyAlreadyInjected = !!process.env[privateKeyVar];

  let result;

  if (keyAlreadyInjected) {
    result = spawnSync(
      "dotenvx",
      ["run", "-f", envFile, "--", command, ...args],
      { stdio: "inherit" },
    );
  } else {
    checkBinary(
      "op",
      "Install 1Password CLI: brew install --cask 1password-cli@beta\nThen sign in: op signin",
    );
    result = spawnSync(
      "op",
      [
        "run",
        "--environment",
        onePasswordEnvId,
        "--",
        "dotenvx",
        "run",
        "-f",
        envFile,
        "--",
        command,
        ...args,
      ],
      { stdio: "inherit" },
    );
  }

  process.exit(result.status ?? 1);
}
```

**Step 5: Create `packages/core/src/index.ts`**

```ts
export { runWithSecrets } from "./invoke.js";
export type { RunWithSecretsOptions } from "./invoke.js";
export { hasBinary, checkBinary } from "./detect.js";
export { validateEnvFilePath, validateOnePasswordEnvId } from "./validate.js";
export type { Environment, EnvlockOptions } from "./types.js";
```

**Step 6: Commit**

```bash
git add packages/core/src
git commit -m "feat: implement @envlock/core source"
```

---

### Task 4: Write and run `@envlock/core` tests

**Files:**
- Create: `packages/core/src/validate.test.ts`

**Step 1: Install deps**

```bash
cd packages/core && pnpm install
```

**Step 2: Write the failing tests — create `packages/core/src/validate.test.ts`**

```ts
import { sep } from "node:path";
import { describe, expect, it } from "vitest";
import { validateEnvFilePath, validateOnePasswordEnvId } from "./validate.js";

describe("validateOnePasswordEnvId", () => {
  it("accepts valid 1Password environment IDs (lowercase alphanumeric)", () => {
    expect(() => validateOnePasswordEnvId("ca6uypwvab5mevel44gqdc2zae")).not.toThrow();
  });

  it("rejects IDs that start with -- (CLI flag injection)", () => {
    expect(() => validateOnePasswordEnvId("--no-masking")).toThrow(/invalid/i);
  });

  it("rejects IDs containing semicolons (shell metacharacter)", () => {
    expect(() => validateOnePasswordEnvId("abc; rm -rf /")).toThrow(/invalid/i);
  });

  it("rejects IDs containing spaces", () => {
    expect(() => validateOnePasswordEnvId("abc def")).toThrow(/invalid/i);
  });

  it("rejects IDs containing newlines", () => {
    expect(() => validateOnePasswordEnvId("abc\ndef")).toThrow(/invalid/i);
  });

  it("rejects empty string", () => {
    expect(() => validateOnePasswordEnvId("")).toThrow(/invalid/i);
  });
});

describe("validateEnvFilePath", () => {
  const cwd = "/project";

  it("accepts paths within the project directory", () => {
    expect(() => validateEnvFilePath(".env.production", cwd)).not.toThrow();
    expect(() => validateEnvFilePath(".env.staging", cwd)).not.toThrow();
  });

  it("rejects absolute paths outside the project", () => {
    expect(() => validateEnvFilePath("/etc/passwd", cwd)).toThrow(/invalid/i);
  });

  it("rejects relative paths that escape the project directory", () => {
    expect(() => validateEnvFilePath("../../etc/passwd", cwd)).toThrow(/invalid/i);
  });

  it("rejects paths with null bytes", () => {
    expect(() => validateEnvFilePath(".env\x00.production", cwd)).toThrow(/invalid/i);
  });

  it("does not allow a sibling directory that shares a common prefix", () => {
    expect(() =>
      validateEnvFilePath(`..${sep}project-evil${sep}.env`, cwd),
    ).toThrow(/invalid/i);
  });
});
```

**Step 3: Run tests to verify they pass**

```bash
cd packages/core && pnpm test
```

Expected: 11 tests passing.

**Step 4: Build the package**

```bash
cd packages/core && pnpm build
```

Expected: `dist/index.js` and `dist/index.d.ts` generated, no errors.

**Step 5: Commit**

```bash
cd ../.. && git add packages/core/src/validate.test.ts
git commit -m "test: add @envlock/core validate tests"
```

---

### Task 5: Scaffold `@envlock/next`

**Files:**
- Create: `packages/next/package.json`
- Create: `packages/next/tsconfig.json`
- Create: `packages/next/tsup.config.ts`
- Create: `packages/next/vitest.config.ts`

**Step 1: Create `packages/next/package.json`**

```json
{
  "name": "@envlock/next",
  "version": "0.1.0",
  "type": "module",
  "description": "Next.js plugin, createEnv wrapper, and CLI for envlock",
  "bin": {
    "envlock": "./dist/cli/index.js"
  },
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@envlock/core": "workspace:*",
    "commander": "^12.0.0"
  },
  "peerDependencies": {
    "@t3-oss/env-nextjs": ">=0.12.0",
    "next": ">=14.0.0",
    "zod": ">=3.0.0"
  },
  "peerDependenciesMeta": {
    "@t3-oss/env-nextjs": {
      "optional": true
    },
    "zod": {
      "optional": true
    }
  },
  "devDependencies": {
    "@envlock/core": "workspace:*",
    "@t3-oss/env-nextjs": "^0.12.0",
    "@types/node": "^20.14.10",
    "next": "^15.2.3",
    "tsup": "^8.0.0",
    "typescript": "^5.8.2",
    "vitest": "^3.0.0",
    "zod": "^3.24.2"
  }
}
```

**Step 2: Create `packages/next/tsconfig.json`** (identical to core)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create `packages/next/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/index.ts" },
    format: ["esm"],
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
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
```

**Step 4: Create `packages/next/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

**Step 5: Install deps**

```bash
cd packages/next && pnpm install
```

**Step 6: Commit**

```bash
cd ../.. && git add packages/next
git commit -m "chore: scaffold @envlock/next package"
```

---

### Task 6: Implement `@envlock/next` source files

**Files:**
- Create: `packages/next/src/plugin.ts`
- Create: `packages/next/src/env/index.ts`
- Create: `packages/next/src/cli/resolve-config.ts`
- Create: `packages/next/src/cli/index.ts`
- Create: `packages/next/src/index.ts`

**Step 1: Create `packages/next/src/plugin.ts`**

```ts
import type { NextConfig } from "next";
import type { EnvlockOptions } from "@envlock/core";
import { validateOnePasswordEnvId } from "@envlock/core";

export type EnvlockNextConfig = NextConfig & { __envlock: EnvlockOptions };

export function withEnvlock(
  nextConfig: NextConfig,
  options?: EnvlockOptions,
): EnvlockNextConfig {
  if (!options?.onePasswordEnvId) {
    console.warn(
      "[envlock] No onePasswordEnvId provided to withEnvlock(). " +
        "Set it to your 1Password Environment ID for automatic secret injection. " +
        "Alternatively, set ENVLOCK_OP_ENV_ID in your environment.",
    );
  } else {
    validateOnePasswordEnvId(options.onePasswordEnvId);
  }

  return {
    ...nextConfig,
    __envlock: options ?? { onePasswordEnvId: "" },
  };
}
```

**Step 2: Create `packages/next/src/env/index.ts`**

```ts
import { createEnv as t3CreateEnv } from "@t3-oss/env-nextjs";

type CreateEnvArgs = Parameters<typeof t3CreateEnv>[0];

export function createEnv(options: CreateEnvArgs) {
  return t3CreateEnv({
    skipValidation: !!process.env["SKIP_ENV_VALIDATION"],
    emptyStringAsUndefined: true,
    ...options,
  });
}
```

**Step 3: Create `packages/next/src/cli/resolve-config.ts`**

```ts
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { EnvlockOptions } from "@envlock/core";
import { validateOnePasswordEnvId } from "@envlock/core";

const CONFIG_CANDIDATES = ["next.config.js", "next.config.mjs"];

export async function resolveConfig(cwd: string): Promise<EnvlockOptions> {
  for (const candidate of CONFIG_CANDIDATES) {
    const fullPath = resolve(cwd, candidate);
    if (!existsSync(fullPath)) continue;

    try {
      const mod = await import(pathToFileURL(fullPath).href);
      const config = (mod as Record<string, unknown>).default ?? mod;

      if (
        config &&
        typeof config === "object" &&
        "__envlock" in config &&
        config.__envlock &&
        typeof config.__envlock === "object" &&
        "onePasswordEnvId" in config.__envlock
      ) {
        return config.__envlock as EnvlockOptions;
      }
    } catch (err) {
      console.warn(
        `[envlock] Failed to load ${candidate}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  if (process.env["ENVLOCK_OP_ENV_ID"]) {
    const id = process.env["ENVLOCK_OP_ENV_ID"];
    validateOnePasswordEnvId(id);
    return { onePasswordEnvId: id };
  }

  throw new Error(
    "[envlock] Could not find configuration.\n" +
      "Add withEnvlock() to your next.config.js:\n\n" +
      "  import { withEnvlock } from '@envlock/next';\n" +
      "  export default withEnvlock({}, { onePasswordEnvId: 'your-env-id' });\n\n" +
      "Or set the ENVLOCK_OP_ENV_ID environment variable.",
  );
}
```

**Step 4: Create `packages/next/src/cli/index.ts`**

```ts
import { Command } from "commander";
import { runWithSecrets, validateEnvFilePath } from "@envlock/core";
import { resolveConfig } from "./resolve-config.js";

type Environment = "development" | "staging" | "production";

const DEFAULT_ENV_FILES: Record<Environment, string> = {
  development: ".env.development",
  staging: ".env.staging",
  production: ".env.production",
};

async function runNextCommand(
  subcommand: string,
  environment: Environment,
  passthroughArgs: string[],
): Promise<void> {
  const config = await resolveConfig(process.cwd());
  const envFile =
    config.envFiles?.[environment] ?? DEFAULT_ENV_FILES[environment];

  validateEnvFilePath(envFile, process.cwd());

  runWithSecrets({
    envFile,
    environment,
    onePasswordEnvId: config.onePasswordEnvId,
    command: "next",
    args: [subcommand, ...passthroughArgs],
  });
}

function addEnvFlags(cmd: Command): Command {
  return cmd
    .option("--staging", "use staging environment")
    .option("--production", "use production environment")
    .allowUnknownOption(true);
}

function getEnvironment(opts: {
  staging?: boolean;
  production?: boolean;
}): Environment {
  if (opts.production) return "production";
  if (opts.staging) return "staging";
  return "development";
}

const program = new Command("envlock");

program
  .name("envlock")
  .description("Run Next.js commands with 1Password + dotenvx secret injection")
  .version("0.1.0");

const devCmd = new Command("dev")
  .description("Start Next.js development server")
  .allowUnknownOption(true);
addEnvFlags(devCmd).action(async (opts: { staging?: boolean; production?: boolean }) => {
  const passthrough = devCmd.args.filter(
    (a) => a !== "--staging" && a !== "--production",
  );
  await runNextCommand("dev", getEnvironment(opts), passthrough);
});

const buildCmd = new Command("build")
  .description("Build Next.js application")
  .allowUnknownOption(true);
addEnvFlags(buildCmd).action(async (opts: { staging?: boolean; production?: boolean }) => {
  const passthrough = buildCmd.args.filter(
    (a) => a !== "--staging" && a !== "--production",
  );
  await runNextCommand("build", getEnvironment(opts), passthrough);
});

const startCmd = new Command("start")
  .description("Start Next.js production server")
  .allowUnknownOption(true);
addEnvFlags(startCmd).action(async (opts: { staging?: boolean; production?: boolean }) => {
  const passthrough = startCmd.args.filter(
    (a) => a !== "--staging" && a !== "--production",
  );
  await runNextCommand("start", getEnvironment(opts), passthrough);
});

program.addCommand(devCmd);
program.addCommand(buildCmd);
program.addCommand(startCmd);

program.parse(process.argv);
```

**Step 5: Create `packages/next/src/index.ts`**

```ts
export { withEnvlock } from "./plugin.js";
export type { EnvlockNextConfig } from "./plugin.js";
export { createEnv } from "./env/index.js";
export type { EnvlockOptions } from "@envlock/core";
```

**Step 6: Commit**

```bash
git add packages/next/src
git commit -m "feat: implement @envlock/next source"
```

---

### Task 7: Migrate `@envlock/next` tests

**Files:**
- Create: `packages/next/src/plugin.test.ts`
- Create: `packages/next/src/env/index.test.ts`
- Create: `packages/next/src/cli/resolve-config.test.ts`

**Step 1: Create `packages/next/src/plugin.test.ts`**

```ts
import { describe, expect, it, vi } from "vitest";
import { withEnvlock } from "./plugin.js";

describe("withEnvlock", () => {
  it("attaches __envlock to the Next.js config", () => {
    const result = withEnvlock({}, { onePasswordEnvId: "abc123" });
    expect(result.__envlock.onePasswordEnvId).toBe("abc123");
  });

  it("merges with existing Next.js config without overwriting it", () => {
    const result = withEnvlock(
      { reactStrictMode: true },
      { onePasswordEnvId: "abc123" },
    );
    expect(result.reactStrictMode).toBe(true);
    expect(result.__envlock.onePasswordEnvId).toBe("abc123");
  });

  it("preserves custom envFiles in __envlock", () => {
    const result = withEnvlock(
      {},
      {
        onePasswordEnvId: "abc123",
        envFiles: { staging: ".env.custom-staging" },
      },
    );
    expect(result.__envlock.envFiles?.staging).toBe(".env.custom-staging");
  });

  it("warns when onePasswordEnvId is not provided", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    withEnvlock({});
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[envlock]"));
    warn.mockRestore();
  });

  it("warns when onePasswordEnvId is an empty string", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    withEnvlock({}, { onePasswordEnvId: "" });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("[envlock]"));
    warn.mockRestore();
  });

  it("does not warn when onePasswordEnvId is valid", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    withEnvlock({}, { onePasswordEnvId: "ca6uypwvab5mevel44gqdc2zae" });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("throws when onePasswordEnvId contains CLI flag characters", () => {
    expect(() =>
      withEnvlock({}, { onePasswordEnvId: "--no-masking" }),
    ).toThrow(/invalid/i);
  });

  it("throws when onePasswordEnvId contains shell metacharacters", () => {
    expect(() =>
      withEnvlock({}, { onePasswordEnvId: "abc; rm -rf /" }),
    ).toThrow(/invalid/i);
  });
});
```

**Step 2: Create `packages/next/src/env/index.test.ts`**

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@t3-oss/env-nextjs", () => ({
  createEnv: vi.fn((opts: unknown) => opts),
}));

const { createEnv } = await import("./index.js");
const { createEnv: t3CreateEnv } = await import("@t3-oss/env-nextjs");

describe("createEnv", () => {
  it("applies emptyStringAsUndefined: true by default", () => {
    createEnv({ server: {}, client: {}, runtimeEnv: {} });
    expect(t3CreateEnv).toHaveBeenCalledWith(
      expect.objectContaining({ emptyStringAsUndefined: true }),
    );
  });

  it("reads skipValidation from SKIP_ENV_VALIDATION env var", () => {
    process.env["SKIP_ENV_VALIDATION"] = "1";
    createEnv({ server: {}, client: {}, runtimeEnv: {} });
    expect(t3CreateEnv).toHaveBeenCalledWith(
      expect.objectContaining({ skipValidation: true }),
    );
    delete process.env["SKIP_ENV_VALIDATION"];
  });

  it("does not skip validation when SKIP_ENV_VALIDATION is unset", () => {
    delete process.env["SKIP_ENV_VALIDATION"];
    createEnv({ server: {}, client: {}, runtimeEnv: {} });
    expect(t3CreateEnv).toHaveBeenCalledWith(
      expect.objectContaining({ skipValidation: false }),
    );
  });

  it("allows caller to override emptyStringAsUndefined", () => {
    createEnv({ server: {}, client: {}, runtimeEnv: {}, emptyStringAsUndefined: false });
    expect(t3CreateEnv).toHaveBeenCalledWith(
      expect.objectContaining({ emptyStringAsUndefined: false }),
    );
  });

  it("allows caller to override skipValidation", () => {
    createEnv({ server: {}, client: {}, runtimeEnv: {}, skipValidation: true });
    expect(t3CreateEnv).toHaveBeenCalledWith(
      expect.objectContaining({ skipValidation: true }),
    );
  });
});
```

**Step 3: Create `packages/next/src/cli/resolve-config.test.ts`**

```ts
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveConfig } from "./resolve-config.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = join(tmpdir(), `envlock-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(tmpDir, { recursive: true });
  delete process.env["ENVLOCK_OP_ENV_ID"];
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
  delete process.env["ENVLOCK_OP_ENV_ID"];
});

describe("resolveConfig", () => {
  it("reads onePasswordEnvId from next.config.js with withEnvlock", async () => {
    writeFileSync(
      join(tmpDir, "next.config.js"),
      `export default { __envlock: { onePasswordEnvId: "test-env-id" } };`,
    );
    const config = await resolveConfig(tmpDir);
    expect(config.onePasswordEnvId).toBe("test-env-id");
  });

  it("falls back to ENVLOCK_OP_ENV_ID env var when no config file found", async () => {
    process.env["ENVLOCK_OP_ENV_ID"] = "env-var-id";
    const config = await resolveConfig(tmpDir);
    expect(config.onePasswordEnvId).toBe("env-var-id");
  });

  it("throws a descriptive error when no config is found anywhere", async () => {
    await expect(resolveConfig(tmpDir)).rejects.toThrow(/withEnvlock/);
  });

  it("skips config files that do not have __envlock and tries the next", async () => {
    writeFileSync(
      join(tmpDir, "next.config.js"),
      `export default { reactStrictMode: true };`,
    );
    process.env["ENVLOCK_OP_ENV_ID"] = "fallback-id";
    const config = await resolveConfig(tmpDir);
    expect(config.onePasswordEnvId).toBe("fallback-id");
  });

  it("prefers next.config.js over next.config.mjs", async () => {
    writeFileSync(
      join(tmpDir, "next.config.js"),
      `export default { __envlock: { onePasswordEnvId: "from-js" } };`,
    );
    writeFileSync(
      join(tmpDir, "next.config.mjs"),
      `export default { __envlock: { onePasswordEnvId: "from-mjs" } };`,
    );
    const config = await resolveConfig(tmpDir);
    expect(config.onePasswordEnvId).toBe("from-js");
  });

  it("validates ENVLOCK_OP_ENV_ID from env var (rejects CLI flag injection)", async () => {
    process.env["ENVLOCK_OP_ENV_ID"] = "--no-masking";
    await expect(resolveConfig(tmpDir)).rejects.toThrow(/invalid/i);
  });

  it("validates ENVLOCK_OP_ENV_ID from env var (rejects shell metacharacters)", async () => {
    process.env["ENVLOCK_OP_ENV_ID"] = "abc; rm -rf /";
    await expect(resolveConfig(tmpDir)).rejects.toThrow(/invalid/i);
  });

  it("warns when a config file has a syntax error instead of silently skipping", async () => {
    writeFileSync(
      join(tmpDir, "next.config.js"),
      `export default { this is not valid javascript }`,
    );
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    process.env["ENVLOCK_OP_ENV_ID"] = "fallback-id";
    await resolveConfig(tmpDir);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("next.config.js"));
    warn.mockRestore();
  });
});
```

**Step 4: Run the tests**

```bash
cd packages/next && pnpm test
```

Expected: 21 tests passing (8 plugin + 5 env + 8 resolve-config).

**Step 5: Commit**

```bash
cd ../.. && git add packages/next/src
git commit -m "test: add @envlock/next tests"
```

---

### Task 8: Build both packages and verify

**Step 1: Install all workspace deps from root**

```bash
pnpm install
```

**Step 2: Build core first, then next**

```bash
pnpm --filter @envlock/core build
pnpm --filter @envlock/next build
```

Expected: `packages/core/dist/` and `packages/next/dist/` populated, no TypeScript errors.

**Step 3: Run all tests from root**

```bash
pnpm test
```

Expected: all 32 tests passing across both packages.

**Step 4: Commit**

```bash
git add .
git commit -m "chore: verify full build and test suite"
```

---

### Task 9: Update `dotenvx-example` to use `@envlock/next`

> Switch back to the `dotenvx-example` repo for this task.

**Files:**
- Modify: `apps/example/package.json`
- Modify: `apps/example/next.config.js`
- Modify: `apps/example/src/env.js`

**Step 1: Update `apps/example/package.json`**

In the `dependencies` block, replace:
```json
"envlock": "workspace:*",
```
with:
```json
"@envlock/next": "^0.1.0",
```

Also remove `@dotenvx/dotenvx` from `devDependencies` — it's now a transitive dep via `@envlock/next`.

**Step 2: Update `apps/example/next.config.js`**

Change:
```js
import { withEnvlock } from "envlock/next";
```
to:
```js
import { withEnvlock } from "@envlock/next";
```

**Step 3: Update `apps/example/src/env.js`**

Change:
```js
import { createEnv } from "envlock/env";
```
to:
```js
import { createEnv } from "@envlock/next";
```

**Step 4: Install and verify**

```bash
pnpm install
```

Expected: resolves `@envlock/next` from npm (publish first if needed), no errors.

**Step 5: Commit**

```bash
git add apps/example/package.json apps/example/next.config.js apps/example/src/env.js
git commit -m "chore: migrate apps/example from envlock to @envlock/next"
```

---

### Task 10: Remove `packages/envlock` from `dotenvx-example`

**Step 1: Remove the directory**

```bash
rm -rf packages/envlock
```

**Step 2: Update `pnpm-workspace.yaml` if needed**

Check `pnpm-workspace.yaml` — if it lists `packages/*` it will automatically stop including the deleted directory. No change needed.

**Step 3: Run install to clean lockfile**

```bash
pnpm install
```

**Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove packages/envlock (replaced by @envlock/next)"
```
