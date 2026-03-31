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
npm start   # runs: npx envlock-core start  → node server.js
npm run build  # runs: npx envlock-core build  → node build.js
```

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
