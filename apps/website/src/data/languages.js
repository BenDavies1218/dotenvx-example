// apps/website/src/data/languages.js

export const languages = [
  {
    id: 'node',
    name: 'Node.js',
    icon: '⬡',
    description: 'Express, Fastify, or any Node.js server',
    command: 'node server.js',
    examplePath: 'examples/node',
  },
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    description: 'Flask, FastAPI, Django — any Python app',
    command: 'python app.py',
    examplePath: 'examples/python',
  },
  {
    id: 'go',
    name: 'Go',
    icon: '🐹',
    description: 'Any Go binary or HTTP server',
    command: 'go run main.go',
    examplePath: 'examples/go',
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: '⚙️',
    description: 'Axum, Actix, or any Rust binary',
    command: 'cargo run',
    examplePath: 'examples/rust',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    icon: '💎',
    description: 'Sinatra, Rails, or plain Ruby scripts',
    command: 'ruby app.rb',
    examplePath: 'examples/ruby',
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    description: 'Spring Boot or any Java application',
    command: './mvnw spring-boot:run',
    examplePath: 'examples/java',
  },
  {
    id: 'php',
    name: 'PHP',
    icon: '🐘',
    description: 'Plain PHP or Laravel applications',
    command: 'php -S localhost:8000',
    examplePath: 'examples/php',
  },
  {
    id: 'dotnet',
    name: '.NET',
    icon: '🔷',
    description: 'ASP.NET Core minimal API',
    command: 'dotnet run',
    examplePath: 'examples/dotnet',
  },
  {
    id: 'hardhat',
    name: 'Hardhat',
    icon: '⛏️',
    description: 'Inject PRIVATE_KEY and RPC URLs at deploy time',
    command: 'npx hardhat run scripts/deploy.js',
    examplePath: 'examples/hardhat',
  },
]

export function getConfigSnippet(lang) {
  return `export default {
  onePasswordEnvId: 'your-env-id',
  commands: {
    dev: '${lang.command}',
  },
}`
}
