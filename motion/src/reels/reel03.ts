import { ReelConfig } from "../types";

// Source ≈681.4–696.4s. Layout: code editor top (0–1120), webcam bottom-left, captions y ≈1330–1440.
export const reel03: ReelConfig = {
  id: "Reel03",
  src: "reel03.mp4",
  durationS: 15.0,
  zones: {
    overlayBottom: 1120,
    calloutBand: { top: 880, height: 150 },
  },
  hook: { to: 2.2, kicker: "REVERSE ENGINEERING", line1: "Fully Automated", highlight: "ZERO", rest: " Manual Work" },
  callouts: [
    { from: 2.4, to: 6.6, icon: "✓", accent: "green", text: "Working app cloned + UI upgraded", mono: false },
    { from: 6.8, to: 10.6, icon: "✓", accent: "cyan", text: "No need to think about the logic", mono: false },
  ],
  chips: {
    from: 10.8,
    to: 13.0,
    items: [
      { label: "GoogleStitch", at: 10.8 },
      { label: "Automated", at: 11.4 },
      { label: "ClaudeCode", at: 12.0 },
    ],
  },
  endCardFrom: 13.0,
};
