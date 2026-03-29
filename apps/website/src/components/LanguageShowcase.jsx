// apps/website/src/components/LanguageShowcase.jsx
import { useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { languages, getConfigSnippet } from '../data/languages'

SyntaxHighlighter.registerLanguage('javascript', js)

// GitHub base URL — update when repo is public
const GITHUB_BASE = 'https://github.com/your-org/dotenvx-example/tree/main'

export function LanguageShowcase() {
  const [active, setActive] = useState(languages[0].id)
  const lang = languages.find((l) => l.id === active)
  const configFile = lang.configFile ?? 'envlock.config.js'

  return (
    <section id="showcase" className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">Works with any language</h2>
      <p className="text-gray-500 text-center mb-10 text-sm">
        envlock is a CLI wrapper — it works with any runtime.
      </p>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {languages.map((l) => (
          <button
            key={l.id}
            onClick={() => setActive(l.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === l.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <img src={l.image} alt={l.name} className="w-4 h-4 object-contain" />
            {l.name}
          </button>
        ))}
      </div>

      {/* Code panel */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2">
            <img src={lang.image} alt={lang.name} className="w-5 h-5 object-contain" />
            <span className="text-sm font-medium text-gray-700">{lang.name} — {lang.description}</span>
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

        {/* Config file snippet */}
        <div className="px-5 pt-4 pb-1">
          <p className="text-xs font-mono text-gray-400 mb-1">{configFile}</p>
          <SyntaxHighlighter
            language="javascript"
            style={githubGist}
            customStyle={{ background: 'transparent', padding: 0, margin: 0, fontSize: '0.8125rem' }}
          >
            {getConfigSnippet(lang)}
          </SyntaxHighlighter>
        </div>

        {/* Run command */}
        <div className="px-5 pb-5 pt-2">
          <p className="text-xs font-mono text-gray-400 mb-1">Run</p>
          <code className="text-sm font-mono text-gray-800 bg-gray-50 border border-gray-200 rounded px-3 py-2 block">
            npx envlock dev
          </code>
        </div>
      </div>
    </section>
  )
}
