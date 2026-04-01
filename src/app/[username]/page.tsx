import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";

import { fetchProfile } from "@/lib/fetchProfile";
import type { Widget } from "@/types/widget";

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
      canonical: `https://${process.env.NEXT_PUBLIC_DOMAIN}/${username}`,
    },
    openGraph: {
      title,
      description,
      url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/${username}`,
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
          <div className="flex justify-center mb-5">
            {safeProfile.avatarUrl ? (
              <Image
                src={safeProfile.avatarUrl!}
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
          </div>

          {/* Name & bio */}
          <div className="text-center mb-8">
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
          </div>

          {/* Widgets */}
          <div className="space-y-3">
            {sortedWidgets.map((widget: Widget) => {
              if (widget.type === "LINK") {
                return (
                  <LinkWidget
                    key={widget.id}
                    widget={widget}
                    username={safeProfile.username}
                  />
                );
              }
              if (widget.type === "YOUTUBE" && widget.config.videoId) {
                return (
                  <YoutubeWidget
                    key={widget.id}
                    videoId={widget.config.videoId}
                    autoPlay={widget.config.autoPlay}
                    showControls={widget.config.showControls}
                  />
                );
              }
              if (widget.type === "SPOTIFY" && widget.config.spotifyUri) {
                const embedUrl = `https://open.spotify.com/embed/${widget.config.spotifyUri.replace("spotify:", "").replace(":", "/")}`;
                return (
                  <div key={widget.id} className="w-full rounded-xl overflow-hidden">
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
              }
              if (widget.type === "TIKTOK" && widget.config.videoId) {
                return <TikTokWidget key={widget.id} videoId={widget.config.videoId} />;
              }
              if (widget.type === "TWITCH") {
                return (
                  <TwitchWidget
                    key={widget.id}
                    channel={widget.config.channel}
                    clipSlug={widget.config.clipSlug}
                    isClip={widget.config.isClip ?? false}
                  />
                );
              }
              if (widget.type === "SOUNDCLOUD" && widget.config.trackUrl) {
                return (
                  <SoundCloudWidget
                    key={widget.id}
                    trackUrl={widget.config.trackUrl}
                    compact={widget.config.compact}
                  />
                );
              }
              if (widget.type === "TWITTER" && widget.config.tweetId) {
                return <TwitterWidget key={widget.id} tweetId={widget.config.tweetId} />;
              }
              if (widget.type === "DONATION_LINK") {
                return <DonationLinkWidget key={widget.id} config={widget.config} />;
              }
              if (widget.type === "PIX") {
                return <PixWidget key={widget.id} config={widget.config} />;
              }
              if (widget.type === "AFFILIATE_LINK") {
                return <AffiliateLinkWidget key={widget.id} config={widget.config} />;
              }
              if (widget.type === "LEAD_FORM") {
                return (
                  <LeadFormWidget
                    key={widget.id}
                    widget={widget}
                    username={safeProfile.username}
                  />
                );
              }
              if (widget.type === "TEXT" && widget.config.text) {
                return (
                  <p
                    key={widget.id}
                    className="text-center text-sm opacity-70 py-2"
                    style={{ color: safeProfile.theme.textColor }}
                  >
                    {widget.config.text}
                  </p>
                );
              }
              return null;
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
                  url: `https://${process.env.NEXT_PUBLIC_DOMAIN}/${safeProfile.username}`,
                },
              }),
            }}
          />
        </div>
      </main>
    </>
  );
}
