// apps/website/src/components/ExamplesGrid.tsx
import { useState } from "react";
import { languages } from "../data/languages";

const GITHUB_BASE = "https://github.com/your-org/dotenvx-example/tree/main";

// inner ring: 4 items, outer ring: 6 items
const inner = languages.slice(0, 4);
const outer = languages.slice(4);

interface NodeStyle {
  size: number;
  bg: string;
  border: string;
}

// deterministic visual variation per language
const nodeStyles: NodeStyle[] = [
  { size: 56, bg: "bg-white", border: "border-gray-200" },
  { size: 52, bg: "bg-gray-50", border: "border-gray-300" },
  { size: 60, bg: "bg-white", border: "border-gray-200" },
  { size: 48, bg: "bg-gray-50", border: "border-gray-200" },
  { size: 52, bg: "bg-white", border: "border-gray-200" },
  { size: 56, bg: "bg-gray-50", border: "border-gray-300" },
  { size: 48, bg: "bg-white", border: "border-gray-200" },
  { size: 60, bg: "bg-gray-50", border: "border-gray-200" },
  { size: 52, bg: "bg-white", border: "border-gray-300" },
  { size: 56, bg: "bg-gray-50", border: "border-gray-200" },
];

interface Position {
  x: number;
  y: number;
}

function getPos(index: number, total: number, radiusPct: number, startAngle: number = -Math.PI / 2): Position {
  const angle = startAngle + (index / total) * 2 * Math.PI;
  return {
    x: 50 + radiusPct * Math.cos(angle),
    y: 50 + radiusPct * Math.sin(angle),
  };
}

interface Language {
  id: string;
  name: string;
  image: string;
  imageClass?: string;
  description: string;
  examplePath: string;
}

interface LangNodeProps {
  lang: Language;
  pos: Position;
  style: NodeStyle;
  hovered: boolean;
  onHover: (id: string | null) => void;
}

function LangNode({ lang, pos, style, hovered, onHover }: LangNodeProps): React.JSX.Element {
  const isLeft = pos.x < 50;
  const isTop = pos.y < 50;
  const imgSize = Math.round(style.size * 0.52);

  return (
    <div
      className="absolute"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: hovered ? 20 : 10,
      }}
      onMouseEnter={() => onHover(lang.id)}
      onMouseLeave={() => onHover(null)}
    >
      <a
        href={`${GITHUB_BASE}/${lang.examplePath}`}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center justify-center rounded-full border transition-all duration-200 cursor-pointer ${style.bg} ${style.border} ${hovered ? "scale-110 border-gray-400" : "hover:scale-105"}`}
        style={{ width: style.size, height: style.size }}
      >
        <img
          src={lang.image}
          alt={lang.name}
          className={lang.imageClass ?? ""}
          style={{ width: imgSize, height: imgSize, objectFit: "contain" }}
        />
      </a>

      {/* hover card */}
      {hovered && (
        <div
          className="absolute z-30 w-44 bg-white border border-gray-200 rounded-xl p-3 shadow-xl pointer-events-none"
          style={{
            [isLeft ? "right" : "left"]: "110%",
            [isTop ? "top" : "bottom"]: 0,
          }}
        >
          <p className="text-xs font-semibold text-gray-900 mb-1">
            {lang.name}
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            {lang.description}
          </p>
        </div>
      )}
    </div>
  );
}

export function ExamplesGrid(): React.JSX.Element {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section
      id="examples"
      className="max-w-4xl mx-auto px-6 py-20 border-y border-gray-800"
    >
      <h2 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
        Example projects
      </h2>
      <p className="text-gray-400 text-center mb-12 text-sm">
        Each example is a fully runnable minimal project. Hover to explore.
      </p>

      <div
        className="relative mx-auto"
        style={{ maxWidth: 520, aspectRatio: "1 / 1" }}
      >
        {/* orbit rings + spokes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* inner orbit */}
          <circle
            cx="50"
            cy="50"
            r="26"
            fill="none"
            stroke="#1f2937"
            strokeWidth="0.2"
            strokeDasharray="0.6 0.8"
          />
          {/* outer orbit */}
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#1f2937"
            strokeWidth="0.2"
            strokeDasharray="0.6 0.8"
          />
          {/* spokes to inner */}
          {inner.map((lang, i) => {
            const pos = getPos(i, inner.length, 26);
            return (
              <line
                key={lang.id}
                x1="50"
                y1="50"
                x2={pos.x}
                y2={pos.y}
                stroke="#1f2937"
                strokeWidth="0.15"
                strokeDasharray="0.5 0.7"
              />
            );
          })}
          {/* spokes to outer */}
          {outer.map((lang, i) => {
            const pos = getPos(
              i,
              outer.length,
              42,
              -Math.PI / 2 + Math.PI / outer.length,
            );
            return (
              <line
                key={lang.id}
                x1="50"
                y1="50"
                x2={pos.x}
                y2={pos.y}
                stroke="#1f2937"
                strokeWidth="0.12"
                strokeDasharray="0.4 0.8"
              />
            );
          })}
        </svg>

        {/* centre */}
        <div
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 15,
          }}
        >
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border border-gray-200 shadow-lg">
            <span className="text-xs font-bold text-gray-900 tracking-widest">
              envlock
            </span>
          </div>
        </div>

        {/* inner ring */}
        {inner.map((lang, i) => {
          const pos = getPos(i, inner.length, 26);
          return (
            <LangNode
              key={lang.id}
              lang={lang}
              pos={pos}
              style={nodeStyles[i]}
              hovered={hovered === lang.id}
              onHover={setHovered}
            />
          );
        })}

        {/* outer ring */}
        {outer.map((lang, i) => {
          const pos = getPos(
            i,
            outer.length,
            42,
            -Math.PI / 2 + Math.PI / outer.length,
          );
          return (
            <LangNode
              key={lang.id}
              lang={lang}
              pos={pos}
              style={nodeStyles[i + 4]}
              hovered={hovered === lang.id}
              onHover={setHovered}
            />
          );
        })}
      </div>
    </section>
  );
}
