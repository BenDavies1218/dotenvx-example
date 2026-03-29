// apps/website/src/data/languages.js

export const languages = [
  {
    id: 'nextjs',
    name: 'Next.js',
    image: '/nextjs.jpg',
    description: 'Native plugin — wrap your next.config.js with withEnvlock',
    command: 'next dev',
    examplePath: 'examples/node',
    configFile: 'next.config.js',
    snippet: `import { withEnvlock } from '@envlock/next'

export default withEnvlock(
  {},
  {
    onePasswordEnvId: 'your-env-id',
  },
)`,
  },
  {
    id: 'node',
    name: 'Node.js',
    image: '/node.png',
    description: 'Express, Fastify, or any Node.js server',
    command: 'node server.js',
    examplePath: 'examples/node',
  },
  {
    id: 'python',
    name: 'Python',
    image: '/python.png',
    description: 'Flask, FastAPI, Django — any Python app',
    command: 'python app.py',
    examplePath: 'examples/python',
  },
  {
    id: 'go',
    name: 'Go',
    image: '/go.png',
    description: 'Any Go binary or HTTP server',
    command: 'go run main.go',
    examplePath: 'examples/go',
  },
  {
    id: 'rust',
    name: 'Rust',
    image: '/rust.png',
    description: 'Axum, Actix, or any Rust binary',
    command: 'cargo run',
    examplePath: 'examples/rust',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    image: '/ruby.jpeg',
    description: 'Sinatra, Rails, or plain Ruby scripts',
    command: 'ruby app.rb',
    examplePath: 'examples/ruby',
  },
  {
    id: 'java',
    name: 'Java',
    image: '/java.png',
    description: 'Spring Boot or any Java application',
    command: './mvnw spring-boot:run',
    examplePath: 'examples/java',
  },
  {
    id: 'php',
    name: 'PHP',
    image: '/php.jpeg',
    description: 'Plain PHP or Laravel applications',
    command: 'php -S localhost:8000',
    examplePath: 'examples/php',
  },
  {
    id: 'dotnet',
    name: '.NET',
    image: '/dotnet.png',
    description: 'ASP.NET Core minimal API',
    command: 'dotnet run',
    examplePath: 'examples/dotnet',
  },
  {
    id: 'hardhat',
    name: 'Hardhat',
    image: '/eth.png',
    description: 'Inject PRIVATE_KEY and RPC URLs at deploy time',
    command: 'npx hardhat run scripts/deploy.js',
    examplePath: 'examples/hardhat',
  },
]

export function getConfigSnippet(lang) {
  if (lang.snippet) return lang.snippet
  return `export default {
  onePasswordEnvId: 'your-env-id',
  commands: {
    dev: '${lang.command}',
  },
}`
}
