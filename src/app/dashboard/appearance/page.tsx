"use client";

import { useState, useRef } from "react";
import { Loader2, Camera, User, Lock } from "lucide-react";
import { toast } from "sonner";

import { useProfile } from "@/hooks/queries/useProfile";
import { useUpdateTheme } from "@/hooks/mutations/useUpdateTheme";
import { creatorApi } from "@/lib/api";
import { usePreviewStore } from "@/store/usePreviewStore";
import { ColorPicker } from "@/components/dashboard/ColorPicker";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UpdateThemeRequest, BgType, ButtonStyle } from "@/types/profile";

const BG_TYPE_OPTIONS: { value: BgType; label: string }[] = [
  { value: "SOLID_COLOR", label: "Sólido" },
  { value: "GRADIENT", label: "Gradiente" },
  { value: "IMAGE", label: "Imagem" },
];

const BUTTON_STYLE_OPTIONS: { value: ButtonStyle; label: string; preview: string }[] = [
  { value: "ROUNDED", label: "Arredondado", preview: "rounded-xl" },
  { value: "SQUARED", label: "Reto", preview: "rounded" },
  { value: "PILL", label: "Pílula", preview: "rounded-full" },
];

export default function AppearancePage() {
  const { data: profile } = useProfile();
  const updateThemeMutation = useUpdateTheme();
  const updateThemePreview = usePreviewStore((s) => s.updateTheme);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [bgType, setBgType] = useState<BgType>(profile?.theme.bgType ?? "SOLID_COLOR");
  const [bgValue, setBgValue] = useState(profile?.theme.bgValue ?? "#09090B");
  const [primaryColor, setPrimaryColor] = useState(profile?.theme.primaryColor ?? "#D4AF37");
  const [textColor, setTextColor] = useState(profile?.theme.textColor ?? "#FFFFFF");
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>(
    profile?.theme.buttonStyle ?? "ROUNDED"
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const res = await creatorApi.uploadImage(file, "avatars");
      setAvatarUrl(res.data.url);
      toast.success("Avatar atualizado!");
    } catch {
      toast.error("Erro ao fazer upload.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    const themeData: UpdateThemeRequest = {
      bgType,
      bgValue,
      primaryColor,
      textColor,
      buttonStyle,
      isCustom: false,
    };
    setIsSaving(true);
    try {
      updateThemePreview(themeData);
      await updateThemeMutation.mutateAsync(themeData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = (
    setter: (v: string) => void,
    previewKey: keyof UpdateThemeRequest
  ) => (hex: string) => {
    setter(hex);
    updateThemePreview({ [previewKey]: hex });
  };

  const isPro = profile?.plan === "PRO";

  return (
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Aparência</h1>
        <p className="text-white/40 text-sm mt-0.5">Personalize o visual da sua página.</p>
      </div>

      {/* Avatar section */}
      <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full border-2 border-dashed border-white/20 hover:border-stylo-gold/50 transition-colors overflow-hidden group"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-white/25 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploadingAvatar ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <Camera size={18} className="text-white" />
              )}
            </div>
          </button>
          <div>
            <p className="text-white text-sm font-medium">Upload de avatar</p>
            <p className="text-white/40 text-xs mt-0.5">JPG, PNG ou WebP. Máx 5MB.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-stylo-gold text-xs hover:underline"
            >
              Escolher arquivo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
      </section>

      {/* Theme editor */}
      <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 space-y-6">
        <h2 className="text-white font-semibold">Tema</h2>

        {/* Background type */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Tipo de fundo</Label>
          <div className="flex gap-2">
            {BG_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setBgType(opt.value);
                  updateThemePreview({ bgType: opt.value });
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  bgType === opt.value
                    ? "border-stylo-gold bg-stylo-gold/10 text-stylo-gold"
                    : "border-white/10 text-white/50 hover:text-white hover:border-white/25"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Background value */}
        {bgType === "SOLID_COLOR" && (
          <ColorPicker
            label="Cor do fundo"
            value={bgValue}
            onChange={(hex) => {
              setBgValue(hex);
              updateThemePreview({ bgValue: hex });
            }}
          />
        )}
        {bgType === "GRADIENT" && (
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">CSS do gradiente</Label>
            <input
              type="text"
              value={bgValue}
              onChange={(e) => {
                setBgValue(e.target.value);
                updateThemePreview({ bgValue: e.target.value });
              }}
              placeholder="linear-gradient(135deg, #09090B 0%, #1a1a2e 100%)"
              className="w-full bg-stylo-dark border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-stylo-gold"
            />
          </div>
        )}
        {bgType === "IMAGE" && (
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">URL da imagem de fundo</Label>
            <input
              type="url"
              value={bgValue}
              onChange={(e) => {
                setBgValue(e.target.value);
                updateThemePreview({ bgValue: e.target.value });
              }}
              placeholder="https://..."
              className="w-full bg-stylo-dark border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-stylo-gold"
            />
          </div>
        )}

        {/* Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ColorPicker
            label="Cor primária (botões)"
            value={primaryColor}
            onChange={handleColorChange(setPrimaryColor, "primaryColor")}
          />
          <ColorPicker
            label="Cor do texto"
            value={textColor}
            onChange={handleColorChange(setTextColor, "textColor")}
          />
        </div>

        {/* Button style */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Estilo dos botões</Label>
          <div className="flex gap-3">
            {BUTTON_STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setButtonStyle(opt.value);
                  updateThemePreview({ buttonStyle: opt.value });
                }}
                className={`flex flex-col items-center gap-2 p-3 border rounded-xl transition-colors ${
                  buttonStyle === opt.value
                    ? "border-stylo-gold bg-stylo-gold/10"
                    : "border-white/10 hover:border-white/25"
                }`}
              >
                <div
                  className={`w-16 h-5 bg-stylo-gold/40 ${opt.preview}`}
                />
                <span
                  className={`text-xs ${
                    buttonStyle === opt.value ? "text-stylo-gold" : "text-white/50"
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PRO: Custom fonts (locked) */}
      {!isPro && (
        <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-stylo-dark/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-2xl">
            <Lock size={24} className="text-stylo-gold mb-2" />
            <p className="text-white font-semibold text-sm">Fontes personalizadas — PRO</p>
            <a href="/dashboard/billing" className="mt-2 text-stylo-gold text-xs hover:underline">
              Fazer upgrade
            </a>
          </div>
          <h2 className="text-white font-semibold mb-4 opacity-30">Fontes personalizadas</h2>
          <div className="h-16 bg-white/5 rounded-lg opacity-30" />
        </section>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || updateThemeMutation.isPending}
          className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold px-8 h-11"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
