import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Syne, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Stylohub — Seu link, sua identidade",
    template: "%s | Stylohub",
  },
  description:
    "Crie uma página de links personalizada e profissional em segundos. Conecte sua audiência a tudo que você cria.",
  keywords: ["linktree", "link na bio", "página de links", "criadores"],
  openGraph: {
    title: "Stylohub — Seu link, sua identidade",
    description: "Crie uma página de links personalizada e profissional.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${plusJakartaSans.variable} ${geistMono.variable} ${syne.variable}`}>
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              {children}
              <Toaster richColors position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
