# envlock + Python Example

Minimal Flask app with secrets injected by envlock.

## Prerequisites

- Python 3.9+

## Run

```bash
pip install -r requirements.txt
npx envlock-core dev                # uses .env.development (default)
npx envlock-core dev --staging      # uses .env.staging
npx envlock-core dev --production   # uses .env.production
```

| Flag           | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| _(none)_       | Uses `.env.development` (default)                                    |
| `--staging`    | Uses `.env.staging` and injects staging secrets from 1Password       |
| `--production` | Uses `.env.production` and injects production secrets from 1Password |

The server starts at `http://localhost:3000` with secrets decrypted from `.env.development` via 1Password.

## Setting Up From Scratch

1. Install dependencies: `pip install -r requirements.txt`
2. Encrypt your `.env.development`: `npx @dotenvx/dotenvx encrypt -f .env.development`
3. Store the generated `DOTENV_PRIVATE_KEY_DEVELOPMENT` in a 1Password Environment
4. Set `onePasswordEnvId` in `envlock.config.js`:

```js
export default {
  onePasswordEnvId: "your-1password-environment-id",
  commands: {
    dev: "python app.py",
  },
};
```
