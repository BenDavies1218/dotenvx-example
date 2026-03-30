const base = import.meta.env.BASE_URL;

export interface SetupStep {
  label: string;
  code: string;
  lang: string;
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
        note: "The postinstall script automatically rewrites your dev, build, and start scripts to use envlock.",
      },
      {
        label: "3. Update next.config.ts",
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
        label: "4. Run the dev server",
        code: "pnpm dev",
        lang: "bash",
        note: "DOTENV_PRIVATE_KEY_DEVELOPMENT: '<concealed by 1Password>' — your decryption key is fetched from 1Password at runtime and never stored on disk.",
      },
    ],
  },
  {
    id: "node",
    name: "Node.js",
    image: `${base}node-removebg-preview.png`,
    description: "Express, Fastify, or any Node.js server",
    command: "npm run dev",
    examplePath: "examples/node",
    configFile: "package.json",
    snippet: `{
  "scripts": {
    "dev": "envlock node server.js",
    "start": "envlock node server.js --production"
  }
}`,
  },
  {
    id: "python",
    name: "Python",
    image: `${base}python-removebg-preview.png`,
    description: "Flask, FastAPI, Django — any Python app",
    command: "python app.py",
    examplePath: "examples/python",
  },
  {
    id: "go",
    name: "Go",
    image: `${base}go-removebg-preview.png`,
    description: "Any Go binary or HTTP server",
    command: "go run main.go",
    examplePath: "examples/go",
  },
  {
    id: "rust",
    name: "Rust",
    image: `${base}rust-removebg-preview.png`,
    description: "Axum, Actix, or any Rust binary",
    command: "cargo run",
    examplePath: "examples/rust",
  },
  {
    id: "ruby",
    name: "Ruby",
    image: `${base}ruby-removebg-preview.png`,
    description: "Sinatra, Rails, or plain Ruby scripts",
    command: "ruby app.rb",
    examplePath: "examples/ruby",
  },
  {
    id: "java",
    name: "Java",
    image: `${base}java-removebg-preview.png`,
    description: "Spring Boot or any Java application",
    command: "./mvnw spring-boot:run",
    examplePath: "examples/java",
  },
  {
    id: "php",
    name: "PHP",
    image: `${base}php-removebg-preview.png`,
    description: "Plain PHP or Laravel applications",
    command: "php -S localhost:8000",
    examplePath: "examples/php",
  },
  {
    id: "dotnet",
    name: ".NET",
    image: `${base}dotnet-removebg-preview.png`,
    description: "ASP.NET Core minimal API",
    command: "dotnet run",
    examplePath: "examples/dotnet",
  },
  {
    id: "hardhat",
    name: "Hardhat",
    image: `${base}eth-removebg-preview.png`,
    description: "Inject PRIVATE_KEY and RPC URLs at deploy time",
    command: "npx hardhat run scripts/deploy.js",
    commandName: "deploy",
    examplePath: "examples/hardhat",
  },
];

export function getConfigSnippet(lang: Language): string {
  if (lang.snippet) return lang.snippet;
  return `export default {
  onePasswordEnvId: 'your-env-id',
  commands: {
    dev: '${lang.command}',
  },
}`;
}
