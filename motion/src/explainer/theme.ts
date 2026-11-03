import { FONT_FAMILIES } from "../fonts";

export const EX_FPS = 30;
export const EX_WIDTH = 1080;
export const EX_HEIGHT = 1920;

/** Horizontal content gutter (px). */
export const GUTTER = 60;
export const CONTENT_W = EX_WIDTH - GUTTER * 2;

// Light "paper" palette used by the explainer reels
export const LIGHT = {
  paper: "#f5f3ee",
  ink: "#0f1115",
  sub: "#5b616b",
  muted: "#9aa0a8",
  line: "#e4e6e1",
  card: "#ffffff",
  dark: "#0d0f12",
  darkLine: "#262a31",
  green: "#1f9d55",
  greenHl: "#22a35a",
  greenSoft: "#dcfce7",
  greenGlow: "rgba(34, 163, 90, 0.18)",
  yellow: "#f5c84b",
  yellowSoft: "#fde68a",
  red: "#e5484d",
  youtube: "#ff0033",
  cyan: "#3aa7c9",
} as const;

export const EX_FONTS = {
  sans: FONT_FAMILIES.sans,
  mono: FONT_FAMILIES.mono,
} as const;

export const SHADOW = "0 18px 40px rgba(15, 17, 21, 0.08), 0 2px 6px rgba(15, 17, 21, 0.05)";

/** Vertical layout bands (px, 1080x1920 canvas). */
export const LAYOUT = {
  headerTop: 80,
  chipTop: 215,
  urlTop: 280,
  contentTop: 400,
  captionTop: 1300,
} as const;
