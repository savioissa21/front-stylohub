"use client";

import { publicApi } from "@/lib/api";
import type { Widget } from "@/types/widget";
import * as LucideIcons from "lucide-react";
import {
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkWidgetProps {
  widget: Widget;
  username: string;
}

const PLATFORM_ICONS: { pattern: RegExp; Icon: string; label: string }[] = [
  { pattern: /instagram\.com/i,  Icon: "Instagram",     label: "Instagram" },
  { pattern: /youtube\.com|youtu\.be/i, Icon: "Youtube", label: "YouTube" },
  { pattern: /twitter\.com|x\.com/i, Icon: "Twitter",   label: "X / Twitter" },
  { pattern: /github\.com/i,     Icon: "Github",        label: "GitHub" },
  { pattern: /linkedin\.com/i,   Icon: "Linkedin",      label: "LinkedIn" },
  { pattern: /facebook\.com/i,   Icon: "Facebook",      label: "Facebook" },
  { pattern: /twitch\.tv/i,      Icon: "Twitch",        label: "Twitch" },
  { pattern: /spotify\.com/i,    Icon: "Music2",        label: "Spotify" },
  { pattern: /tiktok\.com/i,     Icon: "Music2",        label: "TikTok" },
  { pattern: /wa\.me|whatsapp\.com/i, Icon: "MessageCircle", label: "WhatsApp" },
  { pattern: /t\.me|telegram\.me/i,  Icon: "Send",      label: "Telegram" },
  { pattern: /mailto:/i,         Icon: "Mail",          label: "E-mail" },
];

function getPlatformIcon(url: string): string {
  for (const { pattern, Icon } of PLATFORM_ICONS) {
    if (pattern.test(url)) return Icon;
  }
  return "Globe";
}

/**
 * Renders a public-facing link button with auto-detected platform icon.
 * Styles are driven by CSS variables set by ThemeRenderer.
 */
export function LinkWidget({ widget, username }: LinkWidgetProps) {
  const { title, url, thumbnail, iconName, animation, schedule } = widget.config;
  if (!url) return null;

  // Check scheduling
  const now = new Date();
  if (schedule?.startDate && new Date(schedule.startDate) > now) return null;
  if (schedule?.endDate && new Date(schedule.endDate) < now) return null;

  const platformIconName = getPlatformIcon(url);
  const activeIconName = iconName || platformIconName;
  const PlatformIcon = (LucideIcons as any)[activeIconName] || LucideIcons.Globe;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    publicApi.trackClick(username, widget.id).catch(() => {});
    void e;
  };

  const animationClass = 
    animation === "pulse" ? "animate-pulse-gold" :
    animation === "shake" ? "animate-shake" :
    animation === "bounce" ? "animate-bounce-soft" : "";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "group w-full flex items-center gap-3 py-2.5 px-3 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:brightness-110",
        animationClass
      )}
      style={{
        backgroundColor: "var(--profile-btn-bg, var(--profile-primary))",
        color: "var(--profile-btn-text, var(--profile-text))",
        borderRadius: "var(--profile-btn-radius, 12px)",
        border: "var(--profile-btn-border, none)",
        boxShadow: "var(--profile-btn-shadow, none)",
      }}
    >
      {thumbnail ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={thumbnail} 
            alt={title || ""} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <PlatformIcon
            size={18}
            className="opacity-75 group-hover:opacity-100 transition-opacity"
          />
        </div>
      )}
      
      <span className="flex-1 text-center truncate pr-10">{title || url}</span>

      <div className="absolute right-4 flex items-center gap-2">
        {thumbnail && (
          <PlatformIcon
            size={12}
            className="shrink-0 opacity-30 group-hover:opacity-60 transition-opacity hidden sm:block"
          />
        )}
        <ExternalLink
          size={13}
          className="shrink-0 opacity-25 group-hover:opacity-60 transition-opacity"
        />
      </div>
    </a>
  );
}
