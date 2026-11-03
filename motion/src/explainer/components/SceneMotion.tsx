import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { z } from "zod";
import { Sfx } from "../../components/Sfx";
import { back, ease } from "../motion";

const PUSH_IN = 0.045;
const ENTER_S = 0.5;
const FAST_S = 0.35;
const WHIP_PX = 1300;
const WHIP_BLUR = 26;
const ZOOM_FROM = 1.7;

/** How a scene arrives: `rise` (default spring up), `whip` (fast pan from the right with motion blur),
 *  `zoom` (punches through from close-up), `slide` (glides in from the right). */
export const Transition = z.enum(["rise", "whip", "zoom", "slide"]);
export type TransitionT = z.infer<typeof Transition>;

/** Reads `transition` from a raw visual; defaults to `rise`, throws on an unknown name. */
export const transitionOf = (sceneId: string, visual: unknown): TransitionT => {
  const raw = (visual as { transition?: unknown } | undefined)?.transition;
  if (raw === undefined) return "rise";
  const result = Transition.safeParse(raw);
  if (!result.success) throw new Error(`scene "${sceneId}" has an unknown transition "${String(raw)}" (use rise, whip, zoom, slide)`);
  return result.data;
};

interface Entry {
  transform: string;
  filter?: string;
}

const entryOf = (kind: TransitionT, t: number, shift: number): Entry => {
  switch (kind) {
    case "whip": {
      const p = ease(t, 0, FAST_S);
      return { transform: `translate(${(1 - p) * WHIP_PX}px, ${shift}px)`, filter: `blur(${(1 - p) * WHIP_BLUR}px)` };
    }
    case "zoom": {
      const p = ease(t, 0, ENTER_S);
      return { transform: `translateY(${shift}px) scale(${ZOOM_FROM - (ZOOM_FROM - 1) * p})`, filter: `blur(${(1 - p) * 16}px)` };
    }
    case "slide": {
      const p = ease(t, 0, ENTER_S);
      return { transform: `translate(${(1 - p) * 420}px, ${shift}px)` };
    }
    case "rise": {
      const inP = back(t, 0, ENTER_S);
      const settle = ease(t, 0, ENTER_S);
      return { transform: `translateY(${shift + (1 - settle) * 90}px) scale(${0.92 + 0.08 * inP})` };
    }
  }
};

interface SceneMotionProps {
  /** Vertical offset applied to the whole scene (px). */
  shift?: number;
  /** Play a whoosh on entry (skip for the first scene). */
  whoosh?: boolean;
  transition?: TransitionT;
  children: React.ReactNode;
}

/**
 * Keeps every scene moving: enters with its transition, then slowly pushes in for the
 * rest of its duration (a "camera" that never sits still).
 */
export const SceneMotion: React.FC<SceneMotionProps> = ({ shift = 0, whoosh = false, transition = "rise", children }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const dur = durationInFrames / fps;
  const push = 1 + PUSH_IN * Math.min(1, t / Math.max(dur, 0.1));
  const entry = entryOf(transition, t, shift);
  return (
    <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 40%" }}>
      <AbsoluteFill style={{ transform: entry.transform, filter: entry.filter, transformOrigin: "50% 40%" }}>
        {children}
      </AbsoluteFill>
      {whoosh ? <Sfx name="whoosh" at={0} volume={transition === "rise" ? 0.18 : 0.32} /> : null}
    </AbsoluteFill>
  );
};
