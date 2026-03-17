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
    <section className="relative overflow-hidden bg-stylo-dark min-h-screen flex items-center">
      {/* Radial gold glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-stylo-gold opacity-[0.07] blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-stylo-gold opacity-[0.04] blur-[80px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left — Copy */}
          <div>
            <motion.div
              {...fadeUpProps(0)}
              className="inline-flex items-center gap-2 bg-stylo-gold/10 border border-stylo-gold/20 rounded-full px-4 py-1.5 text-xs text-stylo-gold font-medium mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-stylo-gold animate-pulse" />
              Plataforma #1 de bio links no Brasil
            </motion.div>

            <motion.h1
              {...fadeUpProps(0.12)}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-5 sm:mb-6"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Seu link.
              <br />
              Sua{" "}
              <span className="text-gold-gradient">identidade.</span>
            </motion.h1>

            <motion.p
              {...fadeUpProps(0.24)}
              className="text-white/55 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-lg"
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
              <div className="flex flex-1 items-center bg-stylo-surface border border-white/10 rounded-xl overflow-hidden focus-within:border-stylo-gold/50 transition-colors">
                <span className="pl-4 text-white/40 text-sm font-medium whitespace-nowrap">
                  stylohub.io/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seunome"
                  className="flex-1 bg-transparent text-white placeholder:text-white/25 text-sm py-3 pr-4 outline-none"
                />
              </div>
              <button
                type="submit"
                className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                Criar meu link
                <ArrowRight size={15} />
              </button>
            </motion.form>

            <motion.p
              {...fadeUpProps(0.48)}
              className="mt-4 text-white/30 text-xs"
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
              <div className="absolute inset-0 rounded-3xl bg-stylo-gold opacity-10 blur-3xl scale-90" />

              {/* Phone frame */}
              <div className="relative w-64 bg-zinc-950 rounded-[2.5rem] border-2 border-white/10 shadow-2xl overflow-hidden">
                {/* Notch */}
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-20 h-5 bg-black rounded-full" />
                </div>

                {/* Profile area */}
                <div className="px-5 py-4 flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-stylo-gold/20 border-2 border-stylo-gold/40 flex items-center justify-center mb-2">
                    <span className="text-stylo-gold text-lg font-bold">S</span>
                  </div>
                  <p className="text-white font-semibold text-sm">@stylohub</p>
                  <p className="text-white/40 text-xs mt-0.5 mb-5">
                    Criador de conteúdo ✨
                  </p>

                  {/* Mock link buttons */}
                  <div className="w-full space-y-2.5">
                    {MOCK_LINKS.map((link) => (
                      <div
                        key={link.label}
                        className="w-full bg-stylo-gold/10 border border-stylo-gold/20 rounded-xl py-2.5 text-center"
                      >
                        <span className="text-white text-xs font-medium">{link.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="flex justify-center pb-3 pt-2">
                  <div className="w-24 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
