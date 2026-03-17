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
import { Plus, Link2, Youtube, Music2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LinksPage() {
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const reorderMutation = useReorderWidgets();
  const { addWidget: addToPreview, removeWidget, toggleWidget } = usePreviewStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Add link form state
  const [linkTitle, setLinkTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [spotifyUri, setSpotifyUri] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
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
              {sortedWidgets.map((widget) => (
                <WidgetEditorCard
                  key={widget.id}
                  widget={widget}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-stylo-surface border-white/10 text-white w-[calc(100vw-2rem)] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar conteúdo</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="link">
            <TabsList className="bg-stylo-dark border border-white/10 w-full">
              <TabsTrigger value="link" className="flex-1 data-[state=active]:bg-stylo-gold/20 data-[state=active]:text-stylo-gold">
                <Link2 size={14} className="mr-1.5" />
                Link
              </TabsTrigger>
              <TabsTrigger value="youtube" className="flex-1 data-[state=active]:bg-stylo-gold/20 data-[state=active]:text-stylo-gold">
                <Youtube size={14} className="mr-1.5" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="spotify" className="flex-1 data-[state=active]:bg-stylo-gold/20 data-[state=active]:text-stylo-gold">
                <Music2 size={14} className="mr-1.5" />
                Spotify
              </TabsTrigger>
            </TabsList>

            {/* Link tab */}
            <TabsContent value="link" className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">Título</Label>
                <Input
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Ex: Meu Instagram"
                  className="bg-stylo-dark border-white/10 text-white placeholder:text-white/30 focus-visible:ring-stylo-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">URL</Label>
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  type="url"
                  className="bg-stylo-dark border-white/10 text-white placeholder:text-white/30 focus-visible:ring-stylo-gold"
                />
              </div>
              <Button
                onClick={handleAddLink}
                disabled={isAdding}
                className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold"
              >
                {isAdding ? "Adicionando..." : "Adicionar link"}
              </Button>
            </TabsContent>

            {/* YouTube tab */}
            <TabsContent value="youtube" className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">ID do vídeo</Label>
                <Input
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  placeholder="Ex: dQw4w9WgXcQ"
                  className="bg-stylo-dark border-white/10 text-white placeholder:text-white/30 focus-visible:ring-stylo-gold"
                />
                <p className="text-white/30 text-xs">
                  Encontre o ID no final da URL do YouTube: youtube.com/watch?v=<strong className="text-white/50">ID</strong>
                </p>
              </div>
              <Button
                onClick={handleAddVideo}
                disabled={isAdding}
                className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold"
              >
                {isAdding ? "Adicionando..." : "Adicionar vídeo"}
              </Button>
            </TabsContent>

            {/* Spotify tab */}
            <TabsContent value="spotify" className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="text-white/70 text-sm">URI do Spotify</Label>
                <Input
                  value={spotifyUri}
                  onChange={(e) => setSpotifyUri(e.target.value)}
                  placeholder="spotify:track:..."
                  className="bg-stylo-dark border-white/10 text-white placeholder:text-white/30 focus-visible:ring-stylo-gold"
                />
                <p className="text-white/30 text-xs">
                  Clique em Compartilhar → Copiar URI no Spotify.
                </p>
              </div>
              <Button
                onClick={handleAddSpotify}
                disabled={isAdding}
                className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold"
              >
                {isAdding ? "Adicionando..." : "Adicionar Spotify"}
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
