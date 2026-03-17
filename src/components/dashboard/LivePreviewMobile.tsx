"use client";

import { usePreviewStore } from "@/store/usePreviewStore";
import type { Widget } from "@/types/widget";
import type { Theme } from "@/types/profile";

function getButtonRadius(buttonStyle: Theme["buttonStyle"]) {
  switch (buttonStyle) {
    case "PILL":
      return "9999px";
    case "SQUARED":
      return "4px";
    case "ROUNDED":
    default:
      return "12px";
  }
}

function MockWidget({ widget, theme }: { widget: Widget; theme: Theme }) {
  if (!widget.isActive) return null;

  if (widget.type === "LINK") {
    return (
      <div
        style={{
          backgroundColor: theme.primaryColor,
          borderRadius: getButtonRadius(theme.buttonStyle),
          color: theme.textColor === theme.primaryColor ? "#000" : theme.textColor,
        }}
        className="w-full py-2.5 text-center text-xs font-semibold truncate px-3"
      >
        {widget.config.title || "Link"}
      </div>
    );
  }

  if (widget.type === "VIDEO") {
    return (
      <div
        className="w-full aspect-video rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${theme.primaryColor}15`, border: `1px solid ${theme.primaryColor}30` }}
      >
        <span style={{ color: theme.primaryColor }} className="text-xs">▶ YouTube</span>
      </div>
    );
  }

  if (widget.type === "SPOTIFY") {
    return (
      <div
        className="w-full py-2 rounded-lg flex items-center justify-center gap-1.5 px-3"
        style={{ backgroundColor: `${theme.primaryColor}15`, border: `1px solid ${theme.primaryColor}30` }}
      >
        <span className="text-xs" style={{ color: theme.primaryColor }}>♫</span>
        <span className="text-xs truncate" style={{ color: theme.textColor, opacity: 0.7 }}>
          Spotify
        </span>
      </div>
    );
  }

  return null;
}

export function LivePreviewMobile() {
  const profile = usePreviewStore((s) => s.profile);

  const theme: Theme = profile?.theme ?? {
    bgType: "SOLID_COLOR",
    bgValue: "#09090B",
    primaryColor: "#D4AF37",
    textColor: "#FFFFFF",
    buttonStyle: "ROUNDED",
    isCustom: false,
  };

  const bgStyle: React.CSSProperties =
    theme.bgType === "GRADIENT"
      ? { background: theme.bgValue }
      : theme.bgType === "IMAGE"
      ? { backgroundImage: `url(${theme.bgValue})`, backgroundSize: "cover", backgroundPosition: "center" }
      : { backgroundColor: theme.bgValue };

  const sortedWidgets = profile
    ? [...profile.widgets].sort((a, b) => a.orderIndex - b.orderIndex)
    : [];

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-white/30 text-xs uppercase tracking-widest">Pré-visualização</p>

      {/* Phone frame */}
      <div className="relative">
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-[2rem] blur-xl bg-stylo-gold opacity-10 scale-90" />

        <div className="relative w-56 rounded-[2.2rem] border-2 border-white/10 overflow-hidden shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-center pt-2.5">
            <div className="w-16 h-4 bg-black rounded-full" />
          </div>

          {/* Profile content */}
          <div
            className="min-h-96 pt-8 pb-4 flex flex-col items-center gap-0 overflow-hidden"
            style={bgStyle}
          >
            {/* Overlay for image bg readability */}
            {theme.bgType === "IMAGE" && (
              <div className="absolute inset-0 bg-black/40" />
            )}

            <div className="relative z-10 w-full flex flex-col items-center px-4 pt-2">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full mb-2 flex items-center justify-center border-2"
                style={{ borderColor: `${theme.primaryColor}60`, backgroundColor: `${theme.primaryColor}20` }}
              >
                <span style={{ color: theme.primaryColor }} className="text-base font-bold">
                  {profile?.username?.charAt(0).toUpperCase() ?? "S"}
                </span>
              </div>

              {/* Username */}
              <p className="text-xs font-semibold mb-0.5" style={{ color: theme.textColor }}>
                @{profile?.username ?? "username"}
              </p>
              <p className="text-xs mb-4 opacity-50" style={{ color: theme.textColor }}>
                Criador de conteúdo
              </p>

              {/* Widgets */}
              <div className="w-full space-y-2">
                {sortedWidgets.slice(0, 5).map((widget) => (
                  <MockWidget key={widget.id} widget={widget} theme={theme} />
                ))}
                {sortedWidgets.length === 0 && (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-full py-2.5 rounded-xl"
                        style={{
                          backgroundColor: `${theme.primaryColor}15`,
                          border: `1px dashed ${theme.primaryColor}30`,
                        }}
                      />
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="flex justify-center py-2"
            style={{ backgroundColor: theme.bgValue }}
          >
            <div className="w-16 h-1 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
