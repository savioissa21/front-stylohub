"use client";

import { useState } from "react";
import { Crown, Zap, Image, Palette, BarChart2, X } from "lucide-react";
import { toast } from "sonner";
import { creatorApi } from "@/lib/api";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

const PRO_PERKS = [
  { icon: <Palette size={15} />, text: "Botões OUTLINE e HARD_SHADOW" },
  { icon: <Zap size={15} />,     text: "Efeitos de sombra e glow nos botões" },
  { icon: <Image size={15} />,   text: "Avatar personalizado e widgets de imagem" },
  { icon: <BarChart2 size={15} />, text: "Analytics avançado e exportação de leads" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

export function UpgradeModal({ open, onClose, featureName }: Props) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await creatorApi.createCheckout();
      window.location.href = res.data.checkoutUrl;
    } catch {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border border-stylo-gold/30 text-foreground w-[calc(100vw-2rem)] max-w-sm mx-auto p-0 overflow-hidden rounded-2xl">
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-stylo-gold/20 via-stylo-gold/5 to-transparent px-6 pt-6 pb-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground/60 hover:text-foreground/70 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-stylo-gold/20 border border-stylo-gold/30 flex items-center justify-center">
              <Crown size={20} className="text-stylo-gold" />
            </div>
            <div>
              <p className="text-xs text-stylo-gold/70 font-medium uppercase tracking-wider">Funcionalidade PRO</p>
              <h2 className="text-foreground font-bold text-lg leading-tight">
                {featureName ?? "Upgrade para PRO"}
              </h2>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            Desbloqueia o teu potencial criativo e cresce mais rápido.
          </p>
        </div>

        {/* Perks list */}
        <div className="px-6 py-4 space-y-2.5">
          {PRO_PERKS.map((perk, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="text-stylo-gold/70 shrink-0">{perk.icon}</div>
              <span className="text-foreground/70 text-sm">{perk.text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-6 pb-6 pt-2 space-y-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-stylo-gold hover:bg-stylo-gold-hover text-black font-bold text-sm transition-colors disabled:opacity-60 btn-gold-glow"
          >
            {loading ? "Redirecionando..." : "Assinar PRO agora →"}
          </button>
          <button
            onClick={onClose}
            className="w-full text-muted-foreground/40 text-xs hover:text-muted-foreground transition-colors py-1"
          >
            Continuar no plano grátis
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
