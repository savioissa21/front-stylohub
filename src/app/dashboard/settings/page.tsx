"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/queries/useProfile";
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
import { Copy, Check, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const [copied, setCopied] = useState(false);

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
        <h1 className="text-2xl font-bold text-white">Configurações</h1>
        <p className="text-white/40 text-sm mt-0.5">Gerencie sua conta e preferências.</p>
      </div>

      {/* Account info */}
      <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-semibold">Informações da conta</h2>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Nome de usuário</Label>
          <div className="flex items-center gap-2">
            <span className="text-white/40 text-sm bg-stylo-dark border border-white/10 rounded-md px-3 py-2">
              @
            </span>
            <Input
              value={profile?.username ?? user?.username ?? ""}
              readOnly
              className="bg-stylo-dark border-white/10 text-white/70 cursor-not-allowed"
            />
          </div>
          <p className="text-white/30 text-xs">Para alterar o nome de usuário, contate o suporte.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">E-mail</Label>
          <Input
            value={user?.email ?? ""}
            readOnly
            className="bg-stylo-dark border-white/10 text-white/70 cursor-not-allowed"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">URL do seu perfil</Label>
          <div className="flex gap-2">
            <Input
              value={profileUrl}
              readOnly
              className="bg-stylo-dark border-white/10 text-white/50 flex-1"
            />
            <Button
              type="button"
              onClick={handleCopyUrl}
              variant="outline"
              className="border-white/15 text-white/70 hover:text-white bg-transparent shrink-0"
            >
              {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
            </Button>
          </div>
        </div>
      </section>

      {/* SEO & Open Graph (future feature) */}
      <section className="bg-stylo-surface border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">SEO & Open Graph</h2>
          <span className="text-xs bg-white/8 text-white/40 border border-white/10 px-2 py-0.5 rounded-full">
            Em breve
          </span>
        </div>

        <div className="space-y-1.5 opacity-50 pointer-events-none">
          <Label className="text-white/70 text-sm">Meta título</Label>
          <Input
            placeholder="Título exibido ao compartilhar no WhatsApp, Twitter..."
            className="bg-stylo-dark border-white/10 text-white placeholder:text-white/30"
            disabled
          />
        </div>

        <div className="space-y-1.5 opacity-50 pointer-events-none">
          <Label className="text-white/70 text-sm">Meta descrição</Label>
          <textarea
            rows={2}
            placeholder="Descrição exibida ao compartilhar..."
            className="w-full bg-stylo-dark border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-white/30 resize-none opacity-50"
            disabled
          />
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-stylo-surface border border-red-500/20 rounded-2xl p-6">
        <h2 className="text-red-400 font-semibold mb-1">Zona de perigo</h2>
        <p className="text-white/40 text-sm mb-5">
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
          <AlertDialogContent className="bg-stylo-surface border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Tem certeza absoluta?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-white/50">
                Essa ação é permanente e não pode ser desfeita. Sua conta, página de links, dados
                e assinatura serão excluídos permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-white/15 text-white/70 hover:text-white hover:bg-white/5">
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
