# envlock + Python Example

Minimal Flask app with secrets injected by envlock.

## Setup

1. Create a virtualenv: `python -m venv .venv && source .venv/bin/activate`
2. Install deps: `pip install -r requirements.txt`
3. Install envlock: `npm install -g envlock-core`
4. Encrypt your env: `npx dotenvx encrypt -f .env.development`
5. Store key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npx envlock dev
```
