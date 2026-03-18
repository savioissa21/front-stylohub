"use client";

import { useState, useRef } from "react";
import { Loader2, Camera, User, Lock, Crown, Upload } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { useProfile } from "@/hooks/queries/useProfile";
import { useUpdateTheme } from "@/hooks/mutations/useUpdateTheme";
import { creatorApi } from "@/lib/api";
import { usePreviewStore } from "@/store/usePreviewStore";
import { ColorPicker } from "@/components/dashboard/ColorPicker";
import { GradientBuilder } from "@/components/dashboard/GradientBuilder";
import { UpgradeModal } from "@/components/dashboard/UpgradeModal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UpdateThemeRequest, BgType, ButtonStyle, ShadowStyle } from "@/types/profile";

// ─── Options ─────────────────────────────────────────────────────────────────

const BG_TYPE_OPTIONS: { value: BgType; label: string }[] = [
  { value: "SOLID_COLOR", label: "Sólido" },
  { value: "GRADIENT",   label: "Gradiente" },
  { value: "IMAGE",      label: "Imagem" },
];

// Quick-apply full theme palettes
interface ThemePalette {
  name: string;
  bg: string;
  primary: string;
  text: string;
  buttonStyle: ButtonStyle;
  preview: string; // gradient or solid CSS for the swatch
}

const QUICK_PALETTES: ThemePalette[] = [
  { name: "Dark Gold",     bg: "#09090B", primary: "#D4AF37", text: "#FFFFFF", buttonStyle: "ROUNDED",  preview: "linear-gradient(135deg, #09090B 60%, #D4AF3740)" },
  { name: "Pure White",    bg: "#F5F5F5", primary: "#111111", text: "#F5F5F5", buttonStyle: "PILL",     preview: "linear-gradient(135deg, #F5F5F5 60%, #11111130)" },
  { name: "Ocean Blue",    bg: "#0A0E1A", primary: "#4A9EFF", text: "#FFFFFF", buttonStyle: "ROUNDED",  preview: "linear-gradient(135deg, #0A0E1A 40%, #4A9EFF50)" },
  { name: "Rose Gold",     bg: "#1A0A0F", primary: "#FF6B8A", text: "#FFFFFF", buttonStyle: "PILL",     preview: "linear-gradient(135deg, #1A0A0F 40%, #FF6B8A50)" },
  { name: "Neon Purple",   bg: "#0D0A1A", primary: "#9B6BFF", text: "#FFFFFF", buttonStyle: "ROUNDED",  preview: "linear-gradient(135deg, #0D0A1A 40%, #9B6BFF50)" },
  { name: "Forest",        bg: "#071A0F", primary: "#3DDB82", text: "#FFFFFF", buttonStyle: "SQUARED",  preview: "linear-gradient(135deg, #071A0F 40%, #3DDB8250)" },
  { name: "Sunset Grad",   bg: "linear-gradient(135deg, #1A0505, #1A0A05)", primary: "#FF6B35", text: "#FFFFFF", buttonStyle: "PILL", preview: "linear-gradient(135deg, #F83600, #F9D423)" },
  { name: "Cósmico",       bg: "linear-gradient(180deg, #0F0C29, #302B63)", primary: "#A78BFF", text: "#FFFFFF", buttonStyle: "ROUNDED", preview: "linear-gradient(180deg, #0F0C29, #302B63)" },
];

const BUTTON_STYLE_OPTIONS: {
  value: ButtonStyle;
  label: string;
  preview: string;
  pro?: boolean;
}[] = [
  { value: "ROUNDED",     label: "Arredondado", preview: "rounded-xl" },
  { value: "SQUARED",     label: "Reto",        preview: "rounded" },
  { value: "PILL",        label: "Pílula",      preview: "rounded-full" },
  { value: "OUTLINE",     label: "Contorno",    preview: "rounded-xl", pro: true },
  { value: "HARD_SHADOW", label: "Brutalista",  preview: "rounded",    pro: true },
];

const SHADOW_OPTIONS: { value: ShadowStyle; label: string; desc: string }[] = [
  { value: "NONE", label: "Nenhuma",   desc: "Sem efeito" },
  { value: "SOFT", label: "Suave",     desc: "Sombra difusa" },
  { value: "GLOW", label: "Brilho",    desc: "Glow colorido" },
  { value: "HARD", label: "Dura",      desc: "Brutalista" },
];

// ─── PRO Lock overlay ─────────────────────────────────────────────────────────

function ProLock({ title, onUpgrade }: { title: string; onUpgrade: (f: string) => void }) {
  return (
    <section
      className="bg-stylo-surface border border-white/10 rounded-2xl p-6 relative overflow-hidden cursor-pointer group"
      onClick={() => onUpgrade(title)}
    >
      <div className="absolute inset-0 bg-stylo-dark/70 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 rounded-2xl gap-2 group-hover:bg-stylo-dark/60 transition-colors">
        <div className="w-9 h-9 rounded-xl bg-stylo-gold/15 border border-stylo-gold/30 flex items-center justify-center mb-1">
          <Crown size={18} className="text-stylo-gold" />
        </div>
        <p className="font-semibold text-sm text-stylo-gold">{title}</p>
        <p className="text-stylo-gold/60 text-xs">Clique para desbloquear no PRO</p>
      </div>
      <h2 className="text-white font-semibold mb-4 opacity-20">{title}</h2>
      <div className="h-20 bg-white/5 rounded-lg opacity-20" />
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AppearancePage() {
  const { data: profile } = useProfile();
  const updateThemeMutation = useUpdateTheme();
  const updateThemePreview = usePreviewStore((s) => s.updateTheme);
  const queryClient = useQueryClient();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatarUrl ?? null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Upgrade modal
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string | undefined>();
  const openUpgrade = (feature: string) => { setUpgradeFeature(feature); setUpgradeOpen(true); };

  const t = profile?.theme;

  const [bgType,       setBgType]       = useState<BgType>(t?.bgType ?? "SOLID_COLOR");
  const [bgValue,      setBgValue]      = useState(t?.bgValue ?? "#09090B");
  const [primaryColor, setPrimaryColor] = useState(t?.primaryColor ?? "#D4AF37");
  const [textColor,    setTextColor]    = useState(t?.textColor ?? "#FFFFFF");
  const [buttonStyle,  setButtonStyle]  = useState<ButtonStyle>(t?.buttonStyle ?? "ROUNDED");
  const [borderColor,  setBorderColor]  = useState(t?.borderColor ?? "#D4AF37");
  const [shadowStyle,  setShadowStyle]  = useState<ShadowStyle>(t?.shadowStyle ?? "NONE");
  const [isSaving,     setIsSaving]     = useState(false);

  const isPro = profile?.plan === "PRO";

  // Apply a full quick-palette in one click
  const applyPalette = (p: ThemePalette) => {
    const isGradient = p.bg.startsWith("linear-gradient");
    const newBgType: BgType = isGradient ? "GRADIENT" : "SOLID_COLOR";
    setBgType(newBgType);
    setBgValue(p.bg);
    setPrimaryColor(p.primary);
    setTextColor(p.text);
    setButtonStyle(p.buttonStyle);
    setBorderColor(p.primary);
    updateThemePreview({
      bgType: newBgType,
      bgValue: p.bg,
      primaryColor: p.primary,
      textColor: p.text,
      buttonStyle: p.buttonStyle,
      borderColor: p.primary,
    });
  };

  const uploadAvatar = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Ficheiro inválido. Use JPG, PNG ou WebP."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande. Máx 5 MB."); return; }
    setIsUploadingAvatar(true);
    try {
      const uploadRes = await creatorApi.uploadImage(file, "avatars");
      const url: string = uploadRes.data.url;
      await creatorApi.updateAvatar(url);
      setAvatarUrl(url);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Avatar atualizado!");
    } catch {
      toast.error("Erro ao fazer upload do avatar.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadAvatar(file);
  };

  const handleSave = async () => {
    const themeData: UpdateThemeRequest = {
      bgType,
      bgValue,
      primaryColor,
      textColor,
      buttonStyle,
      isCustom: false,
      borderColor,
      shadowStyle,
    };
    setIsSaving(true);
    try {
      updateThemePreview(themeData);
      await updateThemeMutation.mutateAsync(themeData);
    } finally {
      setIsSaving(false);
    }
  };

  const onColor = (setter: (v: string) => void, key: keyof UpdateThemeRequest) => (hex: string) => {
    setter(hex);
    updateThemePreview({ [key]: hex });
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl space-y-6 sm:space-y-8">
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} featureName={upgradeFeature} />
      <div>
        <h1 className="text-2xl font-bold text-white">Aparência</h1>
        <p className="text-white/40 text-sm mt-0.5">Personalize o visual da sua página.</p>
      </div>

      {/* Quick Palettes */}
      <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-white font-semibold">Paletas rápidas</h2>
          <p className="text-white/40 text-xs mt-0.5">Clique para aplicar um tema completo de uma vez.</p>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_PALETTES.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPalette(p)}
              title={p.name}
              className="group relative flex flex-col items-center gap-1.5"
            >
              {/* Swatch */}
              <div
                className="relative w-full h-12 rounded-xl border-2 border-white/10 group-hover:border-stylo-gold/50 transition-all group-hover:scale-105"
                style={{ background: p.preview }}
              >
                {/* Mini button preview dot */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-6 h-2 rounded-full opacity-90"
                  style={{ backgroundColor: p.primary }} />
              </div>
              <span className="text-white/40 text-[10px] text-center group-hover:text-white/70 transition-colors leading-tight">
                {p.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Avatar */}
      <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-white font-semibold">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          {/* Avatar preview */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-full border-2 border-dashed border-white/20 hover:border-stylo-gold/50 transition-colors overflow-hidden group shrink-0"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-white/25 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploadingAvatar
                ? <Loader2 size={18} className="text-white animate-spin" />
                : <Camera size={18} className="text-white" />}
            </div>
          </button>

          {/* Drag & drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 flex flex-col items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
              isDragOver
                ? "border-stylo-gold bg-stylo-gold/8 scale-[1.01]"
                : "border-white/10 hover:border-white/25 hover:bg-white/3"
            }`}
          >
            {isUploadingAvatar ? (
              <Loader2 size={20} className="text-stylo-gold animate-spin" />
            ) : (
              <Upload size={20} className={isDragOver ? "text-stylo-gold" : "text-white/30"} />
            )}
            <div className="text-center">
              <p className={`text-sm font-medium ${isDragOver ? "text-stylo-gold" : "text-white/50"}`}>
                {isUploadingAvatar ? "Enviando..." : isDragOver ? "Solte aqui" : "Arraste ou clique"}
              </p>
              <p className="text-white/25 text-xs mt-0.5">JPG, PNG ou WebP · máx 5 MB</p>
            </div>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
      </section>

      {/* Tema base */}
      <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 space-y-6">
        <h2 className="text-white font-semibold">Tema</h2>

        {/* Background type */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Tipo de fundo</Label>
          <div className="flex gap-2 flex-wrap">
            {BG_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setBgType(opt.value); updateThemePreview({ bgType: opt.value }); }}
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

        {bgType === "SOLID_COLOR" && (
          <ColorPicker
            label="Cor do fundo"
            value={bgValue}
            onChange={(hex) => { setBgValue(hex); updateThemePreview({ bgValue: hex }); }}
          />
        )}
        {bgType === "GRADIENT" && (
          <GradientBuilder
            value={bgValue}
            onChange={(css) => { setBgValue(css); updateThemePreview({ bgValue: css }); }}
          />
        )}
        {bgType === "IMAGE" && (
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">URL da imagem de fundo</Label>
            <input
              type="url"
              value={bgValue}
              onChange={(e) => { setBgValue(e.target.value); updateThemePreview({ bgValue: e.target.value }); }}
              placeholder="https://..."
              className="w-full bg-stylo-dark border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-stylo-gold"
            />
          </div>
        )}

        {/* Colors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ColorPicker label="Cor primária (botões)" value={primaryColor} onChange={onColor(setPrimaryColor, "primaryColor")} />
          <ColorPicker label="Cor do texto"          value={textColor}    onChange={onColor(setTextColor, "textColor")} />
        </div>

        {/* Button style */}
        <div className="space-y-2">
          <Label className="text-white/70 text-sm">Estilo dos botões</Label>
          <div className="flex flex-wrap gap-3">
            {BUTTON_STYLE_OPTIONS.map((opt) => {
              const isSelected = buttonStyle === opt.value;
              const isLocked = !!opt.pro && !isPro;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (isLocked) { openUpgrade("Estilos de botão PRO"); return; }
                    setButtonStyle(opt.value);
                    updateThemePreview({ buttonStyle: opt.value });
                  }}
                  disabled={false}
                  className={`relative flex flex-col items-center gap-2 p-3 border rounded-xl transition-colors ${
                    isSelected
                      ? "border-stylo-gold bg-stylo-gold/10"
                      : isLocked
                      ? "border-white/5 opacity-50 cursor-not-allowed"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  {isLocked && <Lock size={10} className="absolute top-1.5 right-1.5 text-stylo-gold opacity-70" />}
                  <div
                    className={`w-16 h-5 ${opt.preview} ${
                      opt.value === "OUTLINE"
                        ? "bg-transparent border-2 border-stylo-gold/60"
                        : "bg-stylo-gold/40"
                    }`}
                    style={
                      opt.value === "HARD_SHADOW"
                        ? { boxShadow: "3px 3px 0px rgba(255,255,255,0.2)" }
                        : undefined
                    }
                  />
                  <span className={`text-xs ${isSelected ? "text-stylo-gold" : "text-white/50"}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRO: Cor de borda / destaque */}
      {isPro ? (
        <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-stylo-gold" />
            <h2 className="text-white font-semibold">Cor de borda / destaque</h2>
          </div>
          <p className="text-white/40 text-xs -mt-2">
            Usada no estilo Contorno, sombra Dura e borda do avatar.
          </p>
          <ColorPicker label="Cor de borda" value={borderColor} onChange={onColor(setBorderColor, "borderColor")} />
        </section>
      ) : (
        <ProLock title="Cor de borda / destaque" onUpgrade={openUpgrade} />
      )}

      {/* PRO: Efeito de sombra */}
      {isPro ? (
        <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-stylo-gold" />
            <h2 className="text-white font-semibold">Efeito nos botões</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SHADOW_OPTIONS.map((opt) => {
              const isSelected = shadowStyle === opt.value;
              const previewShadow =
                opt.value === "SOFT" ? "0 4px 14px rgba(0,0,0,0.40)" :
                opt.value === "GLOW" ? `0 0 18px 4px ${primaryColor}66` :
                opt.value === "HARD" ? `4px 4px 0px ${borderColor}` :
                "none";

              return (
                <button
                  key={opt.value}
                  onClick={() => { setShadowStyle(opt.value); updateThemePreview({ shadowStyle: opt.value }); }}
                  className={`flex flex-col items-center gap-3 p-4 border rounded-xl transition-colors ${
                    isSelected
                      ? "border-stylo-gold bg-stylo-gold/10"
                      : "border-white/10 hover:border-white/25"
                  }`}
                >
                  <div
                    className="w-14 h-6 rounded-lg"
                    style={{ backgroundColor: primaryColor, boxShadow: previewShadow }}
                  />
                  <div className="text-center">
                    <p className={`text-xs font-medium ${isSelected ? "text-stylo-gold" : "text-white/70"}`}>
                      {opt.label}
                    </p>
                    <p className="text-white/30 text-[10px] mt-0.5">{opt.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <ProLock title="Efeito nos botões" onUpgrade={openUpgrade} />
      )}

      {/* PRO: Fontes personalizadas (locked) */}
      {!isPro && <ProLock title="Fontes personalizadas" onUpgrade={openUpgrade} />}

      {/* Save */}
      <div className="flex justify-end pb-4">
        <Button
          onClick={handleSave}
          disabled={isSaving || updateThemeMutation.isPending}
          className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold px-8 h-11"
        >
          {isSaving && <Loader2 className="animate-spin mr-2" size={16} />}
          {isSaving ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </div>
  );
}
