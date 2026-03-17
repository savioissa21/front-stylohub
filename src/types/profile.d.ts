import type { Widget } from "./widget";

export type BgType = "SOLID_COLOR" | "GRADIENT" | "IMAGE";
export type ButtonStyle = "ROUNDED" | "SQUARED" | "PILL";
export type Plan = "FREE" | "PRO";

export interface Theme {
  bgType: BgType;
  bgValue: string;
  primaryColor: string;
  textColor: string;
  buttonStyle: ButtonStyle;
  isCustom: boolean;
}

export interface Profile {
  id: string;
  username: string;
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
}
