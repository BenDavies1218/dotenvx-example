# envlock + Node.js Example

Minimal Express server with secrets injected by envlock.

## Run

```bash
npm install
npm start
```

The server starts at `http://localhost:3000` with secrets decrypted from `.env.development` via 1Password.

### Available Scripts

```bash
npm start                  # uses .env.development (default)
npm start -- --staging     # uses .env.staging
npm start -- --production  # uses .env.production
npm run build
```

| Flag           | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| _(none)_       | Uses `.env.development` (default)                                    |
| `--staging`    | Uses `.env.staging` and injects staging secrets from 1Password       |
| `--production` | Uses `.env.production` and injects production secrets from 1Password |

## Setting Up From Scratch

If you're adapting this for your own project:

1. Install dependencies: `npm install`
2. Encrypt your `.env.development`: `npx dotenvx encrypt -f .env.development`
3. Store the generated `DOTENV_PRIVATE_KEY_DEVELOPMENT` in a 1Password Environment
4. Set `onePasswordEnvId` in `envlock.config.js`
5. Define your commands in `envlock.config.js`:

```js
export default {
  onePasswordEnvId: "your-1password-env-id",
  commands: {
    start: "node server.js",
    build: "node build.js",
  },
};
```
