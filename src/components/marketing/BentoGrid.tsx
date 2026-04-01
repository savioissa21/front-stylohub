"use client";

import { motion } from "framer-motion";
import { Link2, Palette, BarChart2, Users, Youtube, Globe } from "lucide-react";

interface BentoItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  isPro?: boolean;
  span?: "1" | "2";
}

const features: BentoItem[] = [
  {
    icon: <Link2 size={24} />,
    title: "Links ilimitados",
    description: "Adicione quantos links precisar. Organize, reordene e ative ou desative com um clique.",
    span: "1",
  },
  {
    icon: <Palette size={24} />,
    title: "Temas personalizados",
    description: "Escolha entre presets exclusivos ou crie o seu próprio com editor completo de cores e fontes.",
    span: "1",
  },
  {
    icon: <BarChart2 size={24} />,
    title: "Analytics em tempo real",
    description: "Acompanhe visualizações, cliques e taxa de conversão de cada link. Dados que importam.",
    isPro: true,
    span: "2",
  },
  {
    icon: <Users size={24} />,
    title: "Captura de Leads",
    description: "Adicione formulários à sua página e capture e-mails diretamente da sua bio.",
    isPro: true,
    span: "1",
  },
  {
    icon: <Youtube size={24} />,
    title: "YouTube & Spotify",
    description: "Incorpore vídeos e podcasts diretamente na sua página, sem sair dela.",
    span: "1",
  },
  {
    icon: <Globe size={24} />,
    title: "URL Personalizada",
    description: "Use seu próprio domínio. Profissionalismo total, do link ao conteúdo.",
    isPro: true,
    span: "1",
  },
];

const FU_EASE = "easeOut" as const;

export function BentoGrid() {
  return (
    <section className="bg-background py-24 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Tudo que você precisa,{" "}
            <span className="text-gold-gradient">num só lugar</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto font-medium">
            Do link básico ao funil completo de captação — o Stylohub cresce com o seu negócio.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: FU_EASE }}
              viewport={{ once: true, margin: "-50px" }}
              className={`relative bg-card border border-border rounded-2xl p-6 hover:border-stylo-gold/20 transition-all group shadow-sm ${
                feature.span === "2" ? "lg:col-span-2" : ""
              }`}
            >
              {/* PRO badge */}
              {feature.isPro && (
                <span className="absolute top-4 right-4 text-[10px] font-bold bg-stylo-gold/15 text-stylo-gold border border-stylo-gold/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  PRO
                </span>
              )}

              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-stylo-gold/10 border border-stylo-gold/15 flex items-center justify-center text-stylo-gold mb-4 group-hover:bg-stylo-gold/15 transition-colors shadow-sm">
                {feature.icon}
              </div>

              <h3 className="text-foreground font-bold text-base mb-2">{feature.title}</h3>
              <p className="text-muted-foreground/70 text-sm leading-relaxed font-medium">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
