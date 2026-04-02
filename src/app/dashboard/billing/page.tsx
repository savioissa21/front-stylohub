"use client";

import { useState } from "react";
import { Crown, Check, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

import { useProfile } from "@/hooks/queries/useProfile";
import { creatorApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

const PRO_FEATURES = [
  "Links ilimitados",
  "Analytics completo (visualizações, cliques, CTR)",
  "Captura de leads com formulários",
  "Embed YouTube & Spotify",
  "Remove a marca Stylohub",
  "URL personalizada",
  "Temas avançados + editor de fontes",
  "Suporte prioritário",
];

export default function BillingPage() {
  const { data: profile } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const isPro = profile?.plan === "PRO";

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const res = await creatorApi.createCheckout();
      const { checkoutUrl } = res.data;
      window.location.href = checkoutUrl;
    } catch {
      toast.error("Erro ao iniciar checkout. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-2xl space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Assinatura</h1>
        <p className="text-muted-foreground/60 text-sm mt-0.5">Gerencie seu plano Stylohub.</p>
      </div>

      {/* Current plan card */}
      <div
        className={`bg-card rounded-2xl p-6 border ${
          isPro
            ? "border-stylo-gold shadow-[0_0_30px_rgba(212,175,55,0.10)]"
            : "border-border"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isPro ? "bg-stylo-gold/20" : "bg-muted/50"
            }`}
          >
            <Crown size={20} className={isPro ? "text-stylo-gold" : "text-muted-foreground/60"} />
          </div>
          <div>
            <p className="text-foreground font-semibold">
              Plano{" "}
              <span className={isPro ? "text-stylo-gold" : "text-foreground/60"}>
                {isPro ? "PRO" : "Gratuito"}
              </span>
            </p>
            <p className="text-muted-foreground/60 text-sm">
              {isPro ? "Acesso completo a todos os recursos" : "Recursos básicos incluídos"}
            </p>
          </div>
          {isPro && (
            <span className="ml-auto text-xs font-semibold bg-stylo-gold/15 text-stylo-gold border border-stylo-gold/25 px-3 py-1 rounded-full">
              Ativo
            </span>
          )}
        </div>
      </div>

      {/* PRO upgrade card (shown when FREE) */}
      {!isPro && (
        <div className="bg-card border-2 border-stylo-gold/40 rounded-2xl p-8 relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-stylo-gold opacity-5 blur-3xl rounded-full" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-stylo-gold" />
              <span
                className="text-lg font-bold text-gold-gradient"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                Upgrade para PRO
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Desbloqueie analytics, leads, embeds e muito mais.
            </p>

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-muted-foreground/60 text-sm">R$</span>
                <span className="text-4xl font-bold text-foreground">29,90</span>
                <span className="text-muted-foreground/60">/mês</span>
              </div>
              <p className="text-muted-foreground/20 text-xs mt-1">
                ou R$ 23,90/mês no plano anual (economize 20%)
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-8">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <Check size={14} className="text-stylo-gold shrink-0" />
                  <span className="text-foreground/70 text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold h-12 px-10 text-base"
            >
              {isLoading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <Crown size={18} className="mr-2" />
              )}
              {isLoading ? "Redirecionando..." : "Assinar PRO"}
            </Button>
          </div>
        </div>
      )}

      {/* PRO active state */}
      {isPro && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-foreground font-semibold mb-4">Recursos ativos</h2>
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <Check size={14} className="text-stylo-gold shrink-0" />
                <span className="text-foreground/70 text-sm">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-5 border-t border-border/50">
            <p className="text-muted-foreground/20 text-sm">
              Para cancelar sua assinatura, entre em contato:{" "}
              <a href="mailto:suporte@stylohub.io" className="text-stylo-gold hover:underline">
                suporte@stylohub.io
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
