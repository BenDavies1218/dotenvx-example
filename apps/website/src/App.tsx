import { useEffect, useState } from "react";
import "./App.css";
import { Hero } from "./components/Hero";
import { HowItWorks } from "./components/HowItWorks";
import { LanguageShowcase } from "./components/LanguageShowcase";
import { ExamplesGrid } from "./components/ExamplesGrid";
import { InstallCTA } from "./components/InstallCTA";
import { GitHubActions } from "./components/GitHubActions";
import { OnePasswordCI } from "./components/OnePasswordCI";
import { DotPattern } from "./components/DotPattern";
import { WhyItsGood } from "./components/WhyItsGood";

interface ColorStop {
  r: number;
  g: number;
  b: number;
}

// scroll color stops: green → orange → yellow → blue
const COLOR_STOPS: ColorStop[] = [
  { r: 187, g: 247, b: 208 }, // green-200
  { r: 254, g: 215, b: 170 }, // orange-200
  { r: 254, g: 240, b: 138 }, // yellow-200
  { r: 191, g: 219, b: 254 }, // blue-200
];

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t);
}

function getScrollColor(): string {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const progress = total > 0 ? Math.min(scrolled / total, 1) : 0;

  const scaled = progress * (COLOR_STOPS.length - 1);
  const index = Math.floor(scaled);
  const t = scaled - index;

  const from = COLOR_STOPS[Math.min(index, COLOR_STOPS.length - 1)];
  const to = COLOR_STOPS[Math.min(index + 1, COLOR_STOPS.length - 1)];

  const r = lerp(from.r, to.r, t);
  const g = lerp(from.g, to.g, t);
  const b = lerp(from.b, to.b, t);

  return `rgb(${r},${g},${b})`;
}

export default function App(): React.JSX.Element {
  const [gradientColor, setGradientColor] =
    useState<string>("rgb(187,247,208)");

  useEffect(() => {
    function onScroll(): void {
      setGradientColor(getScrollColor());
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* scroll-reactive colour wash */}
      <div
        className="pointer-events-none fixed inset-0 transition-colors duration-300"
        style={{
          background: `linear-gradient(to bottom right, ${gradientColor}, transparent)`,
        }}
      />
      <DotPattern
        glow={false}
        className="fixed inset-0 w-full h-full text-gray-300/60 mask-[radial-gradient(ellipse_80%_50%_at_50%_0%,white,transparent)]"
      />
      <div className="relative z-10">
        <Hero />
        <WhyItsGood />
        <HowItWorks />
        <LanguageShowcase />
        <ExamplesGrid />
        <GitHubActions />
        <OnePasswordCI />
        <InstallCTA />
        <footer className="text-center py-8 text-xs text-gray-400">
          envlock — MIT License — created by{" "}
          <a
            href="https://github.com/BenDavies1218"
            target="_blank"
            rel="noopener noreferrer"
          >
            Benjamin Davies
          </a>
        </footer>
      </div>
    </div>
  );
}
