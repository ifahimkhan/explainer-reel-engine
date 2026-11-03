import { interpolate, spring } from "remotion";
import { FPS } from "./theme";

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Spring 0→1 starting at `delay` frames. */
export const pop = (frame: number, delay = 0, damping = 14): number =>
  spring({ frame: frame - delay, fps: FPS, config: { damping, mass: 0.7 } });

/** Linear 1→0 over the last `len` frames before `end`. */
export const fadeOut = (frame: number, end: number, len = 12): number =>
  interpolate(frame, [end - len, end], [1, 0], CLAMP);

export const lerp = (frame: number, input: [number, number], output: [number, number]): number =>
  interpolate(frame, input, output, CLAMP);
