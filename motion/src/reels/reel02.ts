import { ReelConfig } from "../types";

// Source 433.96–478.01s. Same layout as reel01.
export const reel02: ReelConfig = {
  id: "Reel02",
  src: "reel02.mp4",
  durationS: 44.05,
  zones: {
    overlayBottom: 1085,
    calloutBand: { top: 1462, height: 150 },
    sidePanel: { left: 640, top: 175, width: 410 },
  },
  hook: { to: 2.4, kicker: "DECOMPILE → REBUILD", line1: "Claude Clones", highlight: "ANY", rest: " App's Logic" },
  tracker: {
    from: 2.4,
    to: 41.6,
    steps: [
      { label: "Decompile core math", start: 0, done: 5.9 },
      { label: "Verify + unit tests", start: 15.1, done: 25.9 },
      { label: "Rebuild in Compose app", start: 30.3, done: 41.6 },
    ],
  },
  callouts: [
    { from: 2.6, to: 5.9, icon: "›", accent: "cyan", text: "Core math lives in MainActivity", mono: false },
    { from: 6.0, to: 14.3, icon: "✓", accent: "green", text: "Claude cracked the trick", mono: false },
    { from: 15.1, to: 20.9, icon: "›", accent: "cyan", text: "Verify & rebuild from scratch", mono: true },
    { from: 21.3, to: 25.9, icon: "✓", accent: "green", text: "Unit tests passed", mono: false },
    { from: 30.3, to: 37.4, icon: "!", accent: "amber", text: "Recreating standalone logic…", mono: false },
  ],
  chips: {
    from: 37.4,
    to: 41.6,
    items: [
      { label: "JetpackCompose", at: 37.4 },
      { label: "Kotlin", at: 38.4 },
      { label: "FreshApp", at: 41.1 },
    ],
  },
  endCardFrom: 41.6,
};
