# envlock + .NET Example

Minimal ASP.NET Core minimal API with secrets injected by envlock.

## Setup

1. Install .NET 8 SDK: https://dotnet.microsoft.com/download
2. Install envlock: `npm install -g envlock-core`
3. Encrypt your env: `npx dotenvx encrypt -f .env.development`
4. Store key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npx envlock dev
```
