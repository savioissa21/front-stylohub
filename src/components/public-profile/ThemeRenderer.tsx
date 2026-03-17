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

    // Inject CSS variables
    root.style.setProperty("--profile-primary", theme.primaryColor);
    root.style.setProperty("--profile-text", theme.textColor);
    root.style.setProperty("--profile-bg", theme.bgValue);

    // Derive button radius from buttonStyle
    const radius =
      theme.buttonStyle === "PILL"
        ? "9999px"
        : theme.buttonStyle === "SQUARED"
        ? "4px"
        : "12px";
    root.style.setProperty("--profile-btn-radius", radius);

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
      // Clean up on unmount
      root.style.removeProperty("--profile-primary");
      root.style.removeProperty("--profile-text");
      root.style.removeProperty("--profile-bg");
      root.style.removeProperty("--profile-btn-radius");
      body.style.removeProperty("background");
      body.style.removeProperty("background-image");
      body.style.removeProperty("background-color");
    };
  }, [theme]);

  return null;
}
