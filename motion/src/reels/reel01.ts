import { ReelConfig } from "../types";

// Source 348.9–389.66s. Layout: IDE + webcam top, captions y 1085–1230, zoomed terminal bottom.
export const reel01: ReelConfig = {
  id: "Reel01",
  src: "reel01.mp4",
  durationS: 40.766,
  zones: {
    overlayBottom: 1085,
    calloutBand: { top: 1462, height: 150 },
    sidePanel: { left: 640, top: 175, width: 410 },
  },
  hook: { to: 2.4, kicker: "CLAUDE CODE × REA MCP", line1: "Reverse Engineer", highlight: "ANY", rest: " Android App" },
  tracker: {
    from: 2.4,
    to: 38.6,
    steps: [
      { label: "Install REA MCP", start: 0, done: 7 },
      { label: "Fix decompiler (jadx)", start: 14.1, done: 24.1 },
      { label: "Decompile MindReader.apk", start: 24.1, done: 38.6 },
    ],
  },
  callouts: [
    { from: 2.6, to: 7.0, icon: "✓", accent: "green", text: "REA MCP connected to Claude Code", mono: false },
    { from: 14.1, to: 21.2, icon: "!", accent: "amber", text: "No decompiler found → install jadx", mono: false },
    { from: 24.1, to: 31.6, icon: "›", accent: "cyan", text: "Use REA to decompile MindReader.apk", mono: true },
  ],
  chips: {
    from: 31.7,
    to: 38.6,
    items: [
      { label: "App Logic", at: 31.7 },
      { label: "Lifecycle", at: 34.0 },
      { label: "Traffic", at: 37.0 },
      { label: "Activities", at: 37.8 },
    ],
  },
  endCardFrom: 38.6,
};
