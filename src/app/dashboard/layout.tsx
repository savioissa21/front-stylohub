"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { Link2, Palette, BarChart2, QrCode, Settings, LogOut } from "lucide-react";

import { useAuth } from "@/providers/AuthProvider";
import { useProfile } from "@/hooks/queries/useProfile";
import { usePreviewStore } from "@/store/usePreviewStore";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { LivePreviewMobile } from "@/components/dashboard/LivePreviewMobile";

const MOBILE_NAV = [
  { label: "Links", icon: Link2, href: "/dashboard/links" },
  { label: "Aparência", icon: Palette, href: "/dashboard/appearance" },
  { label: "Analytics", icon: BarChart2, href: "/dashboard/analytics" },
  { label: "QR Code", icon: QrCode, href: "/dashboard/qrcode" },
  { label: "Config", icon: Settings, href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, user, logout, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const setProfile = usePreviewStore((s) => s.setProfile);

  useEffect(() => {
    if (!authLoading && !token) router.replace("/auth/login");
  }, [authLoading, token, router]);

  useEffect(() => {
    if (profile) setProfile(profile);
  }, [profile, setProfile]);

  if (authLoading || (!token && !authLoading)) {
    return (
      <div className="min-h-screen bg-stylo-dark flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stylo-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const username = user?.username ?? profile?.username ?? "";

  return (
    <div className="min-h-screen bg-stylo-dark flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex h-screen sticky top-0 shrink-0">
        <Sidebar plan={profile?.plan ?? "FREE"} username={username} />
      </div>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-stylo-surface/95 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-4">
        <span
          className="text-lg font-bold text-gold-gradient"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          Stylohub
        </span>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-stylo-gold/20 border border-stylo-gold/30 flex items-center justify-center">
            <span className="text-stylo-gold text-xs font-bold uppercase">
              {username.charAt(0)}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-white/30 hover:text-red-400 transition-colors p-1"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-w-0">
        <main className="flex-1 min-w-0 overflow-y-auto pt-14 pb-20 md:pt-0 md:pb-0">
          {profileLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-6 h-6 border-2 border-stylo-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            children
          )}
        </main>

        {/* Live preview — xl+ only */}
        <div className="hidden xl:flex flex-col items-center justify-start pt-12 px-8 border-l border-white/5 sticky top-0 h-screen overflow-y-auto shrink-0">
          <LivePreviewMobile />
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stylo-surface/95 backdrop-blur-xl border-t border-white/8">
        <div className="flex items-center justify-around h-16 px-1">
          {MOBILE_NAV.map(({ label, icon: Icon, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-colors ${
                  isActive ? "text-stylo-gold" : "text-white/35"
                }`}
              >
                <Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium leading-none">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
