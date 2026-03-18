"use client";

import { useEffect } from "react";
import type { Theme } from "@/types/profile";

interface ThemeRendererProps {
  theme: Theme;
}

/**
 * Injects CSS custom properties derived from the profile theme into :root,
 * and applies the background style to the document body.
 */
export function ThemeRenderer({ theme }: ThemeRendererProps) {
  useEffect(() => {
    const root = document.documentElement;
    const borderColor = theme.borderColor ?? theme.primaryColor;

    root.style.setProperty("--profile-primary", theme.primaryColor);
    root.style.setProperty("--profile-text", theme.textColor);
    root.style.setProperty("--profile-bg", theme.bgValue);
    root.style.setProperty("--profile-border-color", borderColor);

    // Button radius
    const radius =
      theme.buttonStyle === "PILL"
        ? "9999px"
        : theme.buttonStyle === "SQUARED" || theme.buttonStyle === "HARD_SHADOW"
        ? "4px"
        : "12px";
    root.style.setProperty("--profile-btn-radius", radius);

    // Button appearance (OUTLINE = transparent bg, colored border)
    const isOutline = theme.buttonStyle === "OUTLINE";
    root.style.setProperty("--profile-btn-bg", isOutline ? "transparent" : theme.primaryColor);
    root.style.setProperty("--profile-btn-border", isOutline ? `2px solid ${borderColor}` : "none");
    root.style.setProperty("--profile-btn-text", isOutline ? borderColor : theme.textColor);

    // Shadow effect
    const shadow = (() => {
      switch (theme.shadowStyle) {
        case "SOFT": return "0 4px 16px rgba(0,0,0,0.30)";
        case "GLOW": return `0 0 20px 4px ${theme.primaryColor}55`;
        case "HARD": return `4px 4px 0px 0px ${borderColor}`;
        default: return "none";
      }
    })();
    root.style.setProperty("--profile-btn-shadow", shadow);

    // Apply background to body
    const body = document.body;
    body.style.removeProperty("background");
    body.style.removeProperty("background-image");
    body.style.removeProperty("background-color");

    if (theme.bgType === "GRADIENT") {
      body.style.background = theme.bgValue;
    } else if (theme.bgType === "IMAGE") {
      body.style.backgroundImage = `url(${theme.bgValue})`;
      body.style.backgroundSize = "cover";
      body.style.backgroundPosition = "center";
      body.style.backgroundAttachment = "fixed";
    } else {
      body.style.backgroundColor = theme.bgValue;
    }

    return () => {
      root.style.removeProperty("--profile-primary");
      root.style.removeProperty("--profile-text");
      root.style.removeProperty("--profile-bg");
      root.style.removeProperty("--profile-border-color");
      root.style.removeProperty("--profile-btn-radius");
      root.style.removeProperty("--profile-btn-bg");
      root.style.removeProperty("--profile-btn-border");
      root.style.removeProperty("--profile-btn-text");
      root.style.removeProperty("--profile-btn-shadow");
      body.style.removeProperty("background");
      body.style.removeProperty("background-image");
      body.style.removeProperty("background-color");
    };
  }, [theme]);

  return null;
}
