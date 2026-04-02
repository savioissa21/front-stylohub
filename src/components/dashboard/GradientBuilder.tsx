"use client";

import { useState, useEffect } from "react";
import { ColorPicker } from "./ColorPicker";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GradientState {
  color1: string;
  color2: string;
  angle: number;
}

interface GradientBuilderProps {
  value: string; // CSS gradient string stored in bgValue
  onChange: (css: string) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

// 3×3 compass grid — null = center placeholder
const COMPASS: ({ angle: number; arrow: string; title: string } | null)[] = [
  { angle: 315, arrow: "↖", title: "Diagonal superior-esquerdo" },
  { angle: 0,   arrow: "↑", title: "Para cima" },
  { angle: 45,  arrow: "↗", title: "Diagonal superior-direito" },
  { angle: 270, arrow: "←", title: "Para esquerda" },
  null, // center
  { angle: 90,  arrow: "→", title: "Para direita" },
  { angle: 225, arrow: "↙", title: "Diagonal inferior-esquerdo" },
  { angle: 180, arrow: "↓", title: "Para baixo" },
  { angle: 135, arrow: "↘", title: "Diagonal inferior-direito" },
];

const PRESETS: { name: string; color1: string; color2: string; angle: number }[] = [
  { name: "Pôr do Sol",  color1: "#F83600", color2: "#F9D423", angle: 135 },
  { name: "Oceano",      color1: "#2193B0", color2: "#6DD5ED", angle: 180 },
  { name: "Roxo",        color1: "#7B2FF7", color2: "#F107A3", angle: 135 },
  { name: "Esmeralda",   color1: "#11998E", color2: "#38EF7D", angle: 135 },
  { name: "Ouro",        color1: "#C8960C", color2: "#FFD200", angle: 90  },
  { name: "Meia-noite",  color1: "#141E30", color2: "#243B55", angle: 180 },
  { name: "Rosa suave",  color1: "#FF9A9E", color2: "#FECFEF", angle: 135 },
  { name: "Cósmico",     color1: "#0F0C29", color2: "#302B63", angle: 135 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildGradient({ color1, color2, angle }: GradientState): string {
  return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
}

function parseGradient(css: string): GradientState {
  // Try: linear-gradient(Ndeg, #RRGGBB, #RRGGBB)
  const m = css.match(
    /linear-gradient\(\s*(\d+)deg\s*,\s*(#[0-9a-fA-F]{6})\s*,\s*(#[0-9a-fA-F]{6})\s*\)/i
  );
  if (m) return { angle: parseInt(m[1]), color1: m[2], color2: m[3] };
  return { color1: "#09090B", color2: "#1a1a2e", angle: 135 };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GradientBuilder({ value, onChange }: GradientBuilderProps) {
  const [state, setState] = useState<GradientState>(() => parseGradient(value));

  // Keep in sync if parent resets value (e.g. preset palette applied)
  useEffect(() => {
    const parsed = parseGradient(value);
    setState(parsed);
  }, [value]);

  function update(patch: Partial<GradientState>) {
    const next = { ...state, ...patch };
    setState(next);
    onChange(buildGradient(next));
  }

  const previewCss = buildGradient(state);

  return (
    <div className="space-y-5">
      {/* Live preview strip */}
      <div
        className="w-full h-14 rounded-xl border border-border transition-all duration-300"
        style={{ background: previewCss }}
      />

      {/* Colors + direction */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-end gap-4">
        {/* Color 1 */}
        <ColorPicker
          label="Cor inicial"
          value={state.color1}
          onChange={(hex) => update({ color1: hex })}
        />

        {/* Compass direction selector */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-muted-foreground text-xs text-center">Direção</span>
          <div className="grid grid-cols-3 gap-1">
            {COMPASS.map((cell, i) =>
              cell === null ? (
                // Center placeholder — shows a dot representing the gradient midpoint
                <div
                  key={i}
                  className="w-8 h-8 rounded-md flex items-center justify-center"
                >
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
                </div>
              ) : (
                <button
                  key={i}
                  type="button"
                  title={cell.title}
                  onClick={() => update({ angle: cell.angle })}
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
                    state.angle === cell.angle
                      ? "bg-stylo-gold text-black font-bold"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cell.arrow}
                </button>
              )
            )}
          </div>
        </div>

        {/* Color 2 */}
        <ColorPicker
          label="Cor final"
          value={state.color2}
          onChange={(hex) => update({ color2: hex })}
        />
      </div>

      {/* Preset gradients */}
      <div className="space-y-2">
        <span className="text-muted-foreground text-xs">Gradientes prontos</span>
        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => {
            const css = buildGradient(p);
            const isActive =
              state.color1.toLowerCase() === p.color1.toLowerCase() &&
              state.color2.toLowerCase() === p.color2.toLowerCase() &&
              state.angle === p.angle;
            return (
              <button
                key={p.name}
                type="button"
                title={p.name}
                onClick={() => update({ color1: p.color1, color2: p.color2, angle: p.angle })}
                className={`group relative h-10 rounded-lg border-2 transition-all ${
                  isActive ? "border-stylo-gold scale-105" : "border-transparent hover:border-foreground/30"
                }`}
                style={{ background: css }}
              >
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 bg-black/80 text-white text-[10px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
