import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import * as motion from "framer-motion/client";

import { fetchProfile } from "@/lib/fetchProfile";
import type { Widget } from "@/types/widget";
// ... (rest of imports)

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN ?? "stylohub.app";

import { ThemeRenderer } from "@/components/public-profile/ThemeRenderer";
import { LinkWidget } from "@/components/public-profile/LinkWidget";
import { YoutubeWidget } from "@/components/public-profile/YoutubeWidget";
import { LeadFormWidget } from "@/components/public-profile/LeadFormWidget";
import { PoweredByFooter } from "@/components/public-profile/PoweredByFooter";
import { TikTokWidget } from "@/components/public-profile/TikTokWidget";
import { TwitchWidget } from "@/components/public-profile/TwitchWidget";
import { SoundCloudWidget } from "@/components/public-profile/SoundCloudWidget";
import { TwitterWidget } from "@/components/public-profile/TwitterWidget";
import DonationLinkWidget from "@/components/public-profile/DonationLinkWidget";
import PixWidget from "@/components/public-profile/PixWidget";
import AffiliateLinkWidget from "@/components/public-profile/AffiliateLinkWidget";

// ─── Dynamic metadata ────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const profile = await fetchProfile(username);
  if (!profile) return { title: "Perfil não encontrado | Stylohub" };

  const title = profile.seoTitle || `@${profile.username} | Stylohub`;
  const description =
    profile.seoDescription ||
    profile.bio ||
    `Todos os links de @${profile.username} em um só lugar. Acessa agora!`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://${DOMAIN}/${username}`,
    },
    openGraph: {
      title,
      description,
      url: `https://${DOMAIN}/${username}`,
      siteName: "Stylohub",
      type: "profile",
      // No `images` field here — opengraph-image.tsx handles it automatically
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ─── Page component ───────────────────────────────────────────────────────────
export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await fetchProfile(username);
  if (!profile) notFound();

  // TypeScript may not know notFound() throws — assert non-null:
  const safeProfile = profile!;

  const sortedWidgets = [...safeProfile.widgets]
    .filter((w) => w.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const isProUser = safeProfile.plan === "PRO";

  return (
    <>
      {/* Inject theme CSS variables and body background */}
      <ThemeRenderer theme={safeProfile.theme} />

      <main className="min-h-screen flex flex-col items-center pt-12 pb-10 px-4">
        <div className="w-full max-w-sm">
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-5"
          >
            {safeProfile.avatarUrl ? (
              <Image
                src={safeProfile.avatarUrl}
                alt={`@${safeProfile.username}`}
                width={112}
                height={112}
                priority
                className="w-28 h-28 rounded-full object-cover border-[3px]"
                style={{ borderColor: `${safeProfile.theme.primaryColor}70` }}
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full border-[3px] flex items-center justify-center text-3xl font-bold"
                style={{
                  borderColor: `${safeProfile.theme.primaryColor}70`,
                  backgroundColor: `${safeProfile.theme.primaryColor}20`,
                  color: safeProfile.theme.primaryColor,
                }}
              >
                {safeProfile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>

          {/* Name & bio */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-8"
          >
            {safeProfile.displayName && (
              <h1
                className="font-bold text-lg mb-0.5"
                style={{ color: safeProfile.theme.textColor }}
              >
                {safeProfile.displayName}
              </h1>
            )}
            <p
              className={`text-sm opacity-50 ${safeProfile.displayName ? "mb-1" : "font-bold text-lg mb-1"}`}
              style={{ color: safeProfile.theme.textColor }}
            >
              @{safeProfile.username}
            </p>
            {safeProfile.bio && (
              <p
                className="text-sm leading-snug opacity-70 max-w-xs mx-auto"
                style={{ color: safeProfile.theme.textColor }}
              >
                {safeProfile.bio}
              </p>
            )}
          </motion.div>

          {/* Widgets */}
          <div className="space-y-3">
            {sortedWidgets.map((widget: Widget, index: number) => {
              let widgetComponent = null;

              if (widget.type === "LINK") {
                widgetComponent = (
                  <LinkWidget
                    widget={widget}
                    username={safeProfile.username}
                  />
                );
              } else if (widget.type === "YOUTUBE" && widget.config.videoId) {
                widgetComponent = (
                  <YoutubeWidget
                    videoId={widget.config.videoId}
                    autoPlay={widget.config.autoPlay}
                    showControls={widget.config.showControls}
                  />
                );
              } else if (widget.type === "SPOTIFY" && widget.config.spotifyUri) {
                const embedUrl = `https://open.spotify.com/embed/${widget.config.spotifyUri.replace("spotify:", "").replace(":", "/")}`;
                widgetComponent = (
                  <div className="w-full rounded-xl overflow-hidden">
                    <iframe
                      src={embedUrl}
                      width="100%"
                      height={widget.config.compact ? "80" : "152"}
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="border-0 rounded-xl"
                    />
                  </div>
                );
              } else if (widget.type === "TIKTOK" && widget.config.videoId) {
                widgetComponent = <TikTokWidget videoId={widget.config.videoId} />;
              } else if (widget.type === "TWITCH") {
                widgetComponent = (
                  <TwitchWidget
                    channel={widget.config.channel}
                    clipSlug={widget.config.clipSlug}
                    isClip={widget.config.isClip ?? false}
                  />
                );
              } else if (widget.type === "SOUNDCLOUD" && widget.config.trackUrl) {
                widgetComponent = (
                  <SoundCloudWidget
                    trackUrl={widget.config.trackUrl}
                    compact={widget.config.compact}
                  />
                );
              } else if (widget.type === "TWITTER" && widget.config.tweetId) {
                widgetComponent = <TwitterWidget tweetId={widget.config.tweetId} />;
              } else if (widget.type === "DONATION_LINK") {
                widgetComponent = <DonationLinkWidget config={widget.config} />;
              } else if (widget.type === "PIX") {
                widgetComponent = <PixWidget config={widget.config} />;
              } else if (widget.type === "AFFILIATE_LINK") {
                widgetComponent = <AffiliateLinkWidget config={widget.config} />;
              } else if (widget.type === "LEAD_FORM") {
                widgetComponent = (
                  <LeadFormWidget
                    widget={widget}
                    username={safeProfile.username}
                  />
                );
              } else if (widget.type === "TEXT" && widget.config.text) {
                widgetComponent = (
                  <p
                    className="text-center text-sm opacity-70 py-2"
                    style={{ color: safeProfile.theme.textColor }}
                  >
                    {widget.config.text}
                  </p>
                );
              }

              if (!widgetComponent) return null;

              return (
                <motion.div
                  key={widget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2 + index * 0.1,
                    ease: [0.21, 0.47, 0.32, 0.98],
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {widgetComponent}
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <PoweredByFooter removable={isProUser} />

          {/* JSON-LD structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "ProfilePage",
                mainEntity: {
                  "@type": "Person",
                  name: safeProfile.displayName || safeProfile.username,
                  alternateName: `@${safeProfile.username}`,
                  ...(safeProfile.bio ? { description: safeProfile.bio } : {}),
                  ...(safeProfile.avatarUrl ? { image: safeProfile.avatarUrl } : {}),
                  url: `https://${DOMAIN}/${safeProfile.username}`,
                },
              }).replace(/</g, "\\u003c"),
            }}
          />
        </div>
      </main>
    </>
  );
}
