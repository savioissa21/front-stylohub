import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/**
 * Smart 404 page for public profile routes.
 * In the dynamic [username] route this could read the username param from the URL
 * to display a personalized message. Here we show a generic but friendly version.
 */
export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-stylo-dark flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 rounded-full bg-stylo-gold opacity-5 blur-[120px]" />
      </div>

      <div className="relative text-center max-w-md w-full">
        {/* 404 badge */}
        <div className="inline-flex items-center gap-2 bg-stylo-surface border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/40 font-medium mb-8">
          404 — Não encontrado
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-stylo-gold/10 border border-stylo-gold/20 flex items-center justify-center">
            <Sparkles size={36} className="text-stylo-gold" strokeWidth={1.5} />
          </div>
        </div>

        <h1
          className="text-3xl font-bold text-white mb-3"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          Perfil não encontrado
        </h1>

        <p className="text-white/50 text-base mb-2">
          O perfil que você está procurando não existe ou foi removido.
        </p>

        {/* Availability teaser */}
        <div className="inline-flex items-center gap-2 bg-stylo-gold/10 border border-stylo-gold/20 rounded-xl px-4 py-2.5 mb-8 mt-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-stylo-gold text-sm font-medium">
            Este link está disponível!
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Link href="/auth/register">
            <button className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black font-semibold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors">
              Criar meu perfil agora
              <ArrowRight size={16} />
            </button>
          </Link>

          <Link
            href="/marketing"
            className="text-white/40 hover:text-white/70 text-sm transition-colors"
          >
            Conhecer o Stylohub
          </Link>
        </div>
      </div>
    </div>
  );
}
