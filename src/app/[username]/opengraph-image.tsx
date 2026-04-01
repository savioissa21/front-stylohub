import { ImageResponse } from "next/og";
import { fetchProfile } from "@/lib/fetchProfile";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await fetchProfile(username);

  // Load Plus Jakarta Sans from Google Fonts (CSS variables unavailable in edge runtime)
  let fontData: ArrayBuffer | null = null;
  try {
    const fontRes = await fetch(
      "https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoaomQNQcsA88c7O9yZ4KMCoOg4IA6-91aHEjcWuA_KU7NSg.woff2"
    );
    if (fontRes.ok) fontData = await fontRes.arrayBuffer();
  } catch { /* degrade to system font */ }

  const rawDisplayName = profile?.displayName || profile?.username || username;
  const displayName = rawDisplayName.length > 40 ? rawDisplayName.slice(0, 37) + "…" : rawDisplayName;
  const bio = profile?.bio
    ? profile.bio.length > 100
      ? profile.bio.slice(0, 97) + "…"
      : profile.bio
    : null;
  const avatarUrl = profile?.avatarUrl ?? null;
  const rawBgColor = profile?.theme?.primaryColor ?? "#111827";
  const bgColor = /^#[0-9a-fA-F]{6}$/.test(rawBgColor) ? rawBgColor : "#111827";

  // Determine if background is light or dark to pick text colors
  const isLight = (() => {
    const hex = bgColor.replace("#", "");
    if (hex.length !== 6) return false;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  })();
  const textColor = isLight ? "#111827" : "#ffffff";
  const subtextColor = isLight ? "#4b5563" : "#d1d5db";

  // Fetch avatar as base64 (required for ImageResponse — no external URLs)
  let avatarSrc: string | null = null;
  if (avatarUrl) {
    try {
      const avatarRes = await fetch(avatarUrl);
      if (avatarRes.ok) {
        const buf = await avatarRes.arrayBuffer();
        const mime = (avatarRes.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
        const bytes = new Uint8Array(buf);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
        avatarSrc = `data:${mime};base64,${btoa(binary)}`;
      }
    } catch {
      // fall through to initials fallback
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bgColor,
          padding: "60px",
          gap: "16px",
        }}
      >
        {/* Avatar or initials */}
        {avatarSrc ? (
          <img
            src={avatarSrc}
            width={120}
            height={120}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              backgroundColor: isLight ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 700,
              color: textColor,
            }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Name */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: textColor,
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {displayName}
        </div>

        {/* @username */}
        <div
          style={{
            fontSize: 24,
            color: subtextColor,
            textAlign: "center",
          }}
        >
          @{username}
        </div>

        {/* Bio */}
        {bio && (
          <div
            style={{
              fontSize: 20,
              color: subtextColor,
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            {bio}
          </div>
        )}

        {/* Stylohub branding — bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 60,
            fontSize: 18,
            color: subtextColor,
            letterSpacing: "0.05em",
          }}
        >
          stylohub
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "PlusJakartaSans", data: fontData, style: "normal", weight: 700 }]
        : [],
    }
  );
}
