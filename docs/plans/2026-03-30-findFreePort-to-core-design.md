# Design: Move `findFreePort` to `envlock-core`

**Date:** 2026-03-30
**Status:** Approved

## Goal

Move the `findFreePort` utility from `packages/next` into `envlock-core` so it can be shared across packages without duplication.

## What Changes

### `packages/core`
- Add `src/find-port.ts` — identical implementation to the current `packages/next/src/cli/find-port.ts`
- Add `src/find-port.test.ts` — the same 4 tests moved from `packages/next`
- Export `findFreePort` from `src/index.ts`

### `packages/next`
- Delete `src/cli/find-port.ts` and `src/cli/find-port.test.ts`
- Update `src/cli/index.ts`: change `import { findFreePort } from "./find-port.js"` → `import { findFreePort } from "envlock-core"`
- Update `src/cli/index.test.ts`: change mock target from `"./find-port.js"` → `"envlock-core"`

## What Stays the Same

Port-switching logic remains entirely in `envlock-next`'s `runNextCommand`. Core only owns the utility function.

## No Breaking Changes

This is a pure internal refactor. No consumer-facing API changes.

## Testing Strategy

- Core: 4 unit tests for `findFreePort` (free port, occupied port, multi-skip, throws on exhaustion)
- Next: Existing port-switching tests continue to work; mock target updated to `envlock-core`
