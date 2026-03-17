import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { publicApi } from "@/lib/api";
import type { Profile } from "@/types/profile";
import type { Widget } from "@/types/widget";

import { ThemeRenderer } from "@/components/public-profile/ThemeRenderer";
import { LinkWidget } from "@/components/public-profile/LinkWidget";
import { YoutubeWidget } from "@/components/public-profile/YoutubeWidget";
import { PoweredByFooter } from "@/components/public-profile/PoweredByFooter";

// ─── Dynamic metadata ────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  try {
    const res = await publicApi.getProfile(username);
    const profile: Profile = res.data;
    return {
      title: `@${profile.username} | Stylohub`,
      description: `Confira todos os links de @${profile.username} em um só lugar.`,
    };
  } catch {
    return { title: "Perfil não encontrado | Stylohub" };
  }
}

// ─── Page component ───────────────────────────────────────────────────────────
export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let profile: Profile;
  try {
    const res = await publicApi.getProfile(username);
    profile = res.data;
  } catch {
    notFound();
  }

  const sortedWidgets = [...profile.widgets]
    .filter((w) => w.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const isProUser = profile.plan === "PRO";

  return (
    <>
      {/* Inject theme CSS variables and body background */}
      <ThemeRenderer theme={profile.theme} />

      <main className="min-h-screen flex flex-col items-center pt-12 pb-10 px-4">
        <div className="w-full max-w-sm">
          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div
              className="w-20 h-20 rounded-full border-2 flex items-center justify-center text-2xl font-bold"
              style={{
                borderColor: `${profile.theme.primaryColor}60`,
                backgroundColor: `${profile.theme.primaryColor}20`,
                color: profile.theme.primaryColor,
              }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Username & bio */}
          <div className="text-center mb-8">
            <h1
              className="font-bold text-lg mb-1"
              style={{ color: profile.theme.textColor }}
            >
              @{profile.username}
            </h1>
          </div>

          {/* Widgets */}
          <div className="space-y-3">
            {sortedWidgets.map((widget: Widget) => {
              if (widget.type === "LINK") {
                return (
                  <LinkWidget
                    key={widget.id}
                    widget={widget}
                    username={profile.username}
                  />
                );
              }
              if (widget.type === "VIDEO" && widget.config.videoId) {
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
              if (widget.type === "TEXT" && widget.config.text) {
                return (
                  <p
                    key={widget.id}
                    className="text-center text-sm opacity-70 py-2"
                    style={{ color: profile.theme.textColor }}
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
        </div>
      </main>
    </>
  );
}
