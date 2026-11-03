import { Rect, ShortConfig, Zones } from "../types";
import c1Words from "./data/ad13-c1.words.json";
import c2Words from "./data/ad13-c2.words.json";
import c3Words from "./data/ad13-c3.words.json";
import c4Words from "./data/ad13-c4.words.json";
import { SHORT_LAYOUT } from "./layout";
import { toWords } from "./words";

// Source: AndroidDevelopment13.mp4 (1920×1080). The webcam is a floating OBS projector
// window that moves between scenes, so each clip has its own crop rects.
const ZONES: Zones = { overlayBottom: SHORT_LAYOUT.top.height, calloutBand: SHORT_LAYOUT.calloutBand };

const CAM_STITCH_TOP_RIGHT: Rect = { x: 1280, y: 150, w: 600 };
const CAM_STITCH_BOTTOM_LEFT: Rect = { x: 52, y: 495, w: 600 };
const CAM_IDE_TOP_RIGHT: Rect = { x: 1320, y: 70, w: 600 };
const CAM_IDE_RIGHT: Rect = { x: 1352, y: 280, w: 568 };

// Source 121.6–163.8s
export const ad13Short01: ShortConfig = {
  id: "Ad13Short01",
  src: "ad13/ad13-c1.mp4",
  durationS: 42.2,
  zones: ZONES,
  segments: [{ from: 0, top: { x: 300, y: 30, w: 980 }, bottom: CAM_STITCH_TOP_RIGHT }],
  words: toWords(c1Words, "ad13-c1"),
  hook: { to: 2.4, kicker: "GOOGLE STITCH × AI", line1: "Full App Redesign", highlight: "2", rest: " Screenshots" },
  callouts: [
    { from: 2.6, to: 8.8, icon: "›", accent: "cyan", text: "Current UI screenshots → Stitch", mono: false },
    { from: 10.0, to: 17.5, icon: "⚡", accent: "cyan", text: "Stitch is generating screens…", mono: false },
    { from: 21.5, to: 26.5, icon: "✓", accent: "green", text: "Splash screen added", mono: false },
    { from: 31.9, to: 37.6, icon: "★", accent: "green", text: "New design system ready", mono: false },
  ],
  chips: {
    from: 37.8,
    to: 40.4,
    items: [
      { label: "GoogleStitch", at: 37.8 },
      { label: "UIRedesign", at: 38.4 },
      { label: "AndroidDev", at: 39.0 },
    ],
  },
  endCardFrom: 40.4,
};

// Source 247.1–302.8s. Stitch page until 22.28s, then IDE terminal; webcam moves at 23.99s.
const C2_TERMINAL: Rect = { x: 0, y: 150, w: 860 };
export const ad13Short02: ShortConfig = {
  id: "Ad13Short02",
  src: "ad13/ad13-c2.mp4",
  durationS: 55.7,
  zones: ZONES,
  segments: [
    { from: 0, top: { x: 900, y: 50, w: 960 }, bottom: CAM_STITCH_BOTTOM_LEFT },
    { from: 22.28, top: C2_TERMINAL, bottom: CAM_STITCH_BOTTOM_LEFT },
    { from: 23.99, top: C2_TERMINAL, bottom: CAM_IDE_TOP_RIGHT },
  ],
  words: toWords(c2Words, "ad13-c2"),
  hook: { to: 2.4, kicker: "CLAUDE CODE × STITCH MCP", line1: "Stop Leaking", highlight: "YOUR", rest: " API Key" },
  callouts: [
    { from: 2.6, to: 7.4, icon: "›", accent: "cyan", text: "Export → MCP → Claude Code", mono: false },
    { from: 7.6, to: 13.3, icon: "!", accent: "amber", text: "Paste key in terminal = leaked", mono: false },
    { from: 21.6, to: 29.5, icon: "›", accent: "cyan", text: "npx @davideast/stitch-mcp init", mono: true },
    { from: 34.9, to: 40.3, icon: "⇄", accent: "green", text: "Proxy: Claude ⇄ Stitch", mono: false },
    { from: 40.5, to: 47.0, icon: "✓", accent: "green", text: "API key never reaches Claude", mono: false },
  ],
  chips: {
    from: 48.3,
    to: 53.2,
    items: [
      { label: "APIKeySecurity", at: 48.3 },
      { label: "MCP", at: 49.0 },
      { label: "ClaudeCode", at: 49.7 },
    ],
  },
  endCardFrom: 53.2,
};

// Source 698.0–740.9s. Claude Code question prompt in the IDE terminal.
export const ad13Short03: ShortConfig = {
  id: "Ad13Short03",
  src: "ad13/ad13-c3.mp4",
  durationS: 42.9,
  zones: ZONES,
  segments: [{ from: 0, top: { x: 20, y: 110, w: 900 }, bottom: CAM_IDE_RIGHT }],
  words: toWords(c3Words, "ad13-c3"),
  hook: { to: 2.4, kicker: "AI REDESIGN TIP", line1: "Modernize,", highlight: "DON'T", rest: " Add Features" },
  callouts: [
    { from: 2.6, to: 6.9, icon: "›", accent: "cyan", text: "Goal: modernize the UI only", mono: false },
    { from: 7.4, to: 14.4, icon: "?", accent: "amber", text: "Rebuilding? Then add features", mono: false },
    { from: 21.7, to: 28.5, icon: "✓", accent: "green", text: "Product ready → ship as is", mono: false },
    { from: 28.7, to: 35.0, icon: "✓", accent: "green", text: "My scope > Stitch's ideas", mono: false },
  ],
  chips: {
    from: 35.2,
    to: 40.4,
    items: [
      { label: "ProductThinking", at: 35.2 },
      { label: "ScopeControl", at: 35.9 },
      { label: "ClaudeCode", at: 36.6 },
    ],
  },
  endCardFrom: 40.4,
};

// Source 752.5–798.5s. Terminal → emulator at 27.8s → Compose previews (no webcam) at 35.77s.
export const ad13Short04: ShortConfig = {
  id: "Ad13Short04",
  src: "ad13/ad13-c4.mp4",
  durationS: 46.0,
  zones: ZONES,
  segments: [
    { from: 0, top: { x: 200, y: 10, w: 1000 }, bottom: CAM_IDE_RIGHT },
    { from: 27.8, top: { x: 120, y: 10, w: 1000 }, bottom: CAM_IDE_RIGHT },
    { from: 35.77, top: { x: 40, y: 10, w: 1000 }, bottom: { x: 1050, y: 250, w: 700 } },
  ],
  words: toWords(c4Words, "ad13-c4"),
  hook: { to: 2.4, kicker: "CLAUDE CODE × STITCH", line1: "The Final", highlight: "NEW", rest: " UI Reveal" },
  callouts: [
    { from: 2.6, to: 10.0, icon: "›", accent: "cyan", text: "Claude checks UI on emulator", mono: false },
    { from: 10.6, to: 16.3, icon: "⚡", accent: "green", text: "Fully automatic", mono: false },
    { from: 17.1, to: 22.0, icon: "✓", accent: "green", text: "Runs all unit tests", mono: false },
    { from: 22.1, to: 27.2, icon: "★", accent: "cyan", text: "Setup: everything-claude-code", mono: false },
    { from: 29.3, to: 35.6, icon: "↺", accent: "amber", text: "Same process, my old app", mono: false },
    { from: 36.0, to: 41.4, icon: "✓", accent: "green", text: "New MapApp UI", mono: false },
  ],
  chips: {
    from: 41.6,
    to: 43.3,
    items: [
      { label: "ClaudeCode", at: 41.6 },
      { label: "GoogleStitch", at: 42.1 },
      { label: "Compose", at: 42.6 },
    ],
  },
  endCardFrom: 43.3,
};

export const AD13_SHORTS = [ad13Short01, ad13Short02, ad13Short03, ad13Short04] as const;
