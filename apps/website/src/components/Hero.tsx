// apps/website/src/components/Hero.tsx
import { useState } from "react";

export function Hero(): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  const installCmd = "npm install -g envlock-core";

  function copy(): void {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section
      id="hero"
      className="max-w-3xl mx-auto px-6 pt-24 pb-20 text-center"
    >
      <span className="inline-block text-sm font-medium text-gray-500 tracking-widest uppercase mb-6">
        envlock
      </span>
      <h1 className="text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-6">
        Secrets that never
        <br />
        touch disk
      </h1>
      <p className="text-xl text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
        Combine encrypted{" "}
        <code className="text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-base font-mono">
          .env
        </code>{" "}
        files with 1Password to inject secrets at runtime — without ever writing
        them to the filesystem.
      </p>

      <button
        onClick={copy}
        className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium cursor-pointer"
      >
        <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-5 py-3">
          <code className="text-sm font-mono text-gray-800">{installCmd}</code>
          {copied ? "Copied!" : "Copy"}
        </div>
      </button>
    </section>
  );
}
