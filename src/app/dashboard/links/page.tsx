"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Plus, Link2, Youtube, Music2, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { useProfile } from "@/hooks/queries/useProfile";
import { useReorderWidgets } from "@/hooks/mutations/useReorderWidgets";
import { creatorApi } from "@/lib/api";
import { usePreviewStore } from "@/store/usePreviewStore";
import { WidgetEditorCard } from "@/components/dashboard/WidgetEditorCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ContentType = "link" | "youtube" | "spotify" | "form";

const CONTENT_TYPES: { id: ContentType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "link",    label: "Link",     icon: <Link2 size={20} />,        color: "#3B82F6" },
  { id: "youtube", label: "YouTube",  icon: <Youtube size={20} />,      color: "#EF4444" },
  { id: "spotify", label: "Spotify",  icon: <Music2 size={20} />,       color: "#22C55E" },
  { id: "form",    label: "Form",     icon: <ClipboardList size={20} />, color: "#D4AF37" },
];

export default function LinksPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const reorderMutation = useReorderWidgets();
  const { addWidget: addToPreview, removeWidget, toggleWidget } = usePreviewStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeType, setActiveType] = useState<ContentType>("link");
  const [isAdding, setIsAdding] = useState(false);

  // Add link form state
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [spotifyUri, setSpotifyUri] = useState("");

  // Lead form state
  const [formTitle, setFormTitle] = useState("");
  const [formButtonLabel, setFormButtonLabel] = useState("");
  const [formSuccessMessage, setFormSuccessMessage] = useState("");
  const [formFields, setFormFields] = useState("email");

  const sensors = useSensors(
    // Pointer (mouse/stylus): só arrasta após mover 8px — deixa cliques normais passarem
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    // Touch (mobile): exige segurar 250ms antes de ativar — scroll livre enquanto não segura
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const sortedWidgets = profile
    ? [...profile.widgets].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedWidgets.findIndex((w) => w.id === active.id);
    const newIndex = sortedWidgets.findIndex((w) => w.id === over.id);

    const newOrder = [...sortedWidgets];
    const [moved] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, moved);

    reorderMutation.mutate(newOrder.map((w) => w.id));
  };

  const handleAddLink = async () => {
    if (!linkTitle.trim() || !linkUrl.trim()) {
      toast.error("Preencha título e URL.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "LINK",
        order: sortedWidgets.length,
        title: linkTitle.trim(),
        url: linkUrl.trim(),
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setLinkTitle("");
      setLinkUrl("");
      toast.success("Link adicionado!");
    } catch {
      toast.error("Erro ao adicionar link.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddVideo = async () => {
    if (!videoId.trim()) {
      toast.error("Informe o ID do vídeo.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "VIDEO",
        order: sortedWidgets.length,
        videoId: videoId.trim(),
        showControls: true,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setVideoId("");
      toast.success("Vídeo adicionado!");
    } catch {
      toast.error("Erro ao adicionar vídeo.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddSpotify = async () => {
    if (!spotifyUri.trim()) {
      toast.error("Informe o URI do Spotify.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "SPOTIFY",
        order: sortedWidgets.length,
        spotifyUri: spotifyUri.trim(),
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setSpotifyUri("");
      toast.success("Spotify adicionado!");
    } catch {
      toast.error("Erro ao adicionar Spotify.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddForm = async () => {
    if (!formTitle.trim()) {
      toast.error("Informe o título do formulário.");
      return;
    }
    const fields = formFields
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    if (fields.length === 0) {
      toast.error("Informe ao menos um campo.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "LEAD_FORM",
        order: sortedWidgets.length,
        title: formTitle.trim(),
        buttonLabel: formButtonLabel.trim() || "Enviar",
        successMessage: formSuccessMessage.trim() || "Obrigado! Entraremos em contato.",
        formFields: fields,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setFormTitle("");
      setFormButtonLabel("");
      setFormSuccessMessage("");
      setFormFields("email");
      toast.success("Formulário adicionado!");
    } catch {
      toast.error("Erro ao adicionar formulário.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdate = async (id: string, data: { title?: string; url?: string }) => {
    try {
      await creatorApi.updateWidget(id, data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch {
      toast.error("Erro ao salvar alterações.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await creatorApi.deleteWidget(id);
      removeWidget(id);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Link removido.");
    } catch {
      toast.error("Erro ao remover link.");
    }
  };

  const handleToggleVisibility = async (id: string) => {
    try {
      await creatorApi.toggleWidgetVisibility(id);
      toggleWidget(id);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch {
      toast.error("Erro ao alterar visibilidade.");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Links</h1>
          <p className="text-white/40 text-sm mt-0.5">
            Arraste para reordenar. Clique para editar.
          </p>
        </div>
        <Button
          onClick={() => setDialogOpen(true)}
          className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold"
        >
          <Plus size={16} className="mr-1.5" />
          Adicionar
        </Button>
      </div>

      {/* Widget list */}
      {sortedWidgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/10 rounded-2xl">
          <Link2 size={40} className="text-white/20 mb-3" strokeWidth={1.5} />
          <p className="text-white/40 font-medium">Nenhum link ainda</p>
          <p className="text-white/25 text-sm mt-1">Adicione seu primeiro link acima.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedWidgets.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              <AnimatePresence mode="popLayout" initial={false}>
                {sortedWidgets.map((widget) => (
                  <motion.div
                    key={widget.id}
                    layout
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -16, scale: 0.97, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  >
                    <WidgetEditorCard
                      widget={widget}
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setActiveType("link"); }}>
        <DialogContent className="bg-[#111113] border border-white/10 text-white w-[calc(100vw-2rem)] max-w-md mx-auto p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/8">
            <DialogTitle className="text-white font-semibold text-base">Adicionar conteúdo</DialogTitle>
          </DialogHeader>

          {/* Type selector grid */}
          <div className="grid grid-cols-4 gap-2 px-5 pt-4">
            {CONTENT_TYPES.map((ct) => {
              const isActive = activeType === ct.id;
              return (
                <button
                  key={ct.id}
                  onClick={() => setActiveType(ct.id)}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all duration-150"
                  style={{
                    background: isActive ? `${ct.color}18` : "rgba(255,255,255,0.04)",
                    borderColor: isActive ? `${ct.color}60` : "rgba(255,255,255,0.08)",
                    color: isActive ? ct.color : "rgba(255,255,255,0.45)",
                  }}
                >
                  <span style={{ color: isActive ? ct.color : "rgba(255,255,255,0.35)" }}>
                    {ct.icon}
                  </span>
                  <span className="text-xs font-medium">{ct.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form area */}
          <div className="px-5 pb-5 pt-4 space-y-3">
            {activeType === "link" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Título</Label>
                  <Input
                    value={linkTitle}
                    onChange={(e) => setLinkTitle(e.target.value)}
                    placeholder="Ex: Meu Instagram"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-[#3B82F6] focus-visible:border-[#3B82F6]/50 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">URL</Label>
                  <Input
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    type="url"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-[#3B82F6] focus-visible:border-[#3B82F6]/50 h-10"
                  />
                </div>
                <Button onClick={handleAddLink} disabled={isAdding} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold h-10 mt-1">
                  {isAdding ? "Adicionando..." : "Adicionar link"}
                </Button>
              </>
            )}

            {activeType === "youtube" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">ID do vídeo</Label>
                  <Input
                    value={videoId}
                    onChange={(e) => setVideoId(e.target.value)}
                    placeholder="Ex: dQw4w9WgXcQ"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-[#EF4444] focus-visible:border-[#EF4444]/50 h-10"
                  />
                  <p className="text-white/35 text-xs">
                    Cole o ID do final da URL: youtube.com/watch?v=<span className="text-white/55 font-mono">ID</span>
                  </p>
                </div>
                <Button onClick={handleAddVideo} disabled={isAdding} className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold h-10 mt-1">
                  {isAdding ? "Adicionando..." : "Adicionar vídeo"}
                </Button>
              </>
            )}

            {activeType === "spotify" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">URI do Spotify</Label>
                  <Input
                    value={spotifyUri}
                    onChange={(e) => setSpotifyUri(e.target.value)}
                    placeholder="spotify:track:4iV5W9uYEdYUVa79Axb7Rh"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E]/50 h-10"
                  />
                  <p className="text-white/35 text-xs">
                    No Spotify: clique em ··· → Compartilhar → Copiar URI.
                  </p>
                </div>
                <Button onClick={handleAddSpotify} disabled={isAdding} className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold h-10 mt-1">
                  {isAdding ? "Adicionando..." : "Adicionar Spotify"}
                </Button>
              </>
            )}

            {activeType === "form" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Título</Label>
                  <Input
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ex: Receba meu e-book grátis"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/50 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Campos <span className="normal-case text-white/35">(separados por vírgula)</span></Label>
                  <Input
                    value={formFields}
                    onChange={(e) => setFormFields(e.target.value)}
                    placeholder="email, nome, telefone"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/50 h-10"
                  />
                  <p className="text-white/35 text-xs">O campo "email" é obrigatório.</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Botão</Label>
                    <Input
                      value={formButtonLabel}
                      onChange={(e) => setFormButtonLabel(e.target.value)}
                      placeholder="Enviar"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-xs font-medium uppercase tracking-wide">Sucesso</Label>
                    <Input
                      value={formSuccessMessage}
                      onChange={(e) => setFormSuccessMessage(e.target.value)}
                      placeholder="Obrigado!"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/50 h-10"
                    />
                  </div>
                </div>
                <Button onClick={handleAddForm} disabled={isAdding} className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold h-10 mt-1">
                  {isAdding ? "Adicionando..." : "Adicionar formulário"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
