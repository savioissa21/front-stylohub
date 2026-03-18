"use client";

import { publicApi } from "@/lib/api";
import type { Widget } from "@/types/widget";
import {
  ExternalLink,
  Github,
  Youtube,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Twitch,
  Mail,
  Music2,
  MessageCircle,
  Send,
  Globe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface LinkWidgetProps {
  widget: Widget;
  username: string;
}

const PLATFORM_ICONS: { pattern: RegExp; Icon: LucideIcon; label: string }[] = [
  { pattern: /instagram\.com/i,  Icon: Instagram,     label: "Instagram" },
  { pattern: /youtube\.com|youtu\.be/i, Icon: Youtube, label: "YouTube" },
  { pattern: /twitter\.com|x\.com/i, Icon: Twitter,   label: "X / Twitter" },
  { pattern: /github\.com/i,     Icon: Github,        label: "GitHub" },
  { pattern: /linkedin\.com/i,   Icon: Linkedin,      label: "LinkedIn" },
  { pattern: /facebook\.com/i,   Icon: Facebook,      label: "Facebook" },
  { pattern: /twitch\.tv/i,      Icon: Twitch,        label: "Twitch" },
  { pattern: /spotify\.com/i,    Icon: Music2,        label: "Spotify" },
  { pattern: /tiktok\.com/i,     Icon: Music2,        label: "TikTok" },
  { pattern: /wa\.me|whatsapp\.com/i, Icon: MessageCircle, label: "WhatsApp" },
  { pattern: /t\.me|telegram\.me/i,  Icon: Send,      label: "Telegram" },
  { pattern: /mailto:/i,         Icon: Mail,          label: "E-mail" },
];

function getPlatformIcon(url: string): LucideIcon {
  for (const { pattern, Icon } of PLATFORM_ICONS) {
    if (pattern.test(url)) return Icon;
  }
  return Globe;
}

/**
 * Renders a public-facing link button with auto-detected platform icon.
 * Styles are driven by CSS variables set by ThemeRenderer.
 */
export function LinkWidget({ widget, username }: LinkWidgetProps) {
  const { title, url } = widget.config;
  if (!url) return null;

  const PlatformIcon = getPlatformIcon(url);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    publicApi.trackClick(username, widget.id).catch(() => {});
    void e;
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group w-full flex items-center gap-3 py-3 px-5 font-semibold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:brightness-110"
      style={{
        backgroundColor: "var(--profile-btn-bg, var(--profile-primary))",
        color: "var(--profile-btn-text, var(--profile-text))",
        borderRadius: "var(--profile-btn-radius, 12px)",
        border: "var(--profile-btn-border, none)",
        boxShadow: "var(--profile-btn-shadow, none)",
      }}
    >
      <PlatformIcon
        size={16}
        className="shrink-0 opacity-75 group-hover:opacity-100 transition-opacity"
      />
      <span className="flex-1 text-center truncate">{title || url}</span>
      <ExternalLink
        size={13}
        className="shrink-0 opacity-40 group-hover:opacity-80 transition-opacity"
      />
    </a>
  );
}
