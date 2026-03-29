import './App.css'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { LanguageShowcase } from './components/LanguageShowcase'
import { ExamplesGrid } from './components/ExamplesGrid'
import { InstallCTA } from './components/InstallCTA'

export default function App() {
  return (
    <div className="min-h-screen">
      <Hero />
      <HowItWorks />
      <LanguageShowcase />
      <ExamplesGrid />
      <InstallCTA />
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-100">
        envlock — MIT License
      </footer>
    </div>
  )
}
