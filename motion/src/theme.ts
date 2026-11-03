import { FONT_FAMILIES } from "./fonts";

export const FPS = 60;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const sec = (s: number): number => Math.round(s * FPS);

// Brand palette sampled from the Fahim Khan logo
export const COLORS = {
  navy: "#0b1220",
  navyGlass: "rgba(11, 18, 32, 0.88)",
  green: "#3ddc84",
  cyan: "#22d3ee",
  amber: "#fbbf24",
  white: "#ffffff",
  muted: "#94a3b8",
} as const;

export const FONTS = {
  display: FONT_FAMILIES.display,
  mono: FONT_FAMILIES.mono,
} as const;

export const SFX_VOLUME = 0.35;
