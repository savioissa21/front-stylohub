"use client";

import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/queries/useProfile";
import { creatorApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Copy, Check, Trash2, Camera, Loader2, User, Save } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // SEO state
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isSavingSeo, setIsSavingSeo] = useState(false);

  useEffect(() => {
    if (profile?.avatarUrl) setAvatarUrl(profile.avatarUrl);
    if (profile) {
      setDisplayName(profile.displayName ?? "");
      setBio(profile.bio ?? "");
      setSeoTitle(profile.seoTitle ?? "");
      setSeoDescription(profile.seoDescription ?? "");
    }
  }, [profile?.avatarUrl, profile?.displayName, profile?.bio, profile?.seoTitle, profile?.seoDescription]);

  const handleSaveProfileInfo = async () => {
    setIsSavingSeo(true);
    try {
      await creatorApi.updateProfileInfo({ displayName, bio });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado!");
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSavingSeo(false);
    }
  };

  const handleSaveSeo = async () => {
    setIsSavingSeo(true);
    try {
      await creatorApi.updateSeo({ seoTitle, seoDescription });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("SEO atualizado!");
    } catch {
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSavingSeo(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Use JPG, PNG ou WebP."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande. Máx 5 MB."); return; }
    setIsUploading(true);
    try {
      const uploadRes = await creatorApi.uploadImage(file, "avatars");
      const url: string = uploadRes.data.url;
      await creatorApi.updateAvatar(url);
      setAvatarUrl(url);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto atualizada!");
    } catch {
      toast.error("Erro ao fazer upload da foto.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const profileUrl = `https://stylohub.io/${profile?.username ?? ""}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteAccount = () => {
    // In a real app, call DELETE /api/creator/account
    toast.error("Funcionalidade em desenvolvimento. Entre em contato com o suporte.");
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Gerencie sua conta e preferências.</p>
      </div>

      {/* Avatar */}
      <section className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-foreground font-semibold mb-4">Foto de perfil</h2>
        <div className="flex items-center gap-5">
          {/* Avatar circle */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="relative w-20 h-20 rounded-full border-2 border-dashed border-border hover:border-stylo-gold/50 transition-colors overflow-hidden group shrink-0 disabled:opacity-60"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={28} className="text-muted-foreground/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {isUploading
                ? <Loader2 size={18} className="text-white animate-spin" />
                : <Camera size={18} className="text-white" />}
            </div>
          </button>

          <div className="flex-1 space-y-2">
            <p className="text-foreground/70 text-sm">
              {avatarUrl ? "Clique na foto para trocar" : "Ainda sem foto de perfil"}
            </p>
            <p className="text-muted-foreground/60 text-xs">JPG, PNG ou WebP. Máx 5 MB.</p>
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold text-xs h-8"
            >
              {isUploading ? (
                <><Loader2 size={13} className="mr-1.5 animate-spin" />Enviando...</>
              ) : (
                <><Camera size={13} className="mr-1.5" />{avatarUrl ? "Trocar foto" : "Adicionar foto"}</>
              )}
            </Button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarUpload}
        />
      </section>

      {/* Account info */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <h2 className="text-foreground font-semibold">Informações da conta</h2>

        <div className="space-y-1.5">
          <Label className="text-foreground/70 text-sm">Nome de usuário</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60 text-sm bg-background border border-border rounded-md px-3 py-2">
              @
            </span>
            <Input
              value={profile?.username ?? user?.username ?? ""}
              readOnly
              className="bg-background border-border text-foreground/70 cursor-not-allowed"
            />
          </div>
          <p className="text-muted-foreground/40 text-xs">Para alterar o nome de usuário, contate o suporte.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-foreground/70 text-sm">E-mail</Label>
          <Input
            value={user?.email ?? ""}
            readOnly
            className="bg-background border-border text-foreground/70 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-foreground/70 text-sm">URL do seu perfil</Label>
          <div className="flex gap-2">
            <Input
              value={profileUrl}
              readOnly
              className="bg-background border-border text-muted-foreground flex-1"
            />
            <Button
              type="button"
              onClick={handleCopyUrl}
              variant="outline"
              className="border-border text-foreground/70 hover:text-foreground bg-transparent shrink-0"
            >
              {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
            </Button>
          </div>
        </div>
      </section>

      {/* Perfil público */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-foreground font-semibold">Perfil público</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Informações visíveis na sua página pública.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground/70 text-sm">Nome de exibição</Label>
            <span className={`text-xs font-mono ${displayName.length > 75 ? "text-yellow-400" : "text-muted-foreground/40"}`}>
              {displayName.length}/80
            </span>
          </div>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={80}
            placeholder="Seu nome ou apelido"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold"
          />
          <p className="text-muted-foreground/40 text-xs">Aparece na sua página pública como título principal.</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground/70 text-sm">Bio</Label>
            <span className={`text-xs font-mono ${bio.length > 150 ? "text-red-400" : "text-muted-foreground/40"}`}>
              {bio.length}/160
            </span>
          </div>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={160}
            placeholder="Ex: Designer & criador de conteúdo. Links e projetos aqui ↓"
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-stylo-gold/50 transition-colors"
          />
          <p className="text-muted-foreground/40 text-xs">Aparece abaixo do nome na página pública.</p>
        </div>

        <Button
          onClick={handleSaveProfileInfo}
          disabled={isSavingSeo}
          className="bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold"
        >
          {isSavingSeo ? (
            <><Loader2 size={14} className="mr-2 animate-spin" />Salvando...</>
          ) : (
            <><Save size={14} className="mr-2" />Salvar perfil</>
          )}
        </Button>
      </section>

      {/* SEO & Open Graph */}
      <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-foreground font-semibold">SEO & Open Graph</h2>
          <p className="text-muted-foreground text-xs mt-0.5">
            Controla como o teu perfil aparece no Google, WhatsApp e redes sociais.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground/70 text-sm">Título SEO</Label>
            <span className={`text-xs font-mono ${seoTitle.length > 55 ? "text-yellow-400" : "text-muted-foreground/40"}`}>
              {seoTitle.length}/60
            </span>
          </div>
          <Input
            value={seoTitle}
            onChange={(e) => setSeoTitle(e.target.value)}
            maxLength={60}
            placeholder={`@${profile?.username ?? "username"} | Stylohub`}
            className="bg-background border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:ring-stylo-gold"
          />
          <p className="text-muted-foreground/40 text-xs">Título exibido nos resultados do Google e ao partilhar o link.</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-foreground/70 text-sm">Descrição SEO</Label>
            <span className={`text-xs font-mono ${seoDescription.length > 150 ? "text-red-400" : "text-muted-foreground/40"}`}>
              {seoDescription.length}/160
            </span>
          </div>
          <textarea
            rows={2}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
            maxLength={160}
            placeholder="Ex: Todos os meus links, projetos e redes sociais num só lugar."
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground text-sm placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-stylo-gold/50 transition-colors"
          />
          <p className="text-muted-foreground/40 text-xs">Descrição exibida no Google e no preview ao partilhar no WhatsApp.</p>
        </div>

        <Button
          onClick={handleSaveSeo}
          disabled={isSavingSeo}
          className="bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold"
        >
          {isSavingSeo ? (
            <><Loader2 size={14} className="mr-2 animate-spin" />Salvando...</>
          ) : (
            <><Save size={14} className="mr-2" />Salvar SEO</>
          )}
        </Button>
      </section>

      {/* Danger zone */}
      <section className="bg-card border border-red-500/20 rounded-2xl p-6">
        <h2 className="text-red-400 font-semibold mb-1">Zona de perigo</h2>
        <p className="text-muted-foreground text-sm mb-5">
          Ações irreversíveis. Tenha certeza antes de prosseguir.
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 bg-transparent"
            >
              <Trash2 size={15} className="mr-2" />
              Excluir minha conta
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                Tem certeza absoluta?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Essa ação é permanente e não pode ser desfeita. Sua conta, página de links, dados
                e assinatura serão excluídos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-border text-foreground/70 hover:text-foreground hover:bg-muted/50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Sim, excluir minha conta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
