"use client";

import { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as LucideIcons from "lucide-react";
import {
  GripVertical,
  Link2,
  Youtube,
  Music2,
  Trash2,
  Type,
  Heart,
  Zap,
  ExternalLink,
  Image as ImageIcon,
  Smile,
  Sparkles,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ImageUploaderWidget } from "./ImageUploaderWidget";
import { IconPicker } from "./IconPicker";
import type { Widget } from "@/types/widget";
import { cn } from "@/lib/utils";
import { usePreviewStore } from "@/store/usePreviewStore";

interface WidgetEditorCardProps {
  widget: Widget;
  onUpdate: (id: string, data: { 
    title?: string; 
    url?: string; 
    thumbnail?: string;
    iconName?: string;
    animation?: "none" | "pulse" | "shake" | "bounce";
    schedule?: { startDate?: string; endDate?: string };
  }) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

function WidgetIcon({ widget }: { widget: Widget }) {
  if (widget.config.thumbnail) {
    /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={widget.config.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />;
  }

  if (widget.config.iconName) {
    const CustomIcon = (LucideIcons as any)[widget.config.iconName];
    if (CustomIcon) return <CustomIcon size={16} className="text-stylo-gold" />;
  }

  const type = widget.type;
  switch (type) {
    case "YOUTUBE":    return <Youtube size={16} className="text-red-400" />;
    case "SPOTIFY":    return <Music2 size={16} className="text-green-400" />;
    case "TEXT":       return <Type size={16} className="text-blue-400" />;
    case "TIKTOK":     return <svg width={16} height={16} viewBox="0 0 24 24" fill="white" className="opacity-70"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/></svg>;
    case "TWITCH":     return <svg width={16} height={16} viewBox="0 0 24 24" fill="#9146FF"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>;
    case "SOUNDCLOUD": return <svg width={16} height={16} viewBox="0 0 24 24" fill="#FF5500"><path d="M1.175 12.225c-.017 0-.033.002-.05.003a.427.427 0 00-.372.287l-.48 1.485.48 1.482c.04.14.168.24.323.24.155 0 .283-.1.323-.24l.543-1.482-.543-1.485a.338.338 0 00-.224-.29zm1.797-.578c-.024 0-.05.003-.073.01a.46.46 0 00-.37.33l-.41 1.76.41 1.755a.456.456 0 00.443.345.456.456 0 00.444-.345l.465-1.755-.465-1.76a.462.462 0 00-.444-.34zm1.87-.164a.55.55 0 00-.548.478l-.35 1.924.35 1.92a.55.55 0 001.096 0l.397-1.92-.397-1.924a.55.55 0 00-.548-.478zm1.898.023a.64.64 0 00-.637.559l-.298 1.9.298 1.896a.636.636 0 001.272 0l.337-1.896-.337-1.9a.637.637 0 00-.635-.559zm1.91-.398a.723.723 0 00-.723.636l-.253 2.298.253 2.3a.724.724 0 001.447 0l.286-2.3-.286-2.298a.724.724 0 00-.724-.636zm5.517 1.88c-.197-2.267-2.046-4.026-4.327-4.026a4.376 4.376 0 00-1.61.308.723.723 0 00-.485.68v7.796c0 .394.32.714.714.714h5.708a2.145 2.145 0 002.143-2.143 2.145 2.145 0 00-2.143-2.143zm2.572 0a.714.714 0 100 1.429.714.714 0 000-1.429z"/></svg>;
    case "TWITTER":       return <svg width={16} height={16} viewBox="0 0 24 24" fill="white" className="opacity-70"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case "DONATION_LINK": return <Heart size={16} className="text-[#FF5E5B]" />;
    case "PIX":           return <Zap size={16} className="text-[#32BCAD]" />;
    case "AFFILIATE_LINK":return <ExternalLink size={16} className="text-[#8B5CF6]" />;
    default:              return <Link2 size={16} className="text-stylo-gold" />;
  }
}

export function WidgetEditorCard({
  widget,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: WidgetEditorCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: widget.id });

  const { updateWidget } = usePreviewStore();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : undefined,
    scale: isDragging ? 1.02 : 1,
  };

  const [title, setTitle] = useState(widget.config.title ?? "");
  const [url, setUrl] = useState(widget.config.url ?? "");
  
  // Extra settings panels
  const [activePanel, setActivePanel] = useState<"VISUAL" | "ANIMATION" | "SCHEDULE" | null>(null);
  const [editorTab, setEditorTab] = useState<"IMAGE" | "ICON">(widget.config.iconName ? "ICON" : "IMAGE");
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle(widget.config.title ?? "");
    setUrl(widget.config.url ?? "");
  }, [widget.id, widget.config.title, widget.config.url]);

  const scheduleUpdate = (newTitle: string, newUrl: string, extras?: Partial<Widget["config"]>) => {
    // Immediate preview update (Optimistic)
    updateWidget(widget.id, { title: newTitle, url: newUrl, ...extras });

    // Debounced API call
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate(widget.id, { 
        title: newTitle, 
        url: newUrl, 
        ...extras
      });
    }, 1000);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    scheduleUpdate(val, url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    scheduleUpdate(title, val);
  };

  const handleThumbnailUpload = async (blob: Blob) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Optimistic update
      updateWidget(widget.id, { thumbnail: base64data, iconName: "" });
      // Real update
      onUpdate(widget.id, { thumbnail: base64data, iconName: "" });
    };
  };

  const handleIconSelect = (iconName: string) => {
    // Optimistic update
    updateWidget(widget.id, { iconName, thumbnail: "" });
    // Real update
    onUpdate(widget.id, { iconName, thumbnail: "" });
  };

  const handleAnimationSelect = (animation: any) => {
    // Optimistic update
    updateWidget(widget.id, { animation });
    // Real update
    onUpdate(widget.id, { animation });
  };

  const handleScheduleChange = (key: "startDate" | "endDate", value: string) => {
    const newSchedule = { ...widget.config.schedule, [key]: value };
    // Optimistic update
    updateWidget(widget.id, { schedule: newSchedule });
    // Real update
    onUpdate(widget.id, { schedule: newSchedule });
  };

  const togglePanel = (panel: "VISUAL" | "ANIMATION" | "SCHEDULE") => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const ANIMATIONS = [
    { id: "none", label: "Nenhuma" },
    { id: "pulse", label: "Pulsar" },
    { id: "shake", label: "Balançar" },
    { id: "bounce", label: "Pular" },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card border rounded-2xl overflow-hidden transition-all duration-300",
        isDragging 
          ? "border-stylo-gold/50 shadow-2xl shadow-black/20 ring-1 ring-stylo-gold/20" 
          : widget.isActive 
            ? "border-border" 
            : "border-border/50 opacity-60"
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="mt-2 text-muted-foreground/20 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing touch-none shrink-0"
          >
            <GripVertical size={20} />
          </button>

          {/* Icon/Thumbnail Preview */}
          <div className="mt-1 w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden group">
            <WidgetIcon widget={widget} />
          </div>

          {/* Crucial Fields */}
          <div className="flex-1 min-w-0 space-y-1">
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Título do link"
              className="w-full bg-transparent text-foreground text-sm font-bold placeholder:text-muted-foreground/30 focus:outline-none truncate"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://seu-link.com"
                className="flex-1 bg-transparent text-muted-foreground/60 text-xs font-medium placeholder:text-muted-foreground/20 focus:outline-none truncate"
              />
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex flex-col items-end gap-4 shrink-0">
            <Switch
              checked={widget.isActive}
              onCheckedChange={() => onToggleVisibility(widget.id)}
              className="data-[state=checked]:bg-stylo-gold"
            />
            <button
              onClick={() => onDelete(widget.id)}
              className="text-muted-foreground/20 hover:text-destructive transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Minimalist Control Buttons */}
        <div className="mt-5 flex items-center gap-2 pt-4 border-t border-border/40">
          <button
            onClick={() => togglePanel("VISUAL")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activePanel === "VISUAL" || widget.config.thumbnail || widget.config.iconName
                ? "bg-stylo-gold/10 text-stylo-gold"
                : "bg-muted/50 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
            )}
          >
            <ImageIcon size={14} />
            Visual
          </button>

          <button
            onClick={() => togglePanel("ANIMATION")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activePanel === "ANIMATION" || (widget.config.animation && widget.config.animation !== "none")
                ? "bg-stylo-gold/10 text-stylo-gold"
                : "bg-muted/50 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
            )}
          >
            <Sparkles size={14} />
            Animação
          </button>

          <button
            onClick={() => togglePanel("SCHEDULE")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              activePanel === "SCHEDULE" || widget.config.schedule?.startDate
                ? "bg-stylo-gold/10 text-stylo-gold"
                : "bg-muted/50 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground"
            )}
          >
            <Calendar size={14} />
            Agendar
          </button>
        </div>
      </div>

      {/* ── EXPANDABLE PANELS ──────────────────────────────── */}
      
      {/* Visual Panel (Thumb/Icon) */}
      {activePanel === "VISUAL" && (
        <div className="px-4 pb-5 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-4 border-b border-border/40 pb-2">
              <div className="flex gap-4">
                {["IMAGE", "ICON"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setEditorTab(tab as any)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest transition-colors",
                      editorTab === tab ? "text-stylo-gold" : "text-muted-foreground/40 hover:text-muted-foreground"
                    )}
                  >
                    {tab === "IMAGE" ? "Miniatura" : "Ícone Lucide"}
                  </button>
                ))}
              </div>
              {(widget.config.thumbnail || widget.config.iconName) && (
                <button 
                  onClick={() => {
                    updateWidget(widget.id, { thumbnail: "", iconName: "" });
                    onUpdate(widget.id, { thumbnail: "", iconName: "" });
                  }}
                  className="text-[10px] text-destructive hover:underline font-bold uppercase tracking-tighter"
                >
                  Limpar
                </button>
              )}
            </div>
            {editorTab === "IMAGE" ? (
              <ImageUploaderWidget
                onUpload={handleThumbnailUpload}
                currentImageUrl={widget.config.thumbnail}
              />
            ) : (
              <IconPicker
                onSelect={handleIconSelect}
                selectedIcon={widget.config.iconName}
              />
            )}
          </div>
        </div>
      )}

      {/* Animation Panel */}
      {activePanel === "ANIMATION" && (
        <div className="px-4 pb-5 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Estilo da Animação</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ANIMATIONS.map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => handleAnimationSelect(anim.id)}
                  className={cn(
                    "py-2 px-3 rounded-xl border text-[11px] font-bold transition-all",
                    (widget.config.animation || "none") === anim.id
                      ? "border-stylo-gold bg-stylo-gold/10 text-stylo-gold"
                      : "border-border bg-background text-muted-foreground hover:border-stylo-gold/30"
                  )}
                >
                  {anim.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Panel */}
      {activePanel === "SCHEDULE" && (
        <div className="px-4 pb-5 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-muted/30 rounded-2xl p-4 border border-border/50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-3">Agendamento de Exibição</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">Data de Início</label>
                <input 
                  type="datetime-local" 
                  value={widget.config.schedule?.startDate || ""}
                  onChange={(e) => handleScheduleChange("startDate", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-stylo-gold/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase pl-1">Data de Término</label>
                <input 
                  type="datetime-local" 
                  value={widget.config.schedule?.endDate || ""}
                  onChange={(e) => handleScheduleChange("endDate", e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-stylo-gold/50"
                />
              </div>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground/60 italic">O link ficará visível apenas entre estas datas.</p>
          </div>
        </div>
      )}
    </div>
  );
}
