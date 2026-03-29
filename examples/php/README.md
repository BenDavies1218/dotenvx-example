# envlock + PHP Example

Minimal PHP app with secrets injected by envlock.

## Setup

1. Install envlock: `npm install -g envlock-core`
2. Encrypt your env: `npx dotenvx encrypt -f .env.development`
3. Store key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npx envlock dev
```
