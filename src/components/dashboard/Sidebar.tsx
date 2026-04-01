"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Link2,
  Palette,
  BarChart2,
  Users,
  QrCode,
  Settings,
  Crown,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  plan: "FREE" | "PRO";
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  proLocked?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Links", icon: <Link2 size={18} />, href: "/dashboard/links" },
  { label: "Aparência", icon: <Palette size={18} />, href: "/dashboard/appearance" },
  {
    label: "Analytics",
    icon: <BarChart2 size={18} />,
    href: "/dashboard/analytics",
    proLocked: true,
  },
  { label: "Leads", icon: <Users size={18} />, href: "/dashboard/leads", proLocked: true },
  { label: "QR Code", icon: <QrCode size={18} />, href: "/dashboard/qrcode" },
  { label: "Configurações", icon: <Settings size={18} />, href: "/dashboard/settings" },
  { label: "Assinatura", icon: <Crown size={18} />, href: "/dashboard/billing" },
];

export function Sidebar({ plan, username, displayName, avatarUrl }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="flex flex-col h-full bg-card border-r border-border w-64 transition-all duration-300">
      {/* Logo + Toggle */}
      <div className="px-6 h-16 flex items-center justify-between border-b border-border">
        <Link href="/dashboard/links">
          <span
            className="text-xl font-bold text-gold-gradient"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            Stylohub
          </span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const isLocked = item.proLocked && plan === "FREE";

          return (
            <Link
              key={item.href}
              href={isLocked ? "/dashboard/billing" : item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                isActive
                  ? "bg-stylo-gold/10 text-stylo-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <span
                className={`transition-colors ${
                  isActive ? "text-stylo-gold" : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {isLocked && (
                <Lock size={13} className="text-muted-foreground/30 shrink-0" />
              )}
              {isActive && !isLocked && (
                <ChevronRight size={13} className="text-stylo-gold/60 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-3 py-4 border-t border-border">
        {/* ... plan badge code ... */}
        {plan === "FREE" && (
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-2 px-3 py-2 mb-2 bg-stylo-gold/8 border border-stylo-gold/15 rounded-xl hover:bg-stylo-gold/12 transition-colors"
          >
            <Crown size={14} className="text-stylo-gold" />
            <span className="text-stylo-gold text-xs font-semibold">Upgrade para PRO</span>
          </Link>
        )}
        {plan === "PRO" && (
          <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-stylo-gold/8 border border-stylo-gold/20 rounded-xl">
            <Crown size={14} className="text-stylo-gold" />
            <span className="text-stylo-gold text-xs font-semibold">Plano PRO ativo</span>
          </div>
        )}

        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-stylo-gold/20 border border-stylo-gold/30 flex items-center justify-center shrink-0 overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-stylo-gold text-xs font-bold uppercase">
                {(displayName ?? username).charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {displayName && (
              <p className="text-foreground text-sm font-medium truncate">{displayName}</p>
            )}
            <p className={`truncate ${displayName ? "text-muted-foreground text-xs" : "text-foreground text-sm font-medium"}`}>
              @{username}
            </p>
          </div>
          <button
            onClick={logout}
            className="text-muted-foreground hover:text-red-400 transition-colors"
            title="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
