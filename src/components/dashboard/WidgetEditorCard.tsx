"use client";

import { useState, useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { Widget } from "@/types/widget";

interface WidgetEditorCardProps {
  widget: Widget;
  onUpdate: (id: string, data: { title?: string; url?: string }) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

function WidgetIcon({ type }: { type: Widget["type"] }) {
  switch (type) {
    case "YOUTUBE":    return <Youtube size={16} className="text-red-400" />;
    case "SPOTIFY":    return <Music2 size={16} className="text-green-400" />;
    case "TEXT":       return <Type size={16} className="text-blue-400" />;
    case "TIKTOK":     return <svg width={16} height={16} viewBox="0 0 24 24" fill="white" className="opacity-70"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/></svg>;
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 50 : undefined,
    scale: isDragging ? 1.02 : 1,
  };

  const [title, setTitle] = useState(widget.config.title ?? "");
  const [url, setUrl] = useState(widget.config.url ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when widget prop changes (e.g. after reorder)
  useEffect(() => {
    setTitle(widget.config.title ?? "");
    setUrl(widget.config.url ?? "");
  }, [widget.id, widget.config.title, widget.config.url]);

  const scheduleUpdate = (newTitle: string, newUrl: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onUpdate(widget.id, { title: newTitle, url: newUrl });
    }, 1000);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    scheduleUpdate(e.target.value, url);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    scheduleUpdate(title, e.target.value);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-xl overflow-hidden transition-all duration-300 ${
        isDragging 
          ? "border-stylo-gold/50 shadow-2xl shadow-black/20 ring-1 ring-stylo-gold/20" 
          : widget.isActive 
            ? "border-border" 
            : "border-border/50 opacity-60"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-muted-foreground/30 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing touch-none p-1 -ml-1"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical size={18} />
        </button>

        {/* Widget icon */}
        <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
          <WidgetIcon type={widget.type} />
        </div>

        {/* Editable fields */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {widget.type === "DONATION_LINK" || widget.type === "PIX" || widget.type === "AFFILIATE_LINK" ? (
            <span className="w-full text-foreground text-sm font-bold truncate block pb-0.5">
              {widget.type === "DONATION_LINK"
                ? widget.config.title || "Doação"
                : widget.type === "PIX"
                ? widget.config.title || "PIX"
                : widget.config.title || "Afiliado"}
            </span>
          ) : (
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Título do link"
              className="w-full bg-transparent text-foreground text-sm font-bold placeholder:text-muted-foreground/30 focus:outline-none border-b border-transparent focus:border-stylo-gold/30 pb-0.5 transition-all truncate"
            />
          )}
          {(widget.type === "LINK" || widget.type === "YOUTUBE") && (
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://..."
              className="w-full bg-transparent text-muted-foreground/60 text-[11px] font-medium placeholder:text-muted-foreground/20 focus:outline-none border-b border-transparent focus:border-stylo-gold/20 pb-0.5 transition-all truncate"
            />
          )}
          {widget.type === "DONATION_LINK" && (
            <p className="w-full text-muted-foreground/60 text-[11px] font-medium truncate pb-0.5">
              {widget.config.url}
            </p>
          )}
          {widget.type === "PIX" && (
            <p className="w-full text-muted-foreground/60 text-[11px] font-medium truncate pb-0.5 uppercase tracking-wide">
              {widget.config.pixKeyType} · {widget.config.pixKey}
            </p>
          )}
          {widget.type === "AFFILIATE_LINK" && (
            <p className="w-full text-muted-foreground/60 text-[11px] font-medium truncate pb-0.5">
              /r/{widget.config.code}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <Switch
            checked={widget.isActive}
            onCheckedChange={() => onToggleVisibility(widget.id)}
            className="data-[state=checked]:bg-stylo-gold"
          />
          <button
            onClick={() => onDelete(widget.id)}
            className="text-muted-foreground/30 hover:text-destructive transition-colors p-1 -mr-1"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
