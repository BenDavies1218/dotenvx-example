# envlock + .NET Example

Minimal ASP.NET Core app with secrets injected by envlock.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)

## Run

```bash
npx envlock-core dev
```

The server starts at `http://localhost:5000` with secrets decrypted from `.env.development` via 1Password.

### Running ad-hoc commands

```bash
npx envlock-core run <command>
```

For example:

```bash
# inject secrets into any command
npx envlock-core run dotnet run

# use staging secrets
npx envlock-core run dotnet run --staging
```

## Setting Up From Scratch

If you're adapting this for your own project:

1. Encrypt your `.env.development`: `npx dotenvx encrypt -f .env.development`
2. Store the generated `DOTENV_PRIVATE_KEY_DEVELOPMENT` in a 1Password Environment
3. Set `onePasswordEnvId` in `envlock.config.js`
