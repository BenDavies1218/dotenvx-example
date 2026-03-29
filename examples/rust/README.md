# envlock + Rust Example

Minimal Axum server with secrets injected by envlock.

## Setup

1. Install Rust: https://rustup.rs
2. Install envlock: `npm install -g envlock-core`
3. Encrypt your env: `npx dotenvx encrypt -f .env.development`
4. Store key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npx envlock dev
```
