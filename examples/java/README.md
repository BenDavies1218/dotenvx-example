# envlock + Java Example

Minimal Spring Boot app with secrets injected by envlock.

## Setup

1. Install Java 17+: https://adoptium.net
2. Install envlock: `npm install -g envlock-core`
3. Encrypt your env: `npx dotenvx encrypt -f .env.development`
4. Store key in 1Password and set `onePasswordEnvId` in `envlock.config.js`

## Run

```bash
npx envlock-core dev
```

### Running ad-hoc commands

You can run any command with secrets injected — no config changes needed:

```bash
npx envlock-core run <your normal command>
```

For example:

```bash
# instead of: mvn spring-boot:run
npx envlock-core run mvn spring-boot:run

# with environment override
npx envlock-core run mvn spring-boot:run --staging
```
