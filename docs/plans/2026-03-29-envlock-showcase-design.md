---
title: envlock Showcase Site & Examples
date: 2026-03-29
status: approved
---

# envlock Showcase Site & Examples

## Overview

Turn this repo into a showcase for the `envlock-core` CLI package. The site explains the problem envlock solves, demonstrates the one-command integration pattern across multiple languages, and links to fully runnable example projects.

## Goals

- A static single-page marketing/showcase site at `apps/website/`
- Fully runnable minimal example projects at `examples/<lang>/`
- Clean, minimal light aesthetic (Stripe/Linear style)

## Repo Structure

```
dotenvx-example/
├── apps/
│   └── website/          # Vite + React static site
├── examples/
│   ├── node/             # Express minimal app
│   ├── python/           # Flask minimal app
│   ├── go/               # net/http minimal server
│   ├── rust/             # Axum minimal server
│   ├── ruby/             # Sinatra minimal app
│   ├── java/             # Spring Boot minimal app
│   ├── php/              # Plain PHP minimal script
│   ├── dotnet/           # .NET minimal API
│   └── hardhat/          # Hardhat deploy script
└── (existing Next.js app at root)
```

## Website (`apps/website/`)

### Tech Stack

- **Vite + React** — no SSR needed, pure static export
- **Tailwind CSS** — utility-first styling
- **Shiki** — syntax highlighting for code snippets
- No router — truly single page, anchor-linked sections

### Page Sections (top to bottom)

1. **Hero**
   - Tagline: "Secrets that never touch disk"
   - 1–2 sentence description of envlock
   - Install command with copy button: `npm install -g envlock-core`

2. **How It Works** — 3-step horizontal layout
   - Step 1: Encrypt your `.env` files with dotenvx
   - Step 2: Store the decryption key in 1Password
   - Step 3: `envlock` injects secrets at runtime — nothing written to disk

3. **Language Showcase** — tabbed interface
   - Tabs: Node · Python · Go · Rust · Ruby · Java · PHP · .NET · Hardhat
   - Each tab shows:
     - `envlock.config.js` snippet (only `commands` value differs per language)
     - The single run command: `npx envlock dev`
   - "Full example →" link to `examples/<lang>/` on GitHub

4. **Examples Grid** — card grid
   - One card per language
   - Language name + icon + brief description
   - Links to `examples/<lang>/` on GitHub

5. **Install CTA**
   - `npm install -g envlock-core`
   - Link to GitHub repo

### Design Principles

- Clean minimal light — lots of whitespace, simple typography
- No gradients or heavy visuals
- Monospace font for code blocks only
- Mobile responsive

## Examples (`examples/<lang>/`)

Each example is a self-contained runnable minimal project:

| Directory | App | What it shows |
|-----------|-----|---------------|
| `node/` | Express | `envlock node server.js` |
| `python/` | Flask | `envlock python app.py` |
| `go/` | net/http | `envlock go run main.go` |
| `rust/` | Axum | `envlock cargo run` |
| `ruby/` | Sinatra | `envlock ruby app.rb` |
| `java/` | Spring Boot | `envlock ./mvnw spring-boot:run` |
| `php/` | Plain PHP | `envlock php -S localhost:8000` |
| `dotnet/` | .NET minimal API | `envlock dotnet run` |
| `hardhat/` | Hardhat deploy | `envlock npx hardhat run scripts/deploy.js` |

Each example includes:
- The minimal app source file(s)
- Language-appropriate dependency file (`requirements.txt`, `go.mod`, `Cargo.toml`, etc.)
- `envlock.config.js`
- `.env.development` (with a placeholder encrypted value)
- `README.md` with 3-step setup instructions

### envlock.config.js pattern (same across all languages)

```js
export default {
  onePasswordEnvId: 'your-env-id',
  commands: {
    dev: '<language-specific start command>',
  },
}
```

The only difference between language examples is the `commands.dev` value and the app source file.
