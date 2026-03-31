# envlock + Java Example

Minimal Spring Boot app with secrets injected by envlock.

## Prerequisites

- [Java 17+](https://adoptium.net)

## Run

```bash
npx envlock-core dev                # uses .env.development (default)
npx envlock-core dev --staging      # uses .env.staging
npx envlock-core dev --production   # uses .env.production
```

| Flag           | Description                                                          |
| -------------- | -------------------------------------------------------------------- |
| _(none)_       | Uses `.env.development` (default)                                    |
| `--staging`    | Uses `.env.staging` and injects staging secrets from 1Password       |
| `--production` | Uses `.env.production` and injects production secrets from 1Password |

The server starts at `http://localhost:8080` with secrets decrypted from `.env.development` via 1Password.

## Setting Up From Scratch

1. Encrypt your `.env.development`: `npx @dotenvx/dotenvx encrypt -f .env.development`
2. Store the generated `DOTENV_PRIVATE_KEY_DEVELOPMENT` in a 1Password Environment
3. Set `onePasswordEnvId` in `envlock.config.js`:

```js
export default {
  onePasswordEnvId: "your-1password-environment-id",
  commands: {
    dev: "./mvnw spring-boot:run",
  },
};
```
