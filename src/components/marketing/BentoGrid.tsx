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
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: FU_EASE }}
              viewport={{ once: true, margin: "-50px" }}
              className={`relative bg-card border border-border rounded-3xl p-8 hover:border-stylo-gold/30 hover:shadow-[0_20px_40px_-12px_rgba(212,175,55,0.15)] transition-all duration-300 group overflow-hidden ${
                feature.span === "2" ? "lg:col-span-2" : ""
              }`}
            >
              {/* Animated background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-stylo-gold/0 via-transparent to-stylo-gold/0 group-hover:from-stylo-gold/[0.03] group-hover:to-transparent transition-all duration-500" />
              
              {/* Glass Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] dark:via-white/[0.02] to-transparent" />

              {/* PRO badge */}
              {feature.isPro && (
                <span className="absolute top-6 right-6 text-[10px] font-bold bg-stylo-gold/15 text-stylo-gold border border-stylo-gold/20 px-3 py-1 rounded-full uppercase tracking-widest z-10 shadow-sm">
                  PRO
                </span>
              )}

              <div className="relative z-10">
                {/* Icon with float animation on hover */}
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  className="w-14 h-14 rounded-2xl bg-stylo-gold/10 border border-stylo-gold/15 flex items-center justify-center text-stylo-gold mb-6 group-hover:bg-stylo-gold/20 group-hover:border-stylo-gold/30 transition-all duration-300 shadow-sm"
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-foreground font-bold text-xl mb-3 group-hover:text-gold-gradient transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground/70 text-sm leading-relaxed font-medium max-w-[280px]">
                  {feature.description}
                </p>
              </div>

              {/* Bottom decorative line */}
              <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-stylo-gold/0 to-transparent group-hover:via-stylo-gold/40 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
