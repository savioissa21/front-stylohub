"use client";

import React, { useState, cloneElement, type ReactElement } from "react";
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
import { Plus, Link2, Youtube, Music2, ClipboardList, MessageCircle, Heart, Zap, ExternalLink } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  extractTikTokVideoId,
  extractTwitchInfo,
  extractSoundCloudUrl,
  extractTweetId,
} from "@/lib/embed-extractors";

type ContentType = "link" | "youtube" | "spotify" | "whatsapp" | "form" | "tiktok" | "twitch" | "soundcloud" | "twitter" | "donation" | "pix" | "affiliate";

const CONTENT_TYPES: { id: ContentType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "link",      label: "Link",       icon: <Link2 size={18} />,         color: "#3B82F6" },
  { id: "youtube",   label: "YouTube",    icon: <Youtube size={18} />,       color: "#EF4444" },
  { id: "spotify",   label: "Spotify",    icon: <Music2 size={18} />,        color: "#22C55E" },
  { id: "whatsapp",  label: "WhatsApp",   icon: <MessageCircle size={18} />, color: "#25D366" },
  { id: "form",      label: "Form",       icon: <ClipboardList size={18} />, color: "#D4AF37" },
  { id: "tiktok",     label: "TikTok",      icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.16 8.16 0 004.77 1.52V7.12a4.85 4.85 0 01-1-.43z"/></svg>, color: "#010101" },
  { id: "twitch",     label: "Twitch",      icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>, color: "#9146FF" },
  { id: "soundcloud", label: "SoundCloud",  icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M1.175 12.225c-.017 0-.033.002-.05.003a.427.427 0 00-.372.287l-.48 1.485.48 1.482c.04.14.168.24.323.24.155 0 .283-.1.323-.24l.543-1.482-.543-1.485a.338.338 0 00-.224-.29zm1.797-.578c-.024 0-.05.003-.073.01a.46.46 0 00-.37.33l-.41 1.76.41 1.755a.456.456 0 00.443.345.456.456 0 00.444-.345l.465-1.755-.465-1.76a.462.462 0 00-.444-.34zm1.87-.164a.55.55 0 00-.548.478l-.35 1.924.35 1.92a.55.55 0 001.096 0l.397-1.92-.397-1.924a.55.55 0 00-.548-.478zm1.898.023a.64.64 0 00-.637.559l-.298 1.9.298 1.896a.636.636 0 001.272 0l.337-1.896-.337-1.9a.637.637 0 00-.635-.559zm1.91-.398a.723.723 0 00-.723.636l-.253 2.298.253 2.3a.724.724 0 001.447 0l.286-2.3-.286-2.298a.724.724 0 00-.724-.636zm5.517 1.88c-.197-2.267-2.046-4.026-4.327-4.026a4.376 4.376 0 00-1.61.308.723.723 0 00-.485.68v7.796c0 .394.32.714.714.714h5.708a2.145 2.145 0 002.143-2.143 2.145 2.145 0 00-2.143-2.143zm2.572 0a.714.714 0 100 1.429.714.714 0 000-1.429z"/></svg>, color: "#FF5500" },
  { id: "twitter",    label: "Twitter/X",   icon: <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.633zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, color: "#000000" },
  { id: "donation",   label: "Doação",   icon: <Heart size={18} />,       color: "#FF5E5B" },
  { id: "pix",        label: "PIX",      icon: <Zap size={18} />,         color: "#32BCAD" },
  { id: "affiliate",  label: "Afiliado", icon: <ExternalLink size={18} />, color: "#8B5CF6" },
];

// ─── Preview Component ───────────────────────────────────────────────────────

function AddLinkPreview({ 
  type, 
  title, 
  url, 
  color, 
  icon 
}: { 
  type: ContentType; 
  title: string; 
  url: string; 
  color: string; 
  icon: React.ReactNode 
}) {
  const displayTitle = title || (
    type === "link" ? "Seu link aqui" : 
    type === "whatsapp" ? "WhatsApp" :
    type === "youtube" ? "Vídeo do YouTube" :
    `Meu ${type.charAt(0).toUpperCase() + type.slice(1)}`
  );
  
  return (
    <div className="flex flex-col items-center pt-10 pb-12 bg-[#09090B] border-t border-white/5 relative overflow-hidden group">
      {/* Premium Background Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-stylo-gold/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-stylo-gold/5 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center w-full px-6">
        <div className="mb-8 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-stylo-gold font-bold uppercase tracking-[0.4em] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">Visualização Premium</span>
          <div className="h-[2px] w-10 bg-gradient-to-r from-transparent via-stylo-gold/40 to-transparent rounded-full" />
        </div>

        {/* The Phone - iPhone 15 Pro style mockup */}
        <div className="relative group/phone transition-all duration-700 hover:translate-y-[-4px] scale-[0.85] origin-top">
          {/* Outer Glow based on brand color */}
          <div 
            className="absolute inset-0 rounded-[3.5rem] blur-[45px] opacity-20 transition-all duration-1000 group-hover/phone:opacity-40" 
            style={{ backgroundColor: color }} 
          />
          
          {/* Metal Frame (Titanium look) */}
          <div className="relative w-[260px] h-[340px] rounded-[3.5rem] p-[10px] bg-gradient-to-b from-[#333] via-[#1a1a1a] to-[#000] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/20">
            
            {/* Screen Glass */}
            <div className="relative w-full h-full rounded-[2.8rem] bg-[#050505] overflow-hidden flex flex-col border border-white/5 shadow-inner">
              
              {/* Internal Glass Reflection shimmer */}
              <div className="absolute top-0 left-[-100%] w-[300%] h-[100%] bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent rotate-[35deg] pointer-events-none z-30 animate-[shimmer_8s_infinite]" />
              
              {/* Dynamic Island */}
              <div className="absolute top-0 left-0 right-0 h-8 flex justify-center items-start pt-2.5 z-40">
                <div className="w-20 h-5 bg-black rounded-full border border-white/10 flex items-center justify-between px-3 shadow-lg">
                  <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  <div className="flex gap-1 items-center">
                    <div className="w-0.5 h-0.5 rounded-full bg-green-500/60 shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
                    <div className="w-2 h-2 rounded-full bg-indigo-500/40 blur-[1px] relative">
                       <div className="absolute inset-0.5 bg-indigo-400/60 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Screen Content */}
              <div className="flex-1 pt-12 px-5 flex flex-col items-center">
                {/* Profile Skeleton - High End */}
                <div className="relative mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/15 to-transparent p-[1px] shadow-2xl">
                     <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15),transparent)] animate-pulse" />
                     </div>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-black rounded-full border border-white/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-stylo-gold/40 shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
                  </div>
                </div>
                
                <div className="h-2.5 w-24 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-full mb-2" />
                <div className="h-1.5 w-32 bg-white/5 rounded-full mb-8" />
                
                {/* PREVIEW WIDGET - Ultra Premium Card */}
                <div className="w-full relative group/widget">
                   <div 
                      className="w-full flex items-center gap-3 p-3.5 rounded-[1rem] border backdrop-blur-xl transition-all duration-500 cursor-default relative z-10"
                      style={{
                        backgroundColor: `${color}12`,
                        borderColor: `${color}25`,
                        boxShadow: `0 8px 30px -10px ${color}50`,
                      }}
                   >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.5)] transition-all duration-500 group-hover/widget:scale-110"
                        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)`, color: 'white' }}
                      >
                        {cloneElement(icon as ReactElement, { size: 16, strokeWidth: 2.5 })}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[12px] tracking-tight text-white truncate">
                          {displayTitle}
                        </div>
                        {url && (
                          <div className="text-[9px] text-white/40 truncate font-semibold mt-0.5">
                            {url.replace(/^https?:\/\/(www\.)?/, '')}
                          </div>
                        )}
                      </div>
                      <ExternalLink size={8} className="text-white/20" />
                   </div>
                </div>

                {/* Other Links Skeletons - Very subtle */}
                <div className="w-full mt-3 space-y-2 opacity-[0.02]">
                  <div className="w-full h-12 rounded-xl bg-white" />
                  <div className="w-full h-12 rounded-xl bg-white" />
                </div>
              </div>

              {/* Home Bar */}
              <div className="h-6 flex justify-center items-center pb-2 z-40">
                <div className="w-20 h-1 bg-white/10 rounded-full shadow-inner" />
              </div>
            </div>
          </div>
          
          {/* High-end Reflection shadow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-4 bg-black/60 blur-xl rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  // WhatsApp state
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [waTitle, setWaTitle] = useState("");

  // Lead form state
  const [formTitle, setFormTitle] = useState("");
  const [formButtonLabel, setFormButtonLabel] = useState("");
  const [formSuccessMessage, setFormSuccessMessage] = useState("");
  const [formFields, setFormFields] = useState("email");

  // TikTok state
  const [tikTokUrl, setTikTokUrl] = useState("");
  const [tikTokIdDetected, setTikTokIdDetected] = useState<string | null>(null);

  // Twitch state
  const [twitchUrl, setTwitchUrl] = useState("");
  const [twitchInfoDetected, setTwitchInfoDetected] = useState<ReturnType<typeof extractTwitchInfo>>(null);

  // SoundCloud state
  const [soundCloudUrl, setSoundCloudUrl] = useState("");
  const [soundCloudDetected, setSoundCloudDetected] = useState<string | null>(null);

  // Twitter state
  const [twitterUrl, setTwitterUrl] = useState("");
  const [tweetIdDetected, setTweetIdDetected] = useState<string | null>(null);

  // Donation state
  const [donationPlatform, setDonationPlatform] = useState<"KOFI" | "BUYMEACOFFEE" | "PAYPAL" | "OUTRO">("KOFI");
  const [donationUrl, setDonationUrl] = useState("");
  const [donationTitle, setDonationTitle] = useState("");

  // PIX state
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState<"CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "ALEATORIA">("EMAIL");
  const [pixTitle, setPixTitle] = useState("");

  // Affiliate state
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [affiliateTitle, setAffiliateTitle] = useState("");

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
        type: "YOUTUBE",
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

  const handleAddWhatsApp = async () => {
    const digits = waPhone.replace(/\D/g, "");
    if (digits.length < 8) {
      toast.error("Informe um número válido com DDD e DDI.");
      return;
    }
    setIsAdding(true);
    try {
      const url = waMessage.trim()
        ? `https://wa.me/${digits}?text=${encodeURIComponent(waMessage.trim())}`
        : `https://wa.me/${digits}`;
      const res = await creatorApi.addWidget({
        type: "LINK",
        order: sortedWidgets.length,
        title: waTitle.trim() || "WhatsApp",
        url,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setWaPhone("");
      setWaMessage("");
      setWaTitle("");
      toast.success("WhatsApp adicionado!");
    } catch {
      toast.error("Erro ao adicionar WhatsApp.");
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

  const handleAddTikTok = async () => {
    if (!tikTokIdDetected) {
      toast.error("Cole uma URL válida do TikTok.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "TIKTOK",
        order: sortedWidgets.length,
        videoId: tikTokIdDetected,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setTikTokUrl("");
      setTikTokIdDetected(null);
      toast.success("TikTok adicionado!");
    } catch {
      toast.error("Erro ao adicionar TikTok.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddTwitch = async () => {
    if (!twitchInfoDetected) {
      toast.error("Cole uma URL válida do Twitch.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "TWITCH",
        order: sortedWidgets.length,
        twitchChannel: twitchInfoDetected.channel,
        twitchClipSlug: twitchInfoDetected.clipSlug,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setTwitchUrl("");
      setTwitchInfoDetected(null);
      toast.success("Twitch adicionado!");
    } catch {
      toast.error("Erro ao adicionar Twitch.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddSoundCloud = async () => {
    if (!soundCloudDetected) {
      toast.error("Cole uma URL válida do SoundCloud.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "SOUNDCLOUD",
        order: sortedWidgets.length,
        url: soundCloudDetected,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setSoundCloudUrl("");
      setSoundCloudDetected(null);
      toast.success("SoundCloud adicionado!");
    } catch {
      toast.error("Erro ao adicionar SoundCloud.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddTwitter = async () => {
    if (!tweetIdDetected) {
      toast.error("Cole uma URL válida de tweet.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "TWITTER",
        order: sortedWidgets.length,
        twitterTweetId: tweetIdDetected,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setTwitterUrl("");
      setTweetIdDetected(null);
      toast.success("Tweet adicionado!");
    } catch {
      toast.error("Erro ao adicionar tweet.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddDonation = async () => {
    if (!donationUrl.trim()) {
      toast.error("Informe a URL de doação.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "DONATION_LINK",
        order: sortedWidgets.length,
        donationPlatform,
        url: donationUrl.trim(),
        title: donationTitle.trim() || undefined,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setDonationUrl("");
      setDonationTitle("");
      setDonationPlatform("KOFI");
      toast.success("Doação adicionada!");
    } catch {
      toast.error("Erro ao adicionar doação.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddPix = async () => {
    if (!pixKey.trim()) {
      toast.error("Informe a chave PIX.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "PIX",
        order: sortedWidgets.length,
        pixKey: pixKey.trim(),
        pixKeyType,
        title: pixTitle.trim() || undefined,
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setPixKey("");
      setPixTitle("");
      toast.success("PIX adicionado!");
    } catch {
      toast.error("Erro ao adicionar PIX.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddAffiliate = async () => {
    if (!affiliateUrl.trim() || !affiliateTitle.trim()) {
      toast.error("Preencha URL e título.");
      return;
    }
    setIsAdding(true);
    try {
      const res = await creatorApi.addWidget({
        type: "AFFILIATE_LINK",
        order: sortedWidgets.length,
        url: affiliateUrl.trim(),
        title: affiliateTitle.trim(),
      });
      addToPreview(res.data);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setDialogOpen(false);
      setAffiliateUrl("");
      setAffiliateTitle("");
      toast.success("Afiliado adicionado!");
    } catch (err: unknown) {
      const axiosMsg: string =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "";
      toast.error(
        axiosMsg.includes("PRO")
          ? "Recurso exclusivo do plano PRO 🔒"
          : "Erro ao adicionar afiliado."
      );
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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Links</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
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
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-2xl">
          <Link2 size={40} className="text-muted-foreground/30 mb-3" strokeWidth={1.5} />
          <p className="text-muted-foreground font-medium">Nenhum link ainda</p>
          <p className="text-muted-foreground/40 text-sm mt-1">Adicione seu primeiro link acima.</p>
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
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) {
          setActiveType("link");
          setTikTokUrl(""); setTikTokIdDetected(null);
          setTwitchUrl(""); setTwitchInfoDetected(null);
          setSoundCloudUrl(""); setSoundCloudDetected(null);
          setTwitterUrl(""); setTweetIdDetected(null);
          setDonationUrl(""); setDonationTitle(""); setDonationPlatform("KOFI");
          setPixKey(""); setPixTitle(""); setPixKeyType("EMAIL");
          setAffiliateUrl(""); setAffiliateTitle("");
        }
      }}>
        <DialogContent className="bg-card border border-border text-foreground w-[calc(100vw-2rem)] max-w-md mx-auto p-0 overflow-hidden rounded-2xl flex flex-col max-h-[90vh]">
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/50 shrink-0">
            <DialogTitle className="text-foreground font-semibold text-base">Adicionar conteúdo</DialogTitle>
            <DialogDescription className="text-muted-foreground/60 text-xs">
              Escolha o tipo de conteúdo e veja a prévia abaixo.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Type selector grid */}
            <div className="grid grid-cols-5 gap-1.5 px-5 pt-4">
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
                    <span className="text-[10px] font-medium">{ct.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form area */}
            <div className="px-5 pb-8 pt-4 space-y-3">
              {activeType === "link" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Título</Label>
                    <Input
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="Ex: Meu Instagram"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#3B82F6] focus-visible:border-[#3B82F6]/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">URL</Label>
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      type="url"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#3B82F6] focus-visible:border-[#3B82F6]/50 h-10"
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
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">ID do vídeo</Label>
                    <Input
                      value={videoId}
                      onChange={(e) => setVideoId(e.target.value)}
                      placeholder="Ex: dQw4w9WgXcQ"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#EF4444] focus-visible:border-[#EF4444]/50 h-10"
                    />
                    <p className="text-muted-foreground/60 text-xs">
                      Cole o ID do final da URL: youtube.com/watch?v=<span className="text-foreground/55 font-mono">ID</span>
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
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">URI do Spotify</Label>
                    <Input
                      value={spotifyUri}
                      onChange={(e) => setSpotifyUri(e.target.value)}
                      placeholder="spotify:track:4iV5W9uYEdYUVa79Axb7Rh"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E]/50 h-10"
                    />
                    <p className="text-muted-foreground/60 text-xs">
                      No Spotify: clique em ··· → Compartilhar → Copiar URI.
                    </p>
                  </div>
                  <Button onClick={handleAddSpotify} disabled={isAdding} className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold h-10 mt-1">
                    {isAdding ? "Adicionando..." : "Adicionar Spotify"}
                  </Button>
                </>
              )}

              {activeType === "whatsapp" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Número (com DDI e DDD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-sm font-mono">+</span>
                      <Input
                        value={waPhone}
                        onChange={(e) => setWaPhone(e.target.value)}
                        placeholder="55 11 99999-9999"
                        type="tel"
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#25D366] focus-visible:border-[#25D366]/50 h-10 pl-6"
                      />
                    </div>
                    <p className="text-muted-foreground/60 text-xs">Ex: 5511999999999 — código do país + DDD + número</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">
                      Mensagem automática <span className="normal-case text-muted-foreground/60">(opcional)</span>
                    </Label>
                    <Input
                      value={waMessage}
                      onChange={(e) => setWaMessage(e.target.value)}
                      placeholder="Olá! Vim pelo seu link..."
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#25D366] focus-visible:border-[#25D366]/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">
                      Título do botão <span className="normal-case text-muted-foreground/60">(padrão: WhatsApp)</span>
                    </Label>
                    <Input
                      value={waTitle}
                      onChange={(e) => setWaTitle(e.target.value)}
                      placeholder="WhatsApp"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#25D366] focus-visible:border-[#25D366]/50 h-10"
                    />
                  </div>
                  <Button onClick={handleAddWhatsApp} disabled={isAdding} className="w-full font-semibold h-10 mt-1 text-white" style={{ background: "#25D366" }}>
                    {isAdding ? "Adicionando..." : "Adicionar WhatsApp"}
                  </Button>
                </>
              )}

              {activeType === "form" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Título</Label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Receba meu e-book grátis"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Campos <span className="normal-case text-muted-foreground/60">(separados por vírgula)</span></Label>
                    <Input
                      value={formFields}
                      onChange={(e) => setFormFields(e.target.value)}
                      placeholder="email, nome, telefone"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/50 h-10"
                    />
                    <p className="text-muted-foreground/60 text-xs">O campo "email" é obrigatório.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Botão</Label>
                      <Input
                        value={formButtonLabel}
                        onChange={(e) => setFormButtonLabel(e.target.value)}
                        placeholder="Enviar"
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/50 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Sucesso</Label>
                      <Input
                        value={formSuccessMessage}
                        onChange={(e) => setFormSuccessMessage(e.target.value)}
                        placeholder="Obrigado!"
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold focus-visible:border-stylo-gold/50 h-10"
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddForm} disabled={isAdding} className="w-full btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold h-10 mt-1">
                    {isAdding ? "Adicionando..." : "Adicionar formulário"}
                  </Button>
                </>
              )}

              {activeType === "tiktok" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Link do vídeo</Label>
                    <Input
                      value={tikTokUrl}
                      onChange={(e) => {
                        setTikTokUrl(e.target.value);
                        setTikTokIdDetected(extractTikTokVideoId(e.target.value));
                      }}
                      placeholder="https://www.tiktok.com/@user/video/..."
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#010101] focus-visible:border-[#010101]/50 h-10"
                    />
                    {tikTokUrl && (
                      <p className={`text-xs ${tikTokIdDetected ? "text-green-400" : "text-red-400"}`}>
                        {tikTokIdDetected ? `✓ ID detectado: ${tikTokIdDetected}` : "URL inválida para TikTok"}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleAddTikTok} disabled={isAdding || !tikTokIdDetected} className="w-full font-semibold h-10 mt-1 text-white bg-black hover:bg-zinc-900">
                    {isAdding ? "Adicionando..." : "Adicionar TikTok"}
                  </Button>
                </>
              )}

              {activeType === "twitch" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Link do canal ou clip</Label>
                    <Input
                      value={twitchUrl}
                      onChange={(e) => {
                        setTwitchUrl(e.target.value);
                        setTwitchInfoDetected(extractTwitchInfo(e.target.value));
                      }}
                      placeholder="https://www.twitch.tv/channelname"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 h-10"
                      style={{ "--tw-ring-color": "#9146FF" } as React.CSSProperties}
                    />
                    {twitchUrl && (
                      <p className={`text-xs ${twitchInfoDetected ? "text-green-400" : "text-red-400"}`}>
                        {twitchInfoDetected
                          ? twitchInfoDetected.isClip
                            ? `✓ Clip: ${twitchInfoDetected.clipSlug}`
                            : `✓ Canal: ${twitchInfoDetected.channel}`
                          : "URL inválida para Twitch"}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleAddTwitch} disabled={isAdding || !twitchInfoDetected} className="w-full font-semibold h-10 mt-1 text-white" style={{ background: "#9146FF" }}>
                    {isAdding ? "Adicionando..." : "Adicionar Twitch"}
                  </Button>
                </>
              )}

              {activeType === "soundcloud" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Link da faixa ou playlist</Label>
                    <Input
                      value={soundCloudUrl}
                      onChange={(e) => {
                        setSoundCloudUrl(e.target.value);
                        setSoundCloudDetected(extractSoundCloudUrl(e.target.value));
                      }}
                      placeholder="https://soundcloud.com/artista/faixa"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 h-10"
                    />
                    {soundCloudUrl && (
                      <p className={`text-xs ${soundCloudDetected ? "text-green-400" : "text-red-400"}`}>
                        {soundCloudDetected ? "✓ URL válida" : "URL inválida para SoundCloud"}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleAddSoundCloud} disabled={isAdding || !soundCloudDetected} className="w-full font-semibold h-10 mt-1 text-white" style={{ background: "#FF5500" }}>
                    {isAdding ? "Adicionando..." : "Adicionar SoundCloud"}
                  </Button>
                </>
              )}

              {activeType === "twitter" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Link do tweet</Label>
                    <Input
                      value={twitterUrl}
                      onChange={(e) => {
                        setTwitterUrl(e.target.value);
                        setTweetIdDetected(extractTweetId(e.target.value));
                      }}
                      placeholder="https://x.com/user/status/..."
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 h-10"
                    />
                    {twitterUrl && (
                      <p className={`text-xs ${tweetIdDetected ? "text-green-400" : "text-red-400"}`}>
                        {tweetIdDetected ? `✓ Tweet ID: ${tweetIdDetected}` : "URL inválida — use o link completo do tweet"}
                      </p>
                    )}
                  </div>
                  <Button onClick={handleAddTwitter} disabled={isAdding || !tweetIdDetected} className="w-full font-semibold h-10 mt-1 text-white bg-black hover:bg-zinc-900">
                    {isAdding ? "Adicionando..." : "Adicionar Tweet"}
                  </Button>
                </>
              )}

              {activeType === "donation" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Plataforma</Label>
                    <select
                      value={donationPlatform}
                      onChange={(e) => setDonationPlatform(e.target.value as typeof donationPlatform)}
                      className="w-full h-10 rounded-md bg-muted/50 border border-border text-foreground text-sm px-3 focus:outline-none focus:ring-1 focus:ring-[#FF5E5B]"
                    >
                      <option value="KOFI">Ko-fi</option>
                      <option value="BUYMEACOFFEE">Buy Me a Coffee</option>
                      <option value="PAYPAL">PayPal</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">URL</Label>
                    <Input
                      value={donationUrl}
                      onChange={(e) => setDonationUrl(e.target.value)}
                      placeholder="https://ko-fi.com/seuperfil"
                      type="url"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#FF5E5B] focus-visible:border-[#FF5E5B]/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Título (opcional)</Label>
                    <Input
                      value={donationTitle}
                      onChange={(e) => setDonationTitle(e.target.value)}
                      placeholder="Me apoie ☕"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#FF5E5B] focus-visible:border-[#FF5E5B]/50 h-10"
                    />
                  </div>
                  <Button onClick={handleAddDonation} disabled={isAdding} className="w-full bg-[#FF5E5B] hover:bg-[#e54d4a] text-white font-semibold h-10 mt-1">
                    {isAdding ? "Adicionando..." : "Adicionar doação"}
                  </Button>
                </>
              )}

              {activeType === "pix" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Tipo de chave</Label>
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value as typeof pixKeyType)}
                      className="w-full h-10 rounded-md bg-muted/50 border border-border text-foreground text-sm px-3 focus:outline-none focus:ring-1 focus:ring-[#32BCAD]"
                    >
                      <option value="CPF">CPF</option>
                      <option value="CNPJ">CNPJ</option>
                      <option value="EMAIL">E-mail</option>
                      <option value="TELEFONE">Telefone</option>
                      <option value="ALEATORIA">Chave aleatória</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Chave PIX</Label>
                    <Input
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="sua@chave.pix"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#32BCAD] focus-visible:border-[#32BCAD]/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Título (opcional)</Label>
                    <Input
                      value={pixTitle}
                      onChange={(e) => setPixTitle(e.target.value)}
                      placeholder="Me pague um café ☕"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#32BCAD] focus-visible:border-[#32BCAD]/50 h-10"
                    />
                  </div>
                  <Button onClick={handleAddPix} disabled={isAdding} className="w-full font-semibold h-10 mt-1 text-white" style={{ backgroundColor: "#32BCAD" }}>
                    {isAdding ? "Adicionando..." : "Adicionar PIX"}
                  </Button>
                </>
              )}

              {activeType === "affiliate" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">Título</Label>
                    <Input
                      value={affiliateTitle}
                      onChange={(e) => setAffiliateTitle(e.target.value)}
                      placeholder="Meu produto afiliado"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6]/50 h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/60 text-xs font-medium uppercase tracking-wide">URL destino</Label>
                    <Input
                      value={affiliateUrl}
                      onChange={(e) => setAffiliateUrl(e.target.value)}
                      placeholder="https://hotmart.com/produto/xyz"
                      type="url"
                      className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-[#8B5CF6] focus-visible:border-[#8B5CF6]/50 h-10"
                    />
                    <p className="text-muted-foreground/60 text-xs">
                      A URL real nunca é exposta — visitantes são redirecionados via código curto.
                    </p>
                  </div>
                  <Button onClick={handleAddAffiliate} disabled={isAdding} className="w-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-semibold h-10 mt-1">
                    {isAdding ? "Adicionando..." : "Adicionar afiliado 🔒 PRO"}
                  </Button>
                </>
              )}
            </div>

            {/* Real-time Preview at the bottom */}
            {(() => {
              const activeContentType = CONTENT_TYPES.find(ct => ct.id === activeType);
              if (!activeContentType) return null;

              let currentTitle = "";
              let currentUrl = "";

              switch(activeType) {
                case "link":      currentTitle = linkTitle; currentUrl = linkUrl; break;
                case "youtube":   currentTitle = "Vídeo do YouTube"; currentUrl = videoId ? `youtube.com/watch?v=${videoId}` : ""; break;
                case "spotify":   currentTitle = "Spotify"; currentUrl = spotifyUri; break;
                case "whatsapp":  currentTitle = waTitle || "WhatsApp"; currentUrl = waPhone; break;
                case "form":      currentTitle = formTitle; currentUrl = "Formulário de captura"; break;
                case "tiktok":    currentTitle = "TikTok"; currentUrl = tikTokUrl; break;
                case "twitch":    currentTitle = "Twitch"; currentUrl = twitchUrl; break;
                case "soundcloud": currentTitle = "SoundCloud"; currentUrl = soundCloudUrl; break;
                case "twitter":   currentTitle = "Twitter/X"; currentUrl = twitterUrl; break;
                case "donation":  currentTitle = donationTitle || "Doação"; currentUrl = donationUrl; break;
                case "pix":       currentTitle = pixTitle || "PIX"; currentUrl = pixKey; break;
                case "affiliate": currentTitle = affiliateTitle; currentUrl = affiliateUrl; break;
              }

              return (
                <AddLinkPreview 
                  type={activeType}
                  title={currentTitle}
                  url={currentUrl}
                  color={activeContentType.color}
                  icon={activeContentType.icon}
                />
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
