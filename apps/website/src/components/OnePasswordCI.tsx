// apps/website/src/components/OnePasswordCI.tsx
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import yaml from "react-syntax-highlighter/dist/esm/languages/hljs/yaml";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";

SyntaxHighlighter.registerLanguage("yaml", yaml);

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

      - uses: 1password/load-secrets-action@v2
        with:
          export-env: true
        env:
          OP_SERVICE_ACCOUNT_TOKEN: \${{ secrets.OP_SERVICE_ACCOUNT_TOKEN }}
          DOTENV_PRIVATE_KEY_PRODUCTION: op://vault-name/envlock/DOTENV_PRIVATE_KEY_PRODUCTION

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Build with secrets
        run: npx envlock run npm run build`;

const steps: Step[] = [
  {
    number: "01",
    title: "Create a service account",
    description: (
      <>
        In 1Password go to{" "}
        <strong className="text-gray-700">Settings → Service Accounts</strong>{" "}
        and create one with read access to the vault that holds your envlock
        key.
      </>
    ),
  },
  {
    number: "02",
    title: "Add the token to GitHub",
    description: (
      <>
        Copy the service account token and add it to your repo as a GitHub
        secret named{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          OP_SERVICE_ACCOUNT_TOKEN
        </code>
        .
      </>
    ),
  },
  {
    number: "03",
    title: "Reference by vault path",
    description: (
      <>
        Use{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm">
          op://vault/item/field
        </code>{" "}
        syntax to pull secrets directly from 1Password into the workflow
        environment — no manual key copying needed.
      </>
    ),
  },
];

export function OnePasswordCI(): React.JSX.Element {
  return (
    <section
      id="1password-ci"
      className="max-w-4xl mx-auto px-6 py-20 border-y border-gray-900"
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <svg
          className="w-6 h-6 text-blue-400"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
        </svg>
        <h2 className="text-2xl font-semibold text-gray-900">
          1Password GitHub integration
        </h2>
      </div>
      <p className="text-gray-500 text-center mb-4 text-sm">
        Pull secrets directly from 1Password in CI — no manual key export, no
        stale copies.
      </p>
      <div className="flex justify-center mb-12">
        <a
          href="https://developer.1password.com/docs/ci-cd/github-actions"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          1Password GitHub Actions docs →
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {steps.map((step) => (
          <div key={step.number}>
            <span className="text-4xl font-bold text-gray-800 block mb-3 select-none">
              {step.number}
            </span>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-200 bg-gray-50">
          <svg
            className="w-4 h-4 text-gray-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            .github/workflows/deploy.yml
          </span>
        </div>
        <div className="px-5 py-4 bg-white">
          <SyntaxHighlighter
            language="yaml"
            style={githubGist}
            customStyle={{
              background: "transparent",
              padding: 0,
              margin: 0,
              fontSize: "0.8125rem",
            }}
          >
            {workflowSnippet}
          </SyntaxHighlighter>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        The{" "}
        <code className="bg-gray-100 px-1 py-0.5 rounded">
          load-secrets-action
        </code>{" "}
        injects{" "}
        <code className="bg-gray-100 px-1 py-0.5 rounded">
          DOTENV_PRIVATE_KEY_PRODUCTION
        </code>{" "}
        into the environment before envlock runs — no 1Password CLI install
        required.
      </p>
    </section>
  );
}
