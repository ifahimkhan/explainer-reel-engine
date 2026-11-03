import type React from "react";
import { Easing, interpolate } from "remotion";

/** Start time for an animation that never fires (interpolate rejects Infinity). */
export const NEVER = 1e6;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
const BACK_OUT = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Eased 0→1 progress for time `t` starting at `at`, lasting `dur` seconds. */
export const ease = (t: number, at: number, dur = 0.4): number =>
  interpolate(t, [at, at + dur], [0, 1], { ...CLAMP, easing: EASE_OUT });

/** Overshooting 0→1 used for pops. */
export const back = (t: number, at: number, dur = 0.45): number =>
  interpolate(t, [at, at + dur], [0, 1], { ...CLAMP, easing: BACK_OUT });

export const range = (t: number, input: [number, number], output: [number, number]): number =>
  interpolate(t, input, output, CLAMP);

/** Fade + rise + slight scale entrance. */
export const enter = (t: number, at: number, rise = 30): React.CSSProperties => {
  const p = ease(t, at, 0.45);
  const s = back(t, at, 0.5);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * rise}px) scale(${0.94 + 0.06 * s})`,
  };
};

/** Typewriter: number of characters of `text` visible at `t`. */
export const typed = (text: string, t: number, at: number, cps = 28): string =>
  text.slice(0, Math.max(0, Math.floor((t - at) * cps)));
