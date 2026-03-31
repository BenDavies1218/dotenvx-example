const base = import.meta.env.BASE_URL;

export interface SetupStep {
  label: string;
  code?: string;
  lang?: string;
  note?: string;
}

export interface Language {
  id: string;
  name: string;
  image: string;
  imageClass?: string;
  description: string;
  command: string;
  commandName?: string;
  configCommand?: string;
  stagingCommand?: string;
  productionCommand?: string;
  examplePath: string;
  configFile?: string;
  snippet?: string;
  steps?: SetupStep[];
}

export const languages: Language[] = [
  {
    id: "nextjs",
    name: "Next.js",
    image: `${base}nextjs-removebg-preview.png`,
    imageClass: "bg-white rounded-full p-0.5",
    description: "Native plugin — wrap your next.config.ts with withEnvlock",
    command: "pnpm dev",
    stagingCommand: "pnpm dev --staging",
    productionCommand: "pnpm dev --production",
    examplePath: "examples/nextjs",
    configFile: "package.json",
    snippet: `{
  "scripts": {
    "dev": "envlock dev",
    "build": "envlock build",
    "start": "envlock start"
  }
}`,
    steps: [
      {
        label: "1. Create a new Next.js app",
        code: "npx create-next-app@latest my-app\ncd my-app",
        lang: "bash",
      },
      {
        label: "2. Install envlock-next",
        code: "pnpm add envlock-next",
        lang: "bash",
      },
      {
        label: "3. Encrypt your environment variables",
        code: "npx @dotenvx/dotenvx encrypt -f .env.development",
        lang: "bash",
        note: "envlock supports .env.development, .env.staging, and .env.production — encrypt multiple files as needed.",
      },
      {
        label: "4. Add the encryption key to 1Password environment",
        note: "The encryption key will be fetched from 1Password at runtime.",
      },
      {
        label: "5. Update next.config.ts",
        code: `import { withEnvlock } from "envlock-next";

export default withEnvlock(
  {
    // your existing Next.js config
  },
  {
    onePasswordEnvId: "your-1password-environment-id",
  },
);`,
        lang: "javascript",
      },
      {
        label: "6. Update package.json scripts",
        code: `{
  "scripts": {
    "dev": "envlock dev",
    "build": "envlock build",
    "start": "envlock start"
  }
}`,
        lang: "json",
      },
      {
        label: "7. Run the dev server",
        code: "pnpm dev",
        lang: "bash",
        note: "DOTENV_PRIVATE_KEY_DEVELOPMENT: '<concealed by 1Password>' — your decryption key is fetched from 1Password at runtime.",
      },
      {
        label:
          "CLI Flags: pnpm dev [ --staging | --production ] to load the corresponding .env file",
      },
    ],
  },
  {
    id: "node",
    name: "Node.js",
    image: `${base}node-removebg-preview.png`,
    description: "Express, Fastify, or any Node.js server",
    command: "npm start",
    stagingCommand: "npm start -- --staging",
    productionCommand: "npm start -- --production",
    examplePath: "examples/node",
    configFile: "package.json",
    snippet: `{
  "scripts": {
    "start": "npx envlock-core start",
    "build": "npx envlock-core build"
  }
}`,
  },
  {
    id: "python",
    name: "Python",
    image: `${base}python-removebg-preview.png`,
    description: "Flask, FastAPI, Django — any Python app",
    command: "npx envlock-core dev",
    stagingCommand: "npx envlock-core dev --staging",
    productionCommand: "npx envlock-core dev --production",
    configCommand: "python app.py",
    examplePath: "examples/python",
  },
  {
    id: "go",
    name: "Go",
    image: `${base}go-removebg-preview.png`,
    description: "Any Go binary or HTTP server",
    command: "npx envlock-core dev",
    stagingCommand: "npx envlock-core dev --staging",
    productionCommand: "npx envlock-core dev --production",
    configCommand: "go run main.go",
    examplePath: "examples/go",
  },
  {
    id: "rust",
    name: "Rust",
    image: `${base}rust-removebg-preview.png`,
    description: "Axum, Actix, or any Rust binary",
    command: "npx envlock-core dev",
    stagingCommand: "npx envlock-core dev --staging",
    productionCommand: "npx envlock-core dev --production",
    configCommand: "cargo run",
    examplePath: "examples/rust",
  },
  {
    id: "ruby",
    name: "Ruby",
    image: `${base}ruby-removebg-preview.png`,
    description: "Sinatra, Rails, or plain Ruby scripts",
    command: "npx envlock-core dev",
    stagingCommand: "npx envlock-core dev --staging",
    productionCommand: "npx envlock-core dev --production",
    configCommand: "ruby app.rb",
    examplePath: "examples/ruby",
  },
  {
    id: "java",
    name: "Java",
    image: `${base}java-removebg-preview.png`,
    description: "Spring Boot or any Java application",
    command: "npx envlock-core dev",
    stagingCommand: "npx envlock-core dev --staging",
    productionCommand: "npx envlock-core dev --production",
    configCommand: "./mvnw spring-boot:run",
    examplePath: "examples/java",
  },
  {
    id: "php",
    name: "PHP",
    image: `${base}php-removebg-preview.png`,
    description: "Plain PHP or Laravel applications",
    command: "npx envlock-core dev",
    stagingCommand: "npx envlock-core dev --staging",
    productionCommand: "npx envlock-core dev --production",
    configCommand: "php -S localhost:3000",
    examplePath: "examples/php",
  },
  {
    id: "dotnet",
    name: ".NET",
    image: `${base}dotnet-removebg-preview.png`,
    description: "ASP.NET Core minimal API",
    command: "npx envlock-core dev",
    stagingCommand: "npx envlock-core dev --staging",
    productionCommand: "npx envlock-core dev --production",
    configCommand: "dotnet run",
    examplePath: "examples/dotnet",
  },
  {
    id: "hardhat",
    name: "Hardhat",
    image: `${base}eth-removebg-preview.png`,
    description: "Inject PRIVATE_KEY and RPC URLs at deploy time",
    command: "npm run deploy",
    stagingCommand: "npm run deploy -- --staging",
    productionCommand: "npm run deploy -- --production",
    commandName: "deploy",
    examplePath: "examples/hardhat",
    configFile: "package.json",
    snippet: `{
  "scripts": {
    "compile": "npx envlock-core compile",
    "deploy": "npx envlock-core deploy"
  }
}`,
  },
];

export function getConfigSnippet(lang: Language): string {
  if (lang.snippet) return lang.snippet;
  return `export default {
  onePasswordEnvId: 'your-1password-environment-id',
  commands: {
    dev: '${lang.configCommand ?? lang.command}',
  },
}`;
}
