"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const FU_EASE = "easeOut" as const;
function fadeUpProps(delay: number) {
  return {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: FU_EASE },
  };
}

const MOCK_LINKS = [
  { label: "Meu Instagram", color: "#D4AF37" },
  { label: "Novo vídeo no YouTube", color: "#D4AF37" },
  { label: "Mentoria — vagas abertas", color: "#D4AF37" },
  { label: "Meu curso online", color: "#D4AF37" },
];

export function HeroSection() {
  const router = useRouter();
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    router.push(`/auth/register?username=${encodeURIComponent(username.trim())}`);
  };

  return (
    <section className="relative overflow-hidden bg-background text-foreground min-h-screen flex items-center transition-colors duration-300">
      {/* Radial gold glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-stylo-gold opacity-[0.08] dark:opacity-[0.07] blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-stylo-gold opacity-[0.05] dark:opacity-[0.04] blur-[80px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <motion.div
              {...fadeUpProps(0)}
              className="inline-flex items-center gap-2 bg-stylo-gold/10 border border-stylo-gold/20 rounded-full px-4 py-1.5 text-xs text-stylo-gold font-bold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-stylo-gold animate-pulse" />
              Plataforma #1 de bio links no Brasil
            </motion.div>

            <motion.h1
              {...fadeUpProps(0.12)}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-5 sm:mb-6"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Seu link.
              <br />
              Sua{" "}
              <span className="text-gold-gradient">identidade.</span>
            </motion.h1>

            <motion.p
              {...fadeUpProps(0.24)}
              className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-lg font-medium"
            >
              Crie uma página de links elegante que centraliza tudo que você cria — em segundos.
              Conecte sua audiência ao seu Instagram, YouTube, curso e muito mais.
            </motion.p>

            {/* Username claim form */}
            <motion.form
              {...fadeUpProps(0.36)}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-lg"
            >
              <div className="flex flex-1 items-center bg-card border border-border rounded-xl overflow-hidden focus-within:border-stylo-gold/50 transition-all shadow-sm">
                <span className="pl-4 text-muted-foreground/60 text-sm font-semibold whitespace-nowrap">
                  stylohub.io/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seunome"
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/40 text-sm py-3.5 pr-4 outline-none font-medium"
                />
              </div>
              <button
                type="submit"
                className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-bold text-sm px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all whitespace-nowrap active:scale-[0.98]"
              >
                Criar meu link
                <ArrowRight size={16} />
              </button>
            </motion.form>

            <motion.p
              {...fadeUpProps(0.48)}
              className="mt-4 text-muted-foreground/50 text-xs font-medium"
            >
              Grátis para sempre. Sem cartão de crédito.
            </motion.p>
          </div>

          {/* Right — Phone mockup */}
          <motion.div
            {...fadeUpProps(0.24)}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow behind phone */}
              <div className="absolute inset-0 rounded-3xl bg-stylo-gold opacity-15 blur-3xl scale-90" />

              {/* Phone frame */}
              <div className="relative w-64 bg-white dark:bg-zinc-950 rounded-[2.5rem] border-[3px] border-zinc-950 dark:border-zinc-800 shadow-2xl overflow-hidden transition-colors duration-300">
                {/* Notch */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-20 h-5 bg-zinc-950 rounded-full" />
                </div>

                {/* Profile area */}
                <div className="px-5 py-4 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-stylo-gold/20 border-2 border-stylo-gold/40 flex items-center justify-center mb-2">
                    <span className="text-stylo-gold text-lg font-bold">S</span>
                  </div>
                  <p className="text-zinc-900 dark:text-white font-bold text-sm">@stylohub</p>
                  <p className="text-zinc-500 dark:text-white/50 text-[10px] uppercase tracking-wider font-bold mt-0.5 mb-5">
                    Criador de conteúdo ✨
                  </p>

                  {/* Mock link buttons */}
                  <div className="w-full space-y-2.5">
                    {MOCK_LINKS.map((link) => (
                      <div
                        key={link.label}
                        className="w-full bg-zinc-50 dark:bg-stylo-gold/10 border border-zinc-200 dark:border-stylo-gold/20 rounded-xl py-2.5 text-center shadow-sm transition-all duration-200 hover:scale-[1.03] hover:bg-zinc-100 dark:hover:bg-stylo-gold/20 cursor-pointer active:scale-[0.97]"
                      >
                        <span className="text-zinc-800 dark:text-white text-[11px] font-bold">{link.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex justify-center pb-3 pt-2">
                  <div className="w-24 h-1 bg-zinc-200 dark:bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
