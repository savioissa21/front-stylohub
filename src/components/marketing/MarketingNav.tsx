"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";

export function MarketingNav() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-3 md:gap-8">
        <ThemeToggle />
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/marketing/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            Preços
          </Link>
          <Link href="/dashboard/links">
            <button className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
              <LayoutDashboard size={15} />
              Ir para Dashboard
            </button>
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-3">
          <Link href="/dashboard/links">
            <button className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={13} />
              Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 md:gap-8">
      <ThemeToggle />
      {/* Desktop */}
      <nav className="hidden md:flex items-center gap-8">
        <Link
          href="/marketing/pricing"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          Preços
        </Link>
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          Entrar
        </Link>
        <Link href="/auth/register">
          <button className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            Começar Grátis
          </button>
        </Link>
      </nav>

      {/* Mobile */}
      <div className="flex md:hidden items-center gap-3">
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          Entrar
        </Link>
        <Link href="/auth/register">
          <button className="btn-gold-glow bg-stylo-gold hover:bg-stylo-gold-hover text-black text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            Começar Grátis
          </button>
        </Link>
      </div>
    </div>
  );
}
