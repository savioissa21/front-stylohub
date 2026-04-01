import Link from "next/link";
import type { ReactNode } from "react";
import { MarketingNav } from "@/components/marketing/MarketingNav";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/marketing">
            <span
              className="text-xl font-bold text-gold-gradient"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              Stylohub
            </span>
          </Link>

          <MarketingNav />
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <span
                className="text-lg font-bold text-gold-gradient"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                Stylohub
              </span>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                Seu link. Sua identidade. A plataforma de bio links mais elegante do Brasil.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-foreground/70 text-sm font-semibold mb-3">Produto</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/marketing/pricing"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    Preços
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    Criar conta
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    Entrar
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-foreground/70 text-sm font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/marketing/terms"
                    className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                  >
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-center text-muted-foreground/30 text-xs font-medium">
            © {new Date().getFullYear()} Stylohub. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
