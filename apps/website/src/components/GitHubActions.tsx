// apps/website/src/components/GitHubActions.tsx
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml'
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs'

SyntaxHighlighter.registerLanguage('yaml', yaml)

interface Step {
  number: string;
  title: string;
  description: React.ReactNode;
}

const workflowSnippet = `name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Build with secrets
        run: npx envlock run npm run build
        env:
          DOTENV_PRIVATE_KEY_PRODUCTION: \${{ secrets.DOTENV_PRIVATE_KEY_PRODUCTION }}`

const steps: Step[] = [
  {
    number: '01',
    title: 'Export your key',
    description: (
      <>
        Run <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">dotenvx encrypt</code> locally.
        Copy the <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">DOTENV_PRIVATE_KEY_PRODUCTION</code> value
        from your <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">.env.keys</code> file.
      </>
    ),
  },
  {
    number: '02',
    title: 'Add a GitHub secret',
    description: (
      <>
        In your repo go to <strong className="text-gray-700">Settings → Secrets → Actions</strong> and add
        a new secret named <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">DOTENV_PRIVATE_KEY_PRODUCTION</code>.
      </>
    ),
  },
  {
    number: '03',
    title: 'Inject in your workflow',
    description: (
      <>
        Pass the secret as an env var. envlock detects it automatically and skips
        1Password — no CLI or service account needed in CI.
      </>
    ),
  },
]

export function GitHubActions(): React.JSX.Element {
  return (
    <section id="ci" className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">GitHub Actions</h2>
      <p className="text-gray-500 text-center mb-12 text-sm">
        No 1Password CLI needed in CI — pass the key as a secret and envlock handles the rest.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {steps.map((step) => (
          <div key={step.number}>
            <span className="text-4xl font-bold text-gray-800 block mb-3 select-none">
              {step.number}
            </span>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50">
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">.github/workflows/deploy.yml</span>
        </div>
        <div className="px-5 py-4 bg-white">
          <SyntaxHighlighter
            language="yaml"
            style={githubGist}
            customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '0.8125rem' }}
          >
            {workflowSnippet}
          </SyntaxHighlighter>
        </div>
      </div>
    </section>
  )
}
