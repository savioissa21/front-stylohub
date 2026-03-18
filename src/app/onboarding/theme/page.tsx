"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { creatorApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { UpdateThemeRequest } from "@/types/profile";

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: { bg: string; button: string; text: string };
  theme: UpdateThemeRequest;
}

const PRESETS: ThemePreset[] = [
  {
    id: "dark-gold",
    name: "Dark Gold",
    description: "Elegante e luxuoso",
    preview: { bg: "#09090B", button: "#D4AF37", text: "#FFFFFF" },
    theme: {
      bgType: "SOLID_COLOR",
      bgValue: "#09090B",
      primaryColor: "#D4AF37",
      textColor: "#FFFFFF",
      buttonStyle: "ROUNDED",
      isCustom: false,
      borderColor: "#D4AF37",
      shadowStyle: "NONE",
    },
  },
  {
    id: "pure-black",
    name: "Pure Black",
    description: "Minimalismo absoluto",
    preview: { bg: "#000000", button: "#FFFFFF", text: "#FFFFFF" },
    theme: {
      bgType: "SOLID_COLOR",
      bgValue: "#000000",
      primaryColor: "#FFFFFF",
      textColor: "#000000",
      buttonStyle: "SQUARED",
      isCustom: false,
      borderColor: "#FFFFFF",
      shadowStyle: "NONE",
    },
  },
  {
    id: "white-minimal",
    name: "White Minimal",
    description: "Limpo e profissional",
    preview: { bg: "#FAFAFA", button: "#111111", text: "#111111" },
    theme: {
      bgType: "SOLID_COLOR",
      bgValue: "#FAFAFA",
      primaryColor: "#111111",
      textColor: "#FAFAFA",
      buttonStyle: "PILL",
      isCustom: false,
      borderColor: "#111111",
      shadowStyle: "NONE",
    },
  },
  {
    id: "neon-purple",
    name: "Neon Purple",
    description: "Criativo e ousado",
    preview: { bg: "#0D0D1A", button: "#9B59B6", text: "#FFFFFF" },
    theme: {
      bgType: "SOLID_COLOR",
      bgValue: "#0D0D1A",
      primaryColor: "#9B59B6",
      textColor: "#FFFFFF",
      buttonStyle: "PILL",
      isCustom: false,
      borderColor: "#9B59B6",
      shadowStyle: "NONE",
    },
  },
];

export default function OnboardingThemePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>("dark-gold");
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    const preset = PRESETS.find((p) => p.id === selected);
    if (!preset) return;
    setIsSaving(true);
    try {
      await creatorApi.updateTheme(preset.theme);
      router.push("/onboarding/first-link");
    } catch {
      toast.error("Erro ao salvar tema. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-stylo-surface border border-white/10 rounded-2xl p-8">
      <div className="mb-6">
        <span className="text-xs font-semibold text-stylo-gold tracking-widest uppercase">
          Passo 2 de 3
        </span>
        <h1 className="text-2xl font-bold text-white mt-1">Escolha seu tema</h1>
        <p className="text-white/50 text-sm mt-1">
          Você poderá personalizar completamente depois.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        {PRESETS.map((preset) => {
          const isSelected = selected === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setSelected(preset.id)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-stylo-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              {/* Theme preview swatch */}
              <div
                className="w-full h-16 rounded-lg mb-3 flex items-end justify-center pb-2 gap-1.5"
                style={{ backgroundColor: preset.preview.bg }}
              >
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-4 rounded"
                    style={{
                      backgroundColor: preset.preview.button,
                      width: i === 1 ? "55%" : "35%",
                      opacity: i === 2 ? 0.6 : 1,
                    }}
                  />
                ))}
              </div>

              <p className="text-white font-semibold text-sm">{preset.name}</p>
              <p className="text-white/40 text-xs">{preset.description}</p>

              {/* Checkmark */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-stylo-gold flex items-center justify-center">
                  <Check size={11} className="text-black" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <Button
        onClick={handleContinue}
        disabled={isSaving}
        className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold h-11"
      >
        {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
        {isSaving ? "Salvando..." : "Continuar"}
      </Button>
    </div>
  );
}
