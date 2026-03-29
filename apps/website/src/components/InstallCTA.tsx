// apps/website/src/components/InstallCTA.tsx
import { useState } from "react";

const GITHUB_URL = "https://github.com/your-org/dotenvx-example";

export function InstallCTA(): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  const cmd = "npm install -g envlock-core";

  function copy(): void {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section id="install" className="py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Get started
        </h2>
        <p className="text-gray-500 mb-8 text-sm">
          Install envlock-core globally, then prefix any command to inject
          secrets.
        </p>
        <button
          onClick={copy}
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium cursor-pointer pt-2 pb-12"
        >
          <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-5 py-3">
            <code className="text-sm font-mono text-gray-800">{cmd}</code>
            {copied ? "Copied!" : "Copy"}
          </div>
        </button>
        <div>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}
