import type { Widget } from "./widget";

export type BgType = "SOLID_COLOR" | "GRADIENT" | "IMAGE";
export type ButtonStyle = "ROUNDED" | "SQUARED" | "PILL" | "OUTLINE" | "HARD_SHADOW";
export type ShadowStyle = "NONE" | "SOFT" | "GLOW" | "HARD";
export type Plan = "FREE" | "PRO";

export interface Theme {
  bgType: BgType;
  bgValue: string;
  primaryColor: string;
  textColor: string;
  buttonStyle: ButtonStyle;
  isCustom: boolean;
  // PRO fields
  borderColor: string;
  shadowStyle: ShadowStyle;
}

export interface Profile {
  id: string;
  username: string;
  avatarUrl?: string;
  theme: Theme;
  plan: Plan;
  widgets: Widget[];
}

export interface UpdateThemeRequest {
  bgType: BgType;
  bgValue: string;
  primaryColor: string;
  textColor: string;
  buttonStyle: ButtonStyle;
  isCustom: boolean;
  borderColor: string;
  shadowStyle: ShadowStyle;
}
