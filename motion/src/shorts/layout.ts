import { WIDTH } from "../theme";

export const SOURCE = { width: 1920, height: 1080 } as const;

// Vertical stack: content | callouts + captions | webcam
export const SHORT_LAYOUT = {
  top: { y: 0, height: 1100 },
  band: { y: 1100, height: 300 },
  bottom: { y: 1400, height: 520 },
  calloutBand: { top: 1108, height: 140 },
  captions: { top: 1252, height: 140 },
} as const;

export const panelAspect = (height: number): number => WIDTH / height;
