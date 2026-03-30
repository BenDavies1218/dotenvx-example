# envlock + Ruby Example

Minimal Sinatra app with secrets injected by envlock.

## Prerequisites

- Ruby 3+
- Bundler (`gem install bundler`)

## Run

```bash
bundle install
npx envlock-core dev
```

The server starts at `http://localhost:3000` with secrets decrypted from `.env.development` via 1Password.

### Running ad-hoc commands

```bash
npx envlock-core run <command>
```

For example:

```bash
# inject secrets into any command
npx envlock-core run bundle exec ruby app.rb

# use staging secrets
npx envlock-core run bundle exec ruby app.rb --staging
```

## Setting Up From Scratch

If you're adapting this for your own project:

1. Install dependencies: `bundle install`
2. Encrypt your `.env.development`: `npx dotenvx encrypt -f .env.development`
3. Store the generated `DOTENV_PRIVATE_KEY_DEVELOPMENT` in a 1Password Environment
4. Set `onePasswordEnvId` in `envlock.config.js`
