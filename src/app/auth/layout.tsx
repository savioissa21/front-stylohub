import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      {/* Top bar */}
      <header className="px-8 py-5 flex items-center border-b border-border/40">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="Stylohub" width={32} height={32} />
          <span
            className="text-foreground font-semibold text-lg tracking-wide"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Stylohub
          </span>
        </Link>
      </header>

      {/* Ambient light - more subtle in light mode */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-100"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(212,175,55,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <main className="flex-1 flex items-center justify-center">
        {children}
      </main>

      <footer className="py-4 text-center text-xs text-muted-foreground/40 border-t border-border/40">
        © {new Date().getFullYear()} Stylohub. Todos os direitos reservados.
      </footer>
    </div>
  );
}
