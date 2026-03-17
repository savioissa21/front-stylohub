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
    case "VIDEO":
      return <Youtube size={16} className="text-red-400" />;
    case "SPOTIFY":
      return <Music2 size={16} className="text-green-400" />;
    case "TEXT":
      return <Type size={16} className="text-blue-400" />;
    default:
      return <Link2 size={16} className="text-stylo-gold" />;
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
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
      className={`bg-stylo-surface border rounded-xl overflow-hidden transition-colors ${
        widget.isActive ? "border-white/10" : "border-white/5 opacity-60"
      }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing transition-colors touch-none"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical size={18} />
        </button>

        {/* Widget icon */}
        <div className="w-8 h-8 rounded-lg bg-stylo-dark flex items-center justify-center shrink-0">
          <WidgetIcon type={widget.type} />
        </div>

        {/* Editable fields */}
        <div className="flex-1 min-w-0 space-y-1">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="Título do link"
            className="w-full bg-transparent text-white text-sm font-medium placeholder:text-white/25 focus:outline-none border-b border-transparent focus:border-white/20 pb-0.5 transition-colors truncate"
          />
          {(widget.type === "LINK" || widget.type === "VIDEO") && (
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://..."
              className="w-full bg-transparent text-white/40 text-xs placeholder:text-white/20 focus:outline-none border-b border-transparent focus:border-white/10 pb-0.5 transition-colors truncate"
            />
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
            className="text-white/20 hover:text-red-400 transition-colors p-1 -mr-1"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
