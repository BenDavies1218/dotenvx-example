// apps/website/src/components/ExamplesGrid.jsx
import { languages } from '../data/languages'

const GITHUB_BASE = 'https://github.com/your-org/dotenvx-example/tree/main'

export function ExamplesGrid() {
  return (
    <section id="examples" className="max-w-4xl mx-auto px-6 py-20 border-t border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">Example projects</h2>
      <p className="text-gray-500 text-center mb-10 text-sm">
        Each example is a fully runnable minimal project.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((lang) => (
          <a
            key={lang.id}
            href={`${GITHUB_BASE}/${lang.examplePath}`}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col gap-2 p-5 border border-gray-200 rounded-xl hover:border-gray-400 transition-colors"
          >
            <img src={lang.image} alt={lang.name} className="w-8 h-8 object-contain" />
            <span className="text-sm font-semibold text-gray-900">{lang.name}</span>
            <span className="text-xs text-gray-500 leading-relaxed">{lang.description}</span>
            <span className="text-xs text-gray-400 group-hover:text-gray-700 transition-colors mt-auto pt-2">
              View example →
            </span>
          </a>
        ))}
      </div>
    </section>
  )
}
