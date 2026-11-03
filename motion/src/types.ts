export type Accent = "green" | "amber" | "cyan";

export interface Box {
  left: number;
  top: number;
  width: number;
}

export interface Zones {
  /** Bottom edge (px) of the area the hook card and end card may cover. */
  overlayBottom: number;
  /** Band for callouts and keyword chips. Must not intersect burned-in captions. */
  calloutBand: { top: number; height: number };
  sidePanel?: Box;
}

export interface Step {
  label: string;
  start: number;
  done: number;
}

export interface CalloutSpec {
  from: number;
  to: number;
  icon: string;
  accent: Accent;
  text: string;
  mono: boolean;
}

export interface ChipSpec {
  label: string;
  at: number;
}

export interface HookSpec {
  to: number;
  kicker: string;
  line1: string;
  highlight: string;
  rest: string;
}

/** All times are seconds relative to the start of the reel. */
export interface ReelConfig {
  id: string;
  src: string;
  durationS: number;
  zones: Zones;
  hook: HookSpec;
  tracker?: { from: number; to: number; steps: readonly Step[] };
  callouts: readonly CalloutSpec[];
  chips?: { from: number; to: number; items: readonly ChipSpec[] };
  endCardFrom: number;
}

/** Source-video crop. Height is derived from the target panel's aspect ratio. */
export interface Rect {
  x: number;
  y: number;
  w: number;
}

/** Crop pair active from `from` (s) until the next segment starts. */
export interface ShortSegment {
  from: number;
  top: Rect;
  bottom: Rect;
}

/** [start s, end s, text] relative to the clip start. */
export type Word = readonly [number, number, string];

/** Vertical short cut from a 16:9 long-form source: content panel on top, webcam panel below. */
export interface ShortConfig extends ReelConfig {
  segments: readonly ShortSegment[];
  words: readonly Word[];
}
