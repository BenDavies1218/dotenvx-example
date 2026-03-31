// apps/website/src/components/LanguageShowcase.tsx
import { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import bash from "react-syntax-highlighter/dist/esm/languages/hljs/bash";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import json from "react-syntax-highlighter/dist/esm/languages/hljs/json";
import { githubGist } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { languages, getConfigSnippet } from "../data/languages";
import type { SetupStep } from "../data/languages";
import { cn } from "../lib/utils";

SyntaxHighlighter.registerLanguage("bash", bash);
SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("json", json);

const GITHUB_BASE =
  "https://github.com/BenDavies1218/dotenvx-example/tree/main";

interface CopyButtonProps {
  value: string;
}

function CopyButton({ value }: CopyButtonProps): React.JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  function copy(): void {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium cursor-pointer shrink-0"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

interface CodeRowProps {
  label: React.ReactNode;
  value: string;
}

function CodeRow({ label, value }: CodeRowProps): React.JSX.Element {
  return (
    <div>
      <p className="text-xs font-mono text-gray-400 mb-1">{label}</p>
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded px-3 py-2">
        <code className="text-sm font-mono text-gray-800 flex-1 min-w-0 truncate">
          {value}
        </code>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

interface SetupStepsProps {
  steps: SetupStep[];
}

function SetupSteps({ steps }: SetupStepsProps): React.JSX.Element {
  return (
    <div className="px-5 py-4 space-y-5">
      {steps.map((step) => (
        <div key={step.label}>
          <p className="text-xs font-medium text-gray-500 mb-2">{step.label}</p>
          {step.code && (
            <div className="relative border border-gray-200 rounded overflow-hidden">
              <div className="absolute top-2 right-3 z-10">
                <CopyButton value={step.code} />
              </div>

              <SyntaxHighlighter
                language={step.lang}
                style={githubGist}
                customStyle={{
                  background: "#f9fafb",
                  padding: "0.625rem 0.75rem",
                  margin: 0,
                  fontSize: "0.8125rem",
                }}
              >
                {step.code}
              </SyntaxHighlighter>
            </div>
          )}
          {step.note && (
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              {step.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export function LanguageShowcase(): React.JSX.Element {
  const [active, setActive] = useState<string>(languages[0].id);
  const lang = languages.find((l) => l.id === active)!;
  const configFile = lang.configFile ?? "envlock.config.js";
  const commandName = lang.commandName ?? "dev";
  const isPlugin = lang.id === "nextjs";
  const snippetLang = configFile === "package.json" ? "json" : "javascript";

  return (
    <section
      id="showcase"
      className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-100"
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
        Works with any language
      </h2>
      <p className="text-gray-500 text-center mb-10 text-sm">
        envlock is a CLI wrapper — it works with any runtime.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {languages.map((l) => (
          <button
            key={l.id}
            onClick={() => setActive(l.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              active === l.id
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <img
              src={l.image}
              alt={l.name}
              className={`w-4 h-4 object-contain ${l.imageClass ?? ""}`}
            />
            {l.name}
          </button>
        ))}
      </div>

      {/* Code panel */}
      <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <img
              src={lang.image}
              alt={lang.name}
              className={`w-5 h-5 object-contain ${lang.imageClass ?? ""}`}
            />
            <span className="text-sm font-medium text-gray-700">
              {lang.name} — {lang.description}
            </span>
          </div>
          <a
            href={`${GITHUB_BASE}/${lang.examplePath}`}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors font-medium"
          >
            Full example →
          </a>
        </div>

        {/* Next.js: setup steps */}
        {isPlugin && lang.steps ? (
          <SetupSteps steps={lang.steps} />
        ) : (
          <>
            {/* Config snippet */}
            <div className="px-5 pt-4 pb-3 border-b border-gray-100">
              <p className="text-xs font-mono text-gray-400 mb-1">
                {configFile}
              </p>
              <SyntaxHighlighter
                language={snippetLang}
                style={githubGist}
                customStyle={{
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  fontSize: "0.8125rem",
                }}
              >
                {getConfigSnippet(lang)}
              </SyntaxHighlighter>
            </div>

            {/* Run options */}
            {configFile !== "package.json" ? (
              <div className="px-5 py-4 space-y-3">
                <CodeRow
                  label={`Named command (envlock.config.js)`}
                  value={`npx envlock ${commandName}`}
                />

                <div className="flex items-center gap-3 text-xs text-gray-300 py-1">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span>or run ad-hoc without config</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <CodeRow
                  label={`Ad-hoc — ${lang.command}`}
                  value={`npx envlock run ${lang.command}`}
                />
              </div>
            ) : (
              <>
                <div className="px-5 py-4 space-y-3">
                  <CodeRow
                    label={"Dev Server (Default --development)"}
                    value={`pnpm dev [--staging | --production]`}
                  />
                </div>
                <div className="px-5 py-4 space-y-3">
                  <CodeRow
                    label={"pnpm start (Production)"}
                    value={`pnpm start [--development | --staging]`}
                  />
                </div>
                <div
                  className={cn(
                    "px-5 py-4 space-y-3",
                    lang.name === "Node.js" && "hidden",
                  )}
                >
                  <CodeRow
                    label={"Build (Default --production)"}
                    value={`pnpm build [--development | --staging]`}
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
