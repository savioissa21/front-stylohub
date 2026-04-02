"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  plan: "FREE" | "PRO";
  price: number;
  yearlyPrice: number;
  isYearly: boolean;
  features: string[];
  ctaLabel: string;
  onCta: () => void;
}

export function PricingCard({
  plan,
  price,
  yearlyPrice,
  isYearly,
  features,
  ctaLabel,
  onCta,
}: PricingCardProps) {
  const isPro = plan === "PRO";
  const displayPrice = isYearly ? yearlyPrice : price;

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 shadow-sm ${
        isPro
          ? "bg-card border-2 border-stylo-gold shadow-[0_0_40px_rgba(212,175,55,0.12)]"
          : "bg-card border border-border"
      }`}
    >
      {/* Popular badge */}
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-stylo-gold text-black text-[10px] font-bold px-4 py-1 rounded-full whitespace-nowrap uppercase tracking-widest">
            Mais Popular
          </span>
        </div>
      )}

      {/* Plan name */}
      <div className="mb-2">
        <span
          className={`text-[10px] font-bold tracking-widest uppercase ${
            isPro ? "text-stylo-gold" : "text-foreground/60"
          }`}
        >
          {plan}
        </span>
      </div>

      {/* Price */}
      <div className="mb-6">
        {displayPrice === 0 ? (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-foreground">Grátis</span>
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-muted-foreground/60 text-sm font-bold">R$</span>
            <span className="text-4xl font-bold text-foreground">{displayPrice.toFixed(2).replace(".", ",")}</span>
            <span className="text-muted-foreground/60 text-sm font-medium">/mês</span>
          </div>
        )}
        {isPro && isYearly && (
          <p className="text-muted-foreground/40 text-[10px] font-bold mt-1 uppercase tracking-wide">
            Cobrado anualmente · R$ {(yearlyPrice * 12).toFixed(2).replace(".", ",")}
          </p>
        )}
      </div>

      {/* CTA */}
      <Button
        onClick={onCta}
        className={`w-full h-11 font-bold rounded-xl transition-all active:scale-[0.98] ${
          isPro
            ? "btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black shadow-lg"
            : "bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border"
        }`}
      >
        {ctaLabel}
      </Button>

      {/* Divider */}
      <div className="border-t border-border mb-6" />

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check
              size={15}
              className={`mt-0.5 shrink-0 ${isPro ? "text-stylo-gold" : "text-muted-foreground/60"}`}
            />
            <span className="text-muted-foreground text-sm font-medium">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
